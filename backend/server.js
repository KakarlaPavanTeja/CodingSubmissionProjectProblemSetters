const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

// NOTE: Using your specified Python path for local testing.
// For deployment, this might need to be adjusted on the server (e.g., just 'python3').
const PYTHON_EXECUTABLE = '/Library/Frameworks/Python.framework/Versions/3.13/bin/python3';

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: uploadDir + '/' });

app.use(cors());
app.use(express.json());

// A generic helper to run any Python script and handle its output
const executePythonScript = (scriptPath, args, res, outputFilename) => {
    const pythonProcess = spawn(PYTHON_EXECUTABLE, [scriptPath, ...args]);
    
    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => outputData += data.toString());
    pythonProcess.stderr.on('data', (data) => errorData += data.toString());

    pythonProcess.on('close', (code) => {
        // Clean up all temporary files passed in args
        args.forEach(filePath => fs.unlink(filePath, () => {}));

        if (code === 0 && outputData) {
            // Check if it's JSON or plain text to set the correct headers
            try {
                JSON.parse(outputData);
                res.setHeader('Content-Disposition', `attachment; filename=${outputFilename}`);
                res.setHeader('Content-Type', 'application/json');
            } catch (e) {
                res.setHeader('Content-Type', 'text/plain');
            }
            res.send(outputData);
        } else {
            res.status(500).json({
                message: `Failed to process files with script: ${path.basename(scriptPath)}`,
                error: errorData || "The script finished with an error and produced no output."
            });
        }
    });
};


// --- API Endpoints ---

// This endpoint is for the ORIGINAL internal tool (non-encrypted)
app.post('/api/process/create', upload.fields([ { name: 'luaFile', maxCount: 1 }, { name: 'testcasesFile', maxCount: 1 } ]), (req, res) => {
    if (!req.files.luaFile || !req.files.testcasesFile) return res.status(400).send('Missing required files.');
    const { luaFile, testcasesFile } = req.files;
    const scriptPath = path.join(__dirname, 'scripts', 'create_cq.py'); // Assumes a non-encrypting version of this script
    executePythonScript(scriptPath, [luaFile[0].path, testcasesFile[0].path], res, 'coding_questions.json');
});

// This endpoint is for the ORIGINAL internal tool (non-encrypted)
app.post('/api/process/update', upload.fields([ { name: 'existingJson', maxCount: 1 }, { name: 'luaFile', maxCount: 1 }, { name: 'testcasesFile', maxCount: 1 } ]), (req, res) => {
    if (!req.files.existingJson || !req.files.luaFile || !req.files.testcasesFile) return res.status(400).send('Missing required files.');
    const { existingJson, luaFile, testcasesFile } = req.files;
    const scriptPath = path.join(__dirname, 'scripts', 'update_cq.py'); // Assumes a non-encrypting version
    executePythonScript(scriptPath, [existingJson[0].path, luaFile[0].path, testcasesFile[0].path], res, 'coding_questions_updated.json');
});

// Endpoint for the Solutions Merger tool
app.post('/api/process/merge', upload.fields([ { name: 'cppFile', maxCount: 1 }, { name: 'pyFile', maxCount: 1 }, { name: 'javaFile', maxCount: 1 } ]), (req, res) => {
    if (!req.files.cppFile || !req.files.pyFile || !req.files.javaFile) return res.status(400).send('Missing required files for merging.');
    const { cppFile, pyFile, javaFile } = req.files;
    const scriptPath = path.join(__dirname, 'scripts', 'merge_solutions.py');
    executePythonScript(scriptPath, [cppFile[0].path, pyFile[0].path, javaFile[0].path], res, 'solutions.md');
});

// ### NEW ENDPOINT for the ID Changer tool ###
app.post('/api/process/regenerate-ids', upload.fields([{ name: 'jsonFile', maxCount: 1 }]), (req, res) => {
    if (!req.files.jsonFile) {
        return res.status(400).send('Missing JSON file.');
    }
    const jsonPath = req.files.jsonFile[0].path;
    const scriptPath = path.join(__dirname, 'scripts', 'regenerate_ids.py');
    executePythonScript(scriptPath, [jsonPath], res, 'coding_questions_new_ids.json');
});


app.listen(port, () => {
    console.log(`🚀 Coding Question Factory server listening at http://localhost:${port}`);
});

