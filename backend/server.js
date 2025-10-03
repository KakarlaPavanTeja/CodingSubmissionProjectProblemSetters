const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3001;

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
    console.error("FATAL ERROR: ENCRYPTION_KEY is not defined in the environment.");
    process.exit(1);
}

// --- FIX IS HERE ---
// Use the standard 'python3' command. Render's build system will find the correct path.
const PYTHON_EXECUTABLE = 'python3';

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: uploadDir + '/' });

// Use cors middleware to allow requests from any origin
app.use(cors());
app.use(express.json());

// --- The rest of your server.js file remains the same ---

const executeEncryptedScript = (scriptPath, args, res) => {
    const allArgs = [...args, ENCRYPTION_KEY];
    const pythonProcess = spawn(PYTHON_EXECUTABLE, [scriptPath, ...allArgs]);
    
    const chunks = [];
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => chunks.push(data));
    pythonProcess.stderr.on('data', (data) => errorData += data.toString());

    pythonProcess.on('close', (code) => {
        args.forEach(filePath => fs.unlink(filePath, () => {}));
        if (code === 0 && chunks.length > 0) {
            const outputBuffer = Buffer.concat(chunks);
            res.setHeader('Content-Disposition', 'attachment; filename=coding_questions.encrypted.json');
            res.setHeader('Content-Type', 'application/octet-stream');
            res.send(outputBuffer);
        } else {
            res.status(500).json({ message: "Failed to process encrypted files.", error: errorData || "The script finished with an error." });
        }
    });
};

const executePlaintextScript = (scriptPath, args, res, outputFilename) => {
    const pythonProcess = spawn(PYTHON_EXECUTABLE, [scriptPath, ...args]);
    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => outputData += data.toString());
    pythonProcess.stderr.on('data', (data) => errorData += data.toString());

    pythonProcess.on('close', (code) => {
        args.forEach(filePath => fs.unlink(filePath, () => {}));
        if (code === 0 && outputData) {
            try {
                JSON.parse(outputData);
                res.setHeader('Content-Disposition', `attachment; filename=${outputFilename}`);
                res.setHeader('Content-Type', 'application/json');
            } catch (e) {
                res.setHeader('Content-Type', 'text/plain');
            }
            res.send(outputData);
        } else {
            res.status(500).json({ message: `Failed to process files with script: ${path.basename(scriptPath)}`, error: errorData || "The script finished with an error." });
        }
    });
};

// --- API Endpoints ---
app.post('/api/process/create', upload.fields([ { name: 'luaFile', maxCount: 1 }, { name: 'testcasesFile', maxCount: 1 } ]), (req, res) => {
    if (!req.files.luaFile || !req.files.testcasesFile) return res.status(400).send('Missing required files.');
    const { luaFile, testcasesFile } = req.files;
    const scriptPath = path.join(__dirname, 'scripts', 'create_cq.py');
    executeEncryptedScript(scriptPath, [luaFile[0].path, testcasesFile[0].path], res);
});

app.post('/api/process/update', upload.fields([ { name: 'existingJson', maxCount: 1 }, { name: 'luaFile', maxCount: 1 }, { name: 'testcasesFile', maxCount: 1 } ]), (req, res) => {
    if (!req.files.existingJson || !req.files.luaFile || !req.files.testcasesFile) return res.status(400).send('Missing required files.');
    const { existingJson, luaFile, testcasesFile } = req.files;
    const scriptPath = path.join(__dirname, 'scripts', 'update_cq.py');
    executeEncryptedScript(scriptPath, [existingJson[0].path, luaFile[0].path, testcasesFile[0].path], res);
});

app.post('/api/process/merge', upload.fields([ { name: 'cppFile', maxCount: 1 }, { name: 'pyFile', maxCount: 1 }, { name: 'javaFile', maxCount: 1 } ]), (req, res) => {
    if (!req.files.cppFile || !req.files.pyFile || !req.files.javaFile) return res.status(400).send('Missing required files for merging.');
    const { cppFile, pyFile, javaFile } = req.files;
    const scriptPath = path.join(__dirname, 'scripts', 'merge_solutions.py');
    executePlaintextScript(scriptPath, [cppFile[0].path, pyFile[0].path, javaFile[0].path], res, 'solutions.md');
});

app.post('/api/process/regenerate-ids', upload.fields([{ name: 'jsonFile', maxCount: 1 }]), (req, res) => {
    if (!req.files.jsonFile) return res.status(400).send('Missing JSON file.');
    const scriptPath = path.join(__dirname, 'scripts', 'regenerate_ids.py');
    executePlaintextScript(scriptPath, [req.files.jsonFile[0].path], res, 'coding_questions_new_ids.json');
});

app.listen(port, () => {
    console.log(`🚀 Coding Question Factory server listening at http://localhost:${port}`);
});