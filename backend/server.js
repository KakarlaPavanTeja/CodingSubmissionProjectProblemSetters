
const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: uploadDir + '/' });

app.use(cors());
app.use(express.json());

const executePythonScript = (scriptPath, args, res) => {
    const pythonProcess = spawn('python3', [scriptPath, ...args]);
    let jsonData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
        jsonData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
        console.error(`Python Script Error: ${errorData}`);
    });

    pythonProcess.on('close', (code) => {
        args.forEach(filePath => fs.unlink(filePath, (err) => {
            if (err) console.error(`Failed to delete temp file: ${filePath}`, err);
        }));

        if (code === 0 && jsonData) {
            res.setHeader('Content-Disposition', 'attachment; filename=coding_questions.json');
            res.setHeader('Content-Type', 'application/json');
            res.send(jsonData);
        } else {
            res.status(500).json({
                message: "Failed to process files.",
                error: errorData || "The script finished with an error and produced no output."
            });
        }
    });
};

app.post('/api/process/create', upload.fields([
    { name: 'luaFile', maxCount: 1 },
    { name: 'testcasesFile', maxCount: 1 }
]), (req, res) => {
    if (!req.files.luaFile || !req.files.testcasesFile) {
        return res.status(400).send('Missing required files.');
    }
    const luaPath = req.files.luaFile[0].path;
    const testcasesPath = req.files.testcasesFile[0].path;
    const scriptPath = path.join(__dirname, 'scripts', 'create_cq.py');

    executePythonScript(scriptPath, [luaPath, testcasesPath], res);
});

app.post('/api/process/update', upload.fields([
    { name: 'existingJson', maxCount: 1 },
    { name: 'luaFile', maxCount: 1 },
    { name: 'testcasesFile', maxCount: 1 }
]), (req, res) => {
    if (!req.files.existingJson || !req.files.luaFile || !req.files.testcasesFile) {
        return res.status(400).send('Missing required files.');
    }
    const existingJsonPath = req.files.existingJson[0].path;
    const luaPath = req.files.luaFile[0].path;
    const testcasesPath = req.files.testcasesFile[0].path;
    const scriptPath = path.join(__dirname, 'scripts', 'update_cq.py');

    executePythonScript(scriptPath, [existingJsonPath, luaPath, testcasesPath], res);
});

app.listen(port, () => {
    console.log(`🚀 Coding Question Factory server listening at http://localhost:${port}`);
});
