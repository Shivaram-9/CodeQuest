const { workerData, parentPort } = require('worker_threads');
const { spawn } = require('child_process');
const { performance } = require('perf_hooks');

function runCode() {
    const { command, filePath, timeLimit, memoryLimit } = workerData;
    const startTime = performance.now();

    const process = spawn(command, [filePath], {
        timeout: timeLimit,
        maxBuffer: memoryLimit * 1024 * 1024 // Convert MB to bytes
    });

    let output = '';
    let error = '';

    process.stdout.on('data', (data) => {
        output += data.toString();
        parentPort.postMessage({ type: 'output', data: data.toString() });
    });

    process.stderr.on('data', (data) => {
        error += data.toString();
    });

    process.on('close', (code) => {
        const endTime = performance.now();
        const executionTime = endTime - startTime;

        // Get memory usage
        const memoryUsed = process.memoryUsage().heapUsed / 1024 / 1024; // Convert to MB

        parentPort.postMessage({
            type: 'stats',
            executionTime,
            memoryUsed
        });

        if (error) {
            throw new Error(error);
        }

        process.exit(code);
    });

    process.on('error', (err) => {
        throw err;
    });
}

runCode();