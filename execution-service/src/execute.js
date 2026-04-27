const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const util = require('util');
const execPromise = util.promisify(exec);

const TEMP_DIR = path.join(__dirname, 'temp');

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const getLanguageConfig = (language) => {
  switch (language) {
    case 'python':
      return {
        image: 'python:3.9-slim',
        command: `python main.py`,
        filename: 'main.py'
      };
    case 'cpp':
      return {
        image: 'gcc:latest',
        command: `g++ main.cpp -o out && ./out`,
        filename: 'main.cpp'
      };
    case 'java':
      return {
        image: 'eclipse-temurin:11', // Modern replacement for openjdk:11
        command: `javac Main.java && java Main`,
        filename: 'Main.java'
      };
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
};

const executeCode = async (language, code, testCases) => {
  const jobId = uuidv4();
  const jobDir = path.join(TEMP_DIR, jobId);
  
  if (!fs.existsSync(jobDir)) {
    fs.mkdirSync(jobDir, { recursive: true });
  }

  const config = getLanguageConfig(language);
  const filepath = path.join(jobDir, config.filename);

  fs.writeFileSync(filepath, code);

  const results = [];

  for (const testCase of testCases) {
    const inputPath = path.join(jobDir, 'input.txt');
    fs.writeFileSync(inputPath, testCase.input);

    const dockerCmd = `docker run --rm -v "${jobDir}:/app" -w /app -i ${config.image} sh -c "${config.command} < input.txt"`;
    
    try {
      const { stdout, stderr } = await execPromise(dockerCmd, { timeout: 10000 });
      
      const actualOutput = stdout.trim();
      const expectedOutput = testCase.expectedOutput.trim();
      
      results.push({
        input: testCase.input,
        expectedOutput,
        actualOutput,
        passed: actualOutput === expectedOutput,
        error: stderr
      });
    } catch (error) {
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: null,
        passed: false,
        error: error.message || error.stderr || 'Execution Error / Timeout'
      });
    } finally {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    }
  }

  // Cleanup job directory
  if (fs.existsSync(jobDir)) {
    fs.rmSync(jobDir, { recursive: true, force: true });
  }

  return results;
};

module.exports = { executeCode };
