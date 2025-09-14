const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const util = require('util');
const { VM } = require('vm2');
const os = require('os');

const execPromise = util.promisify(exec);

// Supported languages and their execution configurations
const LANGUAGE_CONFIGS = {
    javascript: {
        extension: 'js',
        executeCommand: 'node',
        setupCode: (code, input) => `
            const input = ${JSON.stringify(input)};
            ${code}
        `
    },
    python: {
        extension: 'py',
        executeCommand: 'python',
        setupCode: (code, input) => `
            input = ${JSON.stringify(input)}
            ${code}
        `
    },
    java: {
        extension: 'java',
        executeCommand: 'java',
        compileCommand: 'javac',
        setupCode: (code, input, className = 'Solution') => {
            // Extract the class name from the code if present
            const classMatch = code.match(/public\s+class\s+(\w+)/);
            const extractedClassName = classMatch ? classMatch[1] : className;
            
            return `
import java.util.*;
import java.io.*;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

public class ${extractedClassName} {
    public static void main(String[] args) {
        try {
            Gson gson = new Gson();
            // Parse input JSON
            Object input = gson.fromJson("${JSON.stringify(input).replace(/"/g, '\\"')}", Object.class);
            
            // User code starts here (excluding their main method)
            ${code.replace(/public\s+static\s+void\s+main\s*\([^)]*\)\s*\{[\s\S]*?\}/, '')}
            
            // Call the solution method and capture output
            Object output = null;
            ${extractedClassName === 'Main' ? 'output = solve(input);' : 'output = new Solution().solve(input);'}
            
            // Print the output as JSON
            System.out.println(gson.toJson(output));
        } catch (Exception e) {
            System.err.println(e.getMessage());
            e.printStackTrace();
        }
    }
}`;
        }
    },
    cpp: {
        extension: 'cpp',
        executeCommand: '',  // Will be set to the executable name
        compileCommand: 'g++',
        setupCode: (code, input) => `
#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <nlohmann/json.hpp>

using json = nlohmann::json;
using namespace std;

// User code without main function
${code.replace(/int\s+main\s*\([^)]*\)\s*\{[\s\S]*?\}/m, '')}

int main() {
    try {
        // Parse input JSON
        string inputStr = R"(${JSON.stringify(input)})";
        json input = json::parse(inputStr);
        
        // Call the solution function
        auto output = solve(input);
        
        // Print the output as JSON
        cout << json(output).dump() << endl;
    } catch (exception& e) {
        cerr << "Error: " << e.what() << endl;
        return 1;
    }
    return 0;
}
        `
    }
};

class CodeExecutor {
    constructor() {
        this.tempDir = path.join(__dirname, '../temp');
        this.initialize();
        this.javascriptConfig = {
            timeout: 5000,
            allowAsync: true,
            sandbox: {},
            compiler: "javascript"
        };
        this.pythonConfig = {
            timeout: 5000,
            pythonPath: 'python', // Adjust based on server configuration
            tempFilesDir: path.join(__dirname, '../temp')
        };
        // Ensure temp directory exists
        if (!fs.existsSync(this.pythonConfig.tempFilesDir)) {
            fs.mkdirSync(this.pythonConfig.tempFilesDir, { recursive: true });
        }
    }

    async initialize() {
        try {
            await fs.mkdir(this.tempDir, { recursive: true });
        } catch (error) {
            console.error('Error creating temp directory:', error);
        }
    }

    async cleanup(filePath) {
        try {
            await fs.unlink(filePath);
        } catch (error) {
            console.error('Error cleaning up file:', error);
        }
    }

    /**
     * Execute test cases for the given code
     * @param {string} code - Source code to execute
     * @param {string} language - Programming language
     * @param {Array} testCases - Array of test cases to execute
     * @param {number} timeLimit - Time limit in milliseconds
     * @param {boolean} isFullProgram - Force execution as a full program instead of auto-detecting
     * @returns {Array} Array of test execution results
     */
    static async executeTestCases(code, language, testCases, timeLimit = 1000, isFullProgram = null) {
        const executor = new CodeExecutor();
        
        const results = [];
        for (const testCase of testCases) {
            const result = await executor.executeTestCase(
                code, 
                language, 
                testCase.input, 
                testCase.expectedOutput, 
                timeLimit,
                isFullProgram
            );
            
            results.push({
                testCaseId: testCase._id,
                ...result
            });
        }
        
        return results;
    }

    /**
     * Execute a test case for a specific language
     * @param {string} code - Source code to execute
     * @param {string} language - Programming language (javascript, python)
     * @param {any} input - Input data for the test case
     * @param {any} expectedOutput - Expected output to compare against
     * @param {number} timeLimit - Time limit in milliseconds
     * @param {boolean} forceFullProgram - Force execution as a full program
     * @returns {Object} Test execution result
     */
    async executeTestCase(code, language, input, expectedOutput, timeLimit = 1000, forceFullProgram = null) {
        // Detect if code is a full program or a function, unless explicitly specified
        const isFullProgram = forceFullProgram !== null ? forceFullProgram : this.isFullProgram(code, language);
        
        switch (language) {
            case 'javascript':
                return isFullProgram 
                    ? await this.executeJavaScriptProgram(code, input, expectedOutput, timeLimit)
                    : await this.executeJavaScriptTests(code, input, expectedOutput, timeLimit, isFullProgram);
            case 'python':
                return isFullProgram
                    ? await this.executePythonProgram(code, input, expectedOutput, timeLimit)
                    : await this.executePythonTests(code, input, expectedOutput, timeLimit, isFullProgram);
            case 'java':
                return isFullProgram
                    ? await this.executeJavaProgram(code, input, expectedOutput, timeLimit)
                    : await this.executeJavaTestCase(code, input, expectedOutput, timeLimit);
            case 'cpp':
                return isFullProgram
                    ? await this.executeCppProgram(code, input, expectedOutput, timeLimit)
                    : await this.executeCppTestCase(code, input, expectedOutput, timeLimit);
            default:
            throw new Error(`Unsupported language: ${language}`);
        }
    }

    /**
     * Determine if the provided code is a full program or a function
     * @param {string} code - Source code to analyze
     * @param {string} language - Programming language
     * @returns {boolean} True if code appears to be a full program, false if it's a function
     */
    isFullProgram(code, language) {
        if (language === 'javascript') {
            // Check if code contains console.log or if it doesn't assign to output variable
            return code.includes('console.log') || !code.includes('output =');
        } else if (language === 'python') {
            // Check if code contains print statements or if it doesn't assign to output variable
            return code.includes('print(') || !code.includes('output =');
        } else if (language === 'java') {
            // Check if code contains a main method or System.out.println
            return code.includes('public static void main') || code.includes('System.out.print');
        } else if (language === 'cpp') {
            // Check if code contains a main function or cout
            return code.includes('int main') || code.includes('cout <<');
        }
        
        // Default to false for unknown languages
        return false;
    }

    /**
     * Execute JavaScript test case
     * @param {string} code - JavaScript code to execute
     * @param {any} input - Input data for the test case
     * @param {any} expectedOutput - Expected output to compare against
     * @param {number} timeLimit - Time limit in milliseconds
     * @param {boolean} isFullProgram - Whether the code is a full program or a function
     * @returns {Object} Test execution result
     */
    async executeJavaScriptTests(code, input, expectedOutput, timeLimit, isFullProgram) {
        const vm = new VM({
            timeout: timeLimit,
            sandbox: {},
            eval: false,
            wasm: false
        });

        let result;
        const startTime = performance.now();

        try {
            if (isFullProgram) {
                // Prepare the input for a full program
                const inputData = JSON.stringify(input);
                
                // Inject console.log capturing and input simulation
                const wrappedCode = `
                    const __output = [];
                    const __originalLog = console.log;
                    console.log = (...args) => {
                        __output.push(args.join(' '));
                        __originalLog(...args);
                    };

                    // Simulate input
                    const __input = ${inputData};
                    global.readline = (() => {
                        let __inputIndex = 0;
                        return () => {
                            if (Array.isArray(__input)) {
                                return __inputIndex < __input.length ? String(__input[__inputIndex++]) : '';
                            }
                            return String(__input);
                        };
                    })();

                    ${code}

                    __output.join('\\n');
                `;

                const output = vm.run(wrappedCode);
                
                // Process output to match expectedOutput format
                const processedOutput = this.processOutput(output, expectedOutput);
                
                const executionTime = performance.now() - startTime;
                result = this.compareResults(processedOutput, expectedOutput, executionTime);
            } else {
                // Function execution - existing implementation
                const wrappedCode = `
                    ${code}
                    if (typeof solution !== 'function') {
                        throw new Error('No solution function found');
                    }
                    solution;
                `;

                const solution = vm.run(wrappedCode);
                
                const startExecTime = performance.now();
                const output = solution(input);
                const executionTime = performance.now() - startExecTime;
                
                result = this.compareResults(output, expectedOutput, executionTime);
            }
        } catch (error) {
            result = {
                status: 'error',
                output: null,
                expectedOutput,
                error: error.message,
                executionTime: performance.now() - startTime
            };
        }

        return result;
    }

    /**
     * Execute JavaScript as a full program with console output
     * @private
     */
    async executeJavaScriptProgram(code, input, expectedOutput, timeLimit) {
        const fileName = `${crypto.randomBytes(8).toString('hex')}.js`;
        const filePath = path.join(this.tempDir, fileName);

        try {
            // Create JavaScript code file with input data and capturing console.log output
            const jsCode = `
const input = ${JSON.stringify(input)};

// Capture console.log output
const originalConsoleLog = console.log;
let capturedOutput = [];

console.log = (...args) => {
    capturedOutput.push(args.map(arg => {
        if (typeof arg === 'object') {
            return JSON.stringify(arg);
        }
        return String(arg);
    }).join(' '));
};

// User code
${code}

// Print the captured output as JSON
originalConsoleLog(JSON.stringify(capturedOutput));
`;
            
            await fs.writeFile(filePath, jsCode);
            
            // Execute JavaScript code with timeout
            const startTime = process.hrtime();
            
            let cmdResult;
            try {
                cmdResult = await execPromise(`node ${filePath}`, { 
                    timeout: timeLimit,
                    maxBuffer: 1024 * 1024 // 1MB output buffer
                });
            } catch (error) {
                if (error.killed) {
                    return {
                        passed: false,
                        output: null,
                        error: 'Time Limit Exceeded'
                    };
                }
                
                return {
                    passed: false,
                    output: null,
                    error: error.stderr || error.message
                };
            }
            
            // Calculate execution time
            const [seconds, nanoseconds] = process.hrtime(startTime);
            const executionTimeMs = (seconds * 1000) + (nanoseconds / 1000000);
            
            // Parse output
            let output;
            try {
                // Parse the captured console.log output
                output = JSON.parse(cmdResult.stdout.trim());
                
                // For comparison, join the array with newlines
                const formattedOutput = output.join('\n');
                
                // If expectedOutput is not a string, convert it to string for comparison
                let formattedExpected = expectedOutput;
                if (typeof expectedOutput !== 'string') {
                    formattedExpected = JSON.stringify(expectedOutput);
                }
                
                // Compare results
                const passed = this.compareResults(formattedOutput.trim(), formattedExpected.trim());
                
                return {
                    passed,
                    output: formattedOutput,
                    executionTime: executionTimeMs
                };
            } catch (error) {
                return {
                    passed: false,
                    output: cmdResult.stdout.trim(),
                    error: 'Output format error: ' + error.message
                };
            }
        } catch (error) {
            return {
                passed: false,
                output: null,
                error: error.message
            };
        } finally {
            await this.cleanup(filePath);
        }
    }

    /**
     * Execute Python test case
     * @param {string} code - Python code to execute
     * @param {any} input - Input data for the test case
     * @param {any} expectedOutput - Expected output to compare against
     * @param {number} timeLimit - Time limit in milliseconds
     * @param {boolean} isFullProgram - Whether the code is a full program or a function
     * @returns {Object} Test execution result
     */
    async executePythonTests(code, input, expectedOutput, timeLimit, isFullProgram) {
        // Create temporary files for code and input
        const tempDir = path.join(os.tmpdir(), 'code-executor');
        await fs.promises.mkdir(tempDir, { recursive: true });
        
        const tempId = crypto.randomBytes(8).toString('hex');
        const codePath = path.join(tempDir, `${tempId}.py`);
        const inputPath = path.join(tempDir, `${tempId}.in`);
        const outputPath = path.join(tempDir, `${tempId}.out`);

        try {
            let finalCode;
            
            if (isFullProgram) {
                // For full programs, just use the code as is
                finalCode = code;
                
                // Prepare input file
                let inputContent;
                if (Array.isArray(input)) {
                    inputContent = input.join('\n');
                } else if (typeof input === 'object') {
                    inputContent = JSON.stringify(input);
                    } else {
                    inputContent = String(input);
                }
                
                await fs.promises.writeFile(inputPath, inputContent);
            } else {
                // For function solutions, wrap the code to call the solution function
                finalCode = `
${code}

import json
import sys

def main():
    input_data = json.loads('''${JSON.stringify(input)}''')
    result = solution(input_data)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
`;
            }
            
            await fs.promises.writeFile(codePath, finalCode);
            
            const startTime = performance.now();
            
            let output;
            if (isFullProgram) {
                // Run with input redirection for full programs
                const { stdout, stderr } = await util.promisify(exec)(
                    `python "${codePath}" < "${inputPath}"`,
                    { timeout: timeLimit }
                );
                
                if (stderr) {
                    throw new Error(stderr);
                }
                
                output = stdout.trim();
                
                // Process output to match expectedOutput format
                output = this.processOutput(output, expectedOutput);
            } else {
                // Run normally for function-based solutions
                const { stdout, stderr } = await util.promisify(exec)(
                    `python "${codePath}"`,
                    { timeout: timeLimit }
                );
                
                if (stderr) {
                    throw new Error(stderr);
                }
                
                try {
                    output = JSON.parse(stdout.trim());
                } catch (e) {
                    // If not valid JSON, use as is
                    output = stdout.trim();
                }
            }
            
            const executionTime = performance.now() - startTime;
            return this.compareResults(output, expectedOutput, executionTime);
        } catch (error) {
            return {
                status: 'error',
                output: null,
                expectedOutput,
                error: error.message,
                executionTime: 0
            };
        } finally {
            // Clean up temp files
            this.cleanup([codePath, inputPath, outputPath]);
        }
    }

    /**
     * Process output to match the expected output format
     * @param {string} output - Raw output from program execution
     * @param {any} expectedOutput - Expected output to match against
     * @returns {any} Processed output that matches the expected output type
     */
    processOutput(output, expectedOutput) {
        if (typeof output !== 'string') return output;
        
        output = output.trim();
        
        // Convert to number if expectedOutput is a number
        if (typeof expectedOutput === 'number') {
            const num = parseFloat(output);
            if (!isNaN(num)) return num;
        }
        
        // Try to parse as JSON if expectedOutput is an object or array
        if (typeof expectedOutput === 'object') {
            try {
                return JSON.parse(output);
            } catch (e) {
                // Not valid JSON, continue with other checks
            }
        }
        
        // Try to convert to array if expectedOutput is an array and output has multiple lines
        if (Array.isArray(expectedOutput) && output.includes('\n')) {
            return output.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        }
        
        return output;
    }

    /**
     * Execute Python code for a test case
     * @private
     */
    async executePythonTestCase(code, input, expectedOutput, timeLimit) {
        const fileName = `${crypto.randomBytes(8).toString('hex')}.py`;
        const filePath = path.join(this.tempDir, fileName);
        
        try {
            // Create Python code file with input data and solution code
            const pythonCode = `
import json
import sys

# Input data
input = json.loads('''${JSON.stringify(input)}''')

# User code
${code}

# Print output as JSON
print(json.dumps(output))
`;
            
            await fs.writeFile(filePath, pythonCode);
            
            // Execute Python code with timeout
            const startTime = process.hrtime();
            
            let cmdResult;
            try {
                cmdResult = await execPromise(`python ${filePath}`, { 
                    timeout: timeLimit,
                    maxBuffer: 1024 * 1024 // 1MB output buffer
                });
            } catch (error) {
                if (error.killed && error.signal === 'SIGTERM') {
                    return {
                        passed: false,
                        output: null,
                        error: 'Time Limit Exceeded'
                    };
                }
                
                return {
                    passed: false,
                    output: null,
                    error: error.stderr || error.message
                };
            }
            
            // Calculate execution time
            const [seconds, nanoseconds] = process.hrtime(startTime);
            const executionTimeMs = (seconds * 1000) + (nanoseconds / 1000000);
            
            // Parse output
            let output;
            try {
                output = JSON.parse(cmdResult.stdout.trim());
            } catch (error) {
                return {
                    passed: false,
                    output: cmdResult.stdout.trim(),
                    error: 'Output format error: Expected JSON'
                };
            }
            
            // Compare results
            const passed = this.compareResults(output, expectedOutput);
            
            return {
                passed,
                output,
                executionTime: executionTimeMs
            };
        } catch (error) {
            return {
                passed: false,
                output: null,
                error: error.message
            };
        } finally {
            await this.cleanup(filePath);
        }
    }

    /**
     * Execute Python as a full program with print output
     * @private
     */
    async executePythonProgram(code, input, expectedOutput, timeLimit) {
        const fileName = `${crypto.randomBytes(8).toString('hex')}.py`;
        const filePath = path.join(this.tempDir, fileName);
        
        try {
            // Create Python code file with input data and code to capture print output
            const pythonCode = `
import json
import sys
import io

# Capture print output
original_stdout = sys.stdout
captured_output = io.StringIO()
sys.stdout = captured_output

# Input data
input = json.loads('''${JSON.stringify(input)}''')

# User code
${code}

# Restore stdout and print the captured output
sys.stdout = original_stdout
output_lines = captured_output.getvalue().strip().split('\\n')
print(json.dumps(output_lines))
`;
            
            await fs.writeFile(filePath, pythonCode);
            
            // Execute Python code with timeout
            const startTime = process.hrtime();
            
            let cmdResult;
            try {
                cmdResult = await execPromise(`python ${filePath}`, { 
                    timeout: timeLimit,
                    maxBuffer: 1024 * 1024 // 1MB output buffer
                });
            } catch (error) {
                if (error.killed) {
                    return {
                        passed: false,
                        output: null,
                        error: 'Time Limit Exceeded'
                    };
                }
                
                return {
                    passed: false,
                    output: null,
                    error: error.stderr || error.message
                };
            }
            
            // Calculate execution time
            const [seconds, nanoseconds] = process.hrtime(startTime);
            const executionTimeMs = (seconds * 1000) + (nanoseconds / 1000000);
            
            // Parse output
            try {
                // Parse the captured print output
                const output = JSON.parse(cmdResult.stdout.trim());
                
                // For comparison, join the array with newlines
                const formattedOutput = output.join('\n');
                
                // If expectedOutput is not a string, convert it to string for comparison
                let formattedExpected = expectedOutput;
                if (typeof expectedOutput !== 'string') {
                    formattedExpected = JSON.stringify(expectedOutput);
                }
                
                // Compare results
                const passed = this.compareResults(formattedOutput.trim(), formattedExpected.trim());
                
            return {
                passed,
                    output: formattedOutput,
                    executionTime: executionTimeMs
                };
            } catch (error) {
                return {
                    passed: false,
                    output: cmdResult.stdout.trim(),
                    error: 'Output format error: ' + error.message
                };
            }
        } catch (error) {
            return {
                passed: false,
                output: null,
                error: error.message
            };
        } finally {
            await this.cleanup(filePath);
        }
    }

    /**
     * Execute Java code for a test case
     * @private
     */
    async executeJavaTestCase(code, input, expectedOutput, timeLimit) {
        // Generate a random class name to avoid conflicts
        const className = `Solution_${crypto.randomBytes(4).toString('hex')}`;
        const fileName = `${className}.java`;
        const filePath = path.join(this.tempDir, fileName);
        
        try {
            // Prepare Java code with the Solution class
            let javaCode;
            
            // Check if the code already has a class definition
            if (code.includes('class Solution')) {
                javaCode = `
import java.util.*;
import com.google.gson.Gson;

${code}

// Main class to handle execution
public class ${className} {
    public static void main(String[] args) {
        try {
            Gson gson = new Gson();
            // Parse input JSON
            String inputJson = "${JSON.stringify(input).replace(/"/g, '\\"')}";
            Object inputObj = gson.fromJson(inputJson, Object.class);
            
            Solution solution = new Solution();
            Object output = solution.solve(inputObj);
            
            // Print output as JSON
            System.out.println(gson.toJson(output));
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}`;
            } else {
                // Wrap the code in a Solution class
                javaCode = `
import java.util.*;
import com.google.gson.Gson;

public class ${className} {
    public static void main(String[] args) {
        try {
            Gson gson = new Gson();
            // Parse input JSON
            String inputJson = "${JSON.stringify(input).replace(/"/g, '\\"')}";
            Object inputObj = gson.fromJson(inputJson, Object.class);
            
            // Create solution class and call solve method
            Solution solution = new Solution();
            Object output = solution.solve(inputObj);
            
            // Print output as JSON
            System.out.println(gson.toJson(output));
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

class Solution {
    public Object solve(Object input) {
        ${code}
        return output;
    }
}`;
            }
            
            await fs.writeFile(filePath, javaCode);
            
            // Compile Java code
            const startCompileTime = process.hrtime();
            try {
                await execPromise(`javac -cp .:${path.join(__dirname, '../lib/*')} ${filePath}`, {
                    timeout: timeLimit / 2, // Half the time for compilation
                });
        } catch (error) {
            return {
                passed: false,
                    output: null,
                    error: `Compilation Error: ${error.stderr || error.message}`
                };
            }
            
            // Calculate compilation time
            const [compileSeconds, compileNanoseconds] = process.hrtime(startCompileTime);
            const compilationTimeMs = (compileSeconds * 1000) + (compileNanoseconds / 1000000);
            
            // Execute the compiled Java program
            const startExecTime = process.hrtime();
            
            let cmdResult;
            try {
                cmdResult = await execPromise(`java -cp .:${this.tempDir}:${path.join(__dirname, '../lib/*')} ${className}`, { 
                    timeout: timeLimit - compilationTimeMs,
                    maxBuffer: 1024 * 1024 // 1MB output buffer
                });
            } catch (error) {
                if (error.killed) {
                    return {
                        passed: false,
                        output: null,
                        error: 'Time Limit Exceeded'
                    };
                }
                
                return {
                    passed: false,
                    output: null,
                    error: error.stderr || error.message
                };
            }
            
            // Calculate execution time
            const [execSeconds, execNanoseconds] = process.hrtime(startExecTime);
            const executionTimeMs = (execSeconds * 1000) + (execNanoseconds / 1000000);
            const totalTimeMs = compilationTimeMs + executionTimeMs;
            
            // Parse output
            let output;
            try {
                output = JSON.parse(cmdResult.stdout.trim());
            } catch (error) {
                return {
                    passed: false,
                    output: cmdResult.stdout.trim(),
                    error: 'Output format error: Expected JSON'
                };
            }
            
            // Compare results
            const passed = this.compareResults(output, expectedOutput);
            
            return {
                passed,
                output,
                executionTime: totalTimeMs
            };
        } catch (error) {
            return {
                passed: false,
                output: null,
                error: error.message
            };
        } finally {
            // Clean up Java files
            await this.cleanup(filePath);
            await this.cleanup(path.join(this.tempDir, `${className}.class`));
        }
    }

    /**
     * Execute Java as a full program with System.out.println output
     * @private
     */
    async executeJavaProgram(code, input, expectedOutput, timeLimit) {
        // Extract class name from the code or use a default
        const classMatch = code.match(/public\s+class\s+(\w+)/);
        const className = classMatch ? classMatch[1] : `Program_${crypto.randomBytes(4).toString('hex')}`;
        const fileName = `${className}.java`;
        const filePath = path.join(this.tempDir, fileName);
        
        try {
            // Create Java file with input data
            let javaCode;
            
            // Check if code includes a main method
            if (code.includes('public static void main')) {
                // Use the code as is, but add input handling and output capturing
                javaCode = `
import java.util.*;
import java.io.*;
import com.google.gson.Gson;

// Redirect System.out to capture output
class OutputCapturer {
    private static final ByteArrayOutputStream outContent = new ByteArrayOutputStream();
    private static final PrintStream originalOut = System.out;
    
    public static void start() {
        System.setOut(new PrintStream(outContent));
    }
    
    public static void stop() {
        System.setOut(originalOut);
    }
    
    public static String getOutput() {
        return outContent.toString();
    }
}

${code.replace(/public\s+static\s+void\s+main\s*\([^)]*\)\s*\{/, 'public static void main(String[] args) {\n        // Prepare input data\n        Gson gson = new Gson();\n        Object input = gson.fromJson("' + JSON.stringify(input).replace(/"/g, '\\"') + '", Object.class);\n        \n        // Start output capturing\n        OutputCapturer.start();\n        try {')}
        } finally {
            // Stop capturing and print the captured output as JSON
            OutputCapturer.stop();
            String capturedOutput = OutputCapturer.getOutput();
            
            // Print the captured output in a format we can parse later
            System.out.println("___OUTPUT_DELIMITER___");
            System.out.println(capturedOutput);
        }
    }
}`;
            } else {
                // Create a wrapper class with main method
                javaCode = `
import java.util.*;
import java.io.*;
import com.google.gson.Gson;

public class ${className} {
    public static void main(String[] args) {
        // Prepare input data
        Gson gson = new Gson();
        Object input = gson.fromJson("${JSON.stringify(input).replace(/"/g, '\\"')}", Object.class);
        
        // Create output capture stream
        ByteArrayOutputStream outContent = new ByteArrayOutputStream();
        PrintStream originalOut = System.out;
        System.setOut(new PrintStream(outContent));
        
        try {
            ${code}
        } finally {
            // Restore original output
            System.setOut(originalOut);
            
            // Print captured output with delimiter for parsing
            System.out.println("___OUTPUT_DELIMITER___");
            System.out.println(outContent.toString());
        }
    }
}`;
            }
            
            await fs.writeFile(filePath, javaCode);
            
            // Compile Java code
            const startCompileTime = process.hrtime();
            try {
                await execPromise(`javac -cp .:${path.join(__dirname, '../lib/*')} ${filePath}`, {
                    timeout: timeLimit / 2, // Half the time for compilation
                });
            } catch (error) {
                return {
                    passed: false,
                    output: null,
                    error: `Compilation Error: ${error.stderr || error.message}`
                };
            }
            
            // Calculate compilation time
            const [compileSeconds, compileNanoseconds] = process.hrtime(startCompileTime);
            const compilationTimeMs = (compileSeconds * 1000) + (compileNanoseconds / 1000000);
            
            // Execute the compiled Java program
            const startExecTime = process.hrtime();
            
            let cmdResult;
            try {
                cmdResult = await execPromise(`java -cp .:${this.tempDir}:${path.join(__dirname, '../lib/*')} ${className}`, { 
                    timeout: timeLimit - compilationTimeMs,
                    maxBuffer: 1024 * 1024 // 1MB output buffer
                });
            } catch (error) {
                if (error.killed) {
                    return {
                        passed: false,
                        output: null,
                        error: 'Time Limit Exceeded'
                    };
                }
                
                return {
                    passed: false,
                    output: null,
                    error: error.stderr || error.message
                };
            }
            
            // Calculate execution time
            const [execSeconds, execNanoseconds] = process.hrtime(startExecTime);
            const executionTimeMs = (execSeconds * 1000) + (execNanoseconds / 1000000);
            const totalTimeMs = compilationTimeMs + executionTimeMs;
            
            // Extract the captured output
            const parts = cmdResult.stdout.split('___OUTPUT_DELIMITER___');
            let capturedOutput = '';
            
            if (parts.length >= 2) {
                capturedOutput = parts[1].trim();
            } else {
                capturedOutput = cmdResult.stdout.trim();
            }
            
            // Compare the output with expected output
            // If expectedOutput is not a string, convert it to string for comparison
            let formattedExpected = expectedOutput;
            if (typeof expectedOutput !== 'string') {
                formattedExpected = JSON.stringify(expectedOutput);
            }
            
            // Compare results (normalizing line endings)
            const passed = this.compareResults(capturedOutput.trim(), formattedExpected.trim());
            
            return {
                passed,
                output: capturedOutput,
                executionTime: totalTimeMs
            };
        } catch (error) {
            return {
                passed: false,
                output: null,
                error: error.message
            };
        } finally {
            // Clean up Java files
            await this.cleanup(filePath);
            await this.cleanup(path.join(this.tempDir, `${className}.class`));
        }
    }

    /**
     * Execute C++ code for a test case
     * @private
     */
    async executeCppTestCase(code, input, expectedOutput, timeLimit) {
        const executableName = `cpp_exec_${crypto.randomBytes(4).toString('hex')}`;
        const fileName = `${executableName}.cpp`;
        const filePath = path.join(this.tempDir, fileName);
        const executablePath = path.join(this.tempDir, executableName);
        
        try {
            // Prepare C++ code with JSON handling
            const cppCode = `
#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <nlohmann/json.hpp>

using json = nlohmann::json;
using namespace std;

// Function template to be implemented by user
// This must return a value that can be converted to JSON
${code.includes('solve') ? code : `
json solve(const json& input) {
    json output;
    ${code}
    return output;
}`}

int main() {
    try {
        // Parse input JSON
        string inputStr = R"(${JSON.stringify(input)})";
        json inputJson = json::parse(inputStr);
        
        // Call the solve function
        json output = solve(inputJson);
        
        // Output the result as JSON
        cout << output.dump() << endl;
    } catch (exception& e) {
        cerr << "Error: " << e.what() << endl;
        return 1;
    }
    return 0;
}`;
            
            await fs.writeFile(filePath, cppCode);
            
            // Compile C++ code
            const startCompileTime = process.hrtime();
            try {
                await execPromise(`g++ -std=c++17 -I${path.join(__dirname, '../lib/include')} ${filePath} -o ${executablePath}`, {
                    timeout: timeLimit / 2, // Half the time for compilation
                });
            } catch (error) {
                return {
                    passed: false,
                    output: null,
                    error: `Compilation Error: ${error.stderr || error.message}`
                };
            }
            
            // Calculate compilation time
            const [compileSeconds, compileNanoseconds] = process.hrtime(startCompileTime);
            const compilationTimeMs = (compileSeconds * 1000) + (compileNanoseconds / 1000000);
            
            // Execute the compiled C++ program
            const startExecTime = process.hrtime();
            
            let cmdResult;
            try {
                cmdResult = await execPromise(`${executablePath}`, { 
                    timeout: timeLimit - compilationTimeMs,
                    maxBuffer: 1024 * 1024 // 1MB output buffer
                });
            } catch (error) {
                if (error.killed) {
                    return {
                        passed: false,
                        output: null,
                        error: 'Time Limit Exceeded'
                    };
                }
                
                return {
                    passed: false,
                    output: null,
                    error: error.stderr || error.message
                };
            }
            
            // Calculate execution time
            const [execSeconds, execNanoseconds] = process.hrtime(startExecTime);
            const executionTimeMs = (execSeconds * 1000) + (execNanoseconds / 1000000);
            const totalTimeMs = compilationTimeMs + executionTimeMs;
            
            // Parse output
            let output;
            try {
                output = JSON.parse(cmdResult.stdout.trim());
            } catch (error) {
                return {
                    passed: false,
                    output: cmdResult.stdout.trim(),
                    error: 'Output format error: Expected JSON'
                };
            }
            
            // Compare results
            const passed = this.compareResults(output, expectedOutput);
            
            return {
                passed,
                output,
                executionTime: totalTimeMs
            };
        } catch (error) {
            return {
                passed: false,
                output: null,
                error: error.message
            };
        } finally {
            // Clean up C++ files
            await this.cleanup(filePath);
            await this.cleanup(executablePath);
        }
    }

    /**
     * Execute C++ as a full program with cout output
     * @private
     */
    async executeCppProgram(code, input, expectedOutput, timeLimit) {
        const executableName = `cpp_exec_${crypto.randomBytes(4).toString('hex')}`;
        const fileName = `${executableName}.cpp`;
        const filePath = path.join(this.tempDir, fileName);
        const executablePath = path.join(this.tempDir, executableName);
        
        try {
            // Prepare C++ code with output capturing
            let cppCode;
            
            if (code.includes('int main')) {
                // If code already has a main function, wrap it with output capture
                cppCode = `
#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <map>
#include <nlohmann/json.hpp>

using json = nlohmann::json;
using namespace std;

// Capture cout output
class OutputCapture {
public:
    OutputCapture() : old_buf(cout.rdbuf(buffer.rdbuf())) {}
    ~OutputCapture() { cout.rdbuf(old_buf); }
    string getOutput() const { return buffer.str(); }
private:
    stringstream buffer;
    streambuf* old_buf;
};

${code.replace(/int\s+main\s*\([^)]*\)\s*\{/, 'int main() {\n    // Create input as JSON\n    json input = json::parse(R"(' + JSON.stringify(input) + ')");\n    \n    // Capture output\n    OutputCapture capture;\n')}

    // After user code, print the captured output with a delimiter
    cout.rdbuf(capture.buffer.rdbuf());
    cout << "___OUTPUT_DELIMITER___" << endl;
    cout << capture.getOutput();
    
    return 0;
}`;
                } else {
                // Create a wrapper with main function
                cppCode = `
#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <map>
#include <nlohmann/json.hpp>

using json = nlohmann::json;
using namespace std;

// Capture cout output
class OutputCapture {
public:
    OutputCapture() : old_buf(cout.rdbuf(buffer.rdbuf())) {}
    ~OutputCapture() { cout.rdbuf(old_buf); }
    string getOutput() const { return buffer.str(); }
private:
    stringstream buffer;
    streambuf* old_buf;
};

// User code
${code}

int main() {
    try {
        // Parse input JSON
        json input = json::parse(R"(${JSON.stringify(input)})");
        
        // Capture output
        OutputCapture capture;
        
        // Execute user code logic (assuming it uses cout)
        // This depends on how your problems are structured
        processInput(input);
        
        // Print the captured output with delimiter
        cout.rdbuf(capture.buffer.rdbuf());
        cout << "___OUTPUT_DELIMITER___" << endl;
        cout << capture.getOutput();
    } catch (exception& e) {
        cerr << "Error: " << e.what() << endl;
        return 1;
    }
    return 0;
}`;
            }
            
            await fs.writeFile(filePath, cppCode);
            
            // Compile C++ code
            const startCompileTime = process.hrtime();
            try {
                await execPromise(`g++ -std=c++17 -I${path.join(__dirname, '../lib/include')} ${filePath} -o ${executablePath}`, {
                    timeout: timeLimit / 2, // Half the time for compilation
                });
            } catch (error) {
                return {
                    passed: false,
                    output: null,
                    error: `Compilation Error: ${error.stderr || error.message}`
                };
            }
            
            // Calculate compilation time
            const [compileSeconds, compileNanoseconds] = process.hrtime(startCompileTime);
            const compilationTimeMs = (compileSeconds * 1000) + (compileNanoseconds / 1000000);
            
            // Execute the compiled C++ program
            const startExecTime = process.hrtime();
            
            let cmdResult;
            try {
                cmdResult = await execPromise(`${executablePath}`, { 
                    timeout: timeLimit - compilationTimeMs,
                    maxBuffer: 1024 * 1024 // 1MB output buffer
                });
            } catch (error) {
                if (error.killed) {
                    return {
                        passed: false,
                        output: null,
                        error: 'Time Limit Exceeded'
                    };
                }
                
                return {
                    passed: false,
                    output: null,
                    error: error.stderr || error.message
                };
            }
            
            // Calculate execution time
            const [execSeconds, execNanoseconds] = process.hrtime(startExecTime);
            const executionTimeMs = (execSeconds * 1000) + (execNanoseconds / 1000000);
            const totalTimeMs = compilationTimeMs + executionTimeMs;
            
            // Extract the captured output
            const parts = cmdResult.stdout.split('___OUTPUT_DELIMITER___');
            let capturedOutput = '';
            
            if (parts.length >= 2) {
                capturedOutput = parts[1].trim();
            } else {
                capturedOutput = cmdResult.stdout.trim();
            }
            
            // Compare the output with expected output
            // If expectedOutput is not a string, convert it to string for comparison
            let formattedExpected = expectedOutput;
            if (typeof expectedOutput !== 'string') {
                formattedExpected = JSON.stringify(expectedOutput);
            }
            
            // Compare results (normalizing line endings)
            const passed = this.compareResults(capturedOutput.trim(), formattedExpected.trim());
            
            return {
                passed,
                output: capturedOutput,
                executionTime: totalTimeMs
            };
    } catch (error) {
            return {
            passed: false,
                output: null,
            error: error.message
            };
        } finally {
            // Clean up C++ files
            await this.cleanup(filePath);
            await this.cleanup(executablePath);
        }
    }

    /**
     * Compare the result with expected output
     * Handle different data types and structures
     */
    compareResults(result, expected, executionTime) {
        // Handle string comparison for program outputs
        if (typeof result === 'string' && typeof expected === 'string') {
            // Normalize line endings and whitespace
            const normalizeString = (str) => str.replace(/\r\n/g, '\n').trim();
            const normalizedResult = normalizeString(result);
            const normalizedExpected = normalizeString(expected);
            
            const passed = normalizedResult === normalizedExpected;
            return {
                passed,
                output: result,
                executionTime
            };
        }
        
        // Handle null/undefined cases
        if (result === null && expected === null) return { passed: true, output: result, executionTime };
        if (result === undefined && expected === undefined) return { passed: true, output: result, executionTime };
        if (result === null || result === undefined || expected === null || expected === undefined) {
            return { passed: false, output: null, executionTime };
        }
        
        // Compare different types
        if (typeof result !== typeof expected) return { passed: false, output: null, executionTime };
        
        // Handle primitive types
        if (typeof result !== 'object') {
            const passed = result === expected;
            return {
                passed,
                output: result,
                executionTime
            };
        }
        
        // Handle arrays
        if (Array.isArray(result) && Array.isArray(expected)) {
            if (result.length !== expected.length) return { passed: false, output: null, executionTime };
            
            for (let i = 0; i < result.length; i++) {
                const subResult = this.compareResults(result[i], expected[i], executionTime);
                if (!subResult.passed) return subResult;
            }
            
            return { passed: true, output: result, executionTime };
        }
        
        // Handle objects
        if (typeof result === 'object' && typeof expected === 'object') {
            const resultKeys = Object.keys(result);
            const expectedKeys = Object.keys(expected);
            
            if (resultKeys.length !== expectedKeys.length) return { passed: false, output: null, executionTime };
            
            for (const key of expectedKeys) {
                const subResult = this.compareResults(result[key], expected[key], executionTime);
                if (!subResult.passed) return subResult;
            }
            
            return { passed: true, output: result, executionTime };
        }
        
        return { passed: false, output: null, executionTime };
    }

    /**
     * Execute code against standard input and return standard output
     * Useful for running code against custom input
     * @param {string} code - Source code to execute
     * @param {string} language - Programming language (javascript, python)
     * @param {string} input - Standard input as a string
     * @param {number} timeLimit - Time limit in milliseconds
     * @returns {Object} Execution result with stdout, stderr, and execution time
     */
    static async executeWithInput(code, language, input, timeLimit = 3000) {
        const executor = new CodeExecutor();
        const fileName = `${crypto.randomBytes(8).toString('hex')}.${LANGUAGE_CONFIGS[language]?.extension || language}`;
        const filePath = path.join(executor.tempDir, fileName);
        const inputFilePath = `${filePath}.input`;
        
        try {
            // Write code to file
            await fs.writeFile(filePath, code);
            // Write input to file
            await fs.writeFile(inputFilePath, input);
            
            // Execute code with input from file
            const startTime = process.hrtime();
            
            let cmdResult;
            try {
                const command = `${LANGUAGE_CONFIGS[language].executeCommand} ${filePath} < ${inputFilePath}`;
                cmdResult = await execPromise(command, { 
                    timeout: timeLimit,
                    maxBuffer: 5 * 1024 * 1024 // 5MB output buffer
                });
            } catch (error) {
                if (error.killed) {
                    return {
                        stdout: '',
                        stderr: 'Time Limit Exceeded',
                        executionTime: timeLimit
                    };
                }
                
                return {
                    stdout: error.stdout || '',
                    stderr: error.stderr || error.message,
                    executionTime: timeLimit
                };
            }
            
            // Calculate execution time
            const [seconds, nanoseconds] = process.hrtime(startTime);
            const executionTimeMs = (seconds * 1000) + (nanoseconds / 1000000);
            
            return {
                stdout: cmdResult.stdout,
                stderr: cmdResult.stderr,
                executionTime: executionTimeMs
            };
        } catch (error) {
            return {
                stdout: '',
                stderr: error.message,
                executionTime: 0
            };
        } finally {
            await executor.cleanup(filePath);
            await executor.cleanup(inputFilePath);
        }
    }

    /**
     * Execute code against test cases for the specified language
     * @param {string} code - The code to execute
     * @param {Array} testCases - The test cases to run
     * @param {string} language - The programming language (js, python)
     * @param {boolean} isFullProgram - Whether the code is a full program or a function
     * @returns {Promise<Array>} - The results of the test cases
     */
    async executeTestCases(code, testCases, language, isFullProgram = false) {
        try {
            switch (language.toLowerCase()) {
                case 'javascript':
                case 'js':
                    return isFullProgram 
                        ? await this.executeJavaScriptProgram(code, testCases)
                        : await this.executeJavaScriptTests(code, testCases);
                case 'python':
                case 'py':
                    return isFullProgram
                        ? await this.executePythonProgram(code, testCases)
                        : await this.executePythonTests(code, testCases);
                default:
                    throw new Error(`Unsupported language: ${language}`);
            }
        } catch (error) {
            console.error(`Error executing code: ${error.message}`);
            throw error;
        }
    }

    /**
     * Execute a full JavaScript program against test cases
     * @param {string} code - The JavaScript program to execute
     * @param {Array} testCases - The test cases to run
     * @returns {Promise<Array>} - The results of the test cases
     */
    async executeJavaScriptProgram(code, testCases) {
        const results = [];

        for (const testCase of testCases) {
            const startTime = performance.now();
            let result = { passed: false, output: null, error: null, executionTime: 0 };

            try {
                // Create a sandbox with console.log capturing
                let output = [];
                const sandbox = {
                    ...this.javascriptConfig.sandbox,
                    console: {
                        log: (...args) => {
                            output.push(args.map(arg => 
                                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                            ).join(' '));
                        }
                    },
                    process: {
                        stdin: {
                            on: () => {} // Mock stdin
                        }
                    }
                };

                // Add testCase inputs as global variables if needed
                if (testCase.input) {
                    // For programs that expect input data, we'll inject it as global variables
                    // This is a simplified approach - in a real scenario, you might want to
                    // mock process.stdin or provide a custom input mechanism
                    sandbox.INPUT = testCase.input;
                }

                // Execute the full program in the sandbox
                const vm = new VM({ sandbox, timeout: this.javascriptConfig.timeout });
                vm.run(code);

                // Process output
                const capturedOutput = output.join('\\n').trim();
                const expectedOutput = testCase.expectedOutput;
                
                // Compare based on the output captured from console.log
                result.passed = this.compareResults(capturedOutput, expectedOutput, performance.now() - startTime).passed;
                result.output = capturedOutput;
            } catch (error) {
                result.error = {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                };
            }

            result.executionTime = (performance.now() - startTime).toFixed(2);
            results.push(result);
    }

    return results;
}

    /**
     * Execute a full Python program against test cases
     * @param {string} code - The Python program to execute
     * @param {Array} testCases - The test cases to run
     * @returns {Promise<Array>} - The results of the test cases
     */
    async executePythonProgram(code, testCases) {
        const results = [];
        const tempFiles = [];

        for (const testCase of testCases) {
            const startTime = performance.now();
            let result = { passed: false, output: null, error: null, executionTime: 0 };

            // Create unique filenames for this test
            const uniqueId = crypto.randomBytes(8).toString('hex');
            const pythonFilePath = path.join(this.pythonConfig.tempFilesDir, `program_${uniqueId}.py`);
            const inputFilePath = path.join(this.pythonConfig.tempFilesDir, `input_${uniqueId}.txt`);
            
            tempFiles.push(pythonFilePath, inputFilePath);

            try {
                // Write the Python code to a file
                await fs.promises.writeFile(pythonFilePath, code);

                // Write the input to a file if it exists
                if (testCase.input) {
                    const inputData = Array.isArray(testCase.input) 
                        ? testCase.input.join('\\n') 
                        : typeof testCase.input === 'object'
                            ? JSON.stringify(testCase.input)
                            : String(testCase.input);
                    
                    await fs.promises.writeFile(inputFilePath, inputData);
                }

                // Execute the Python program with the input file
                const command = testCase.input
                    ? `${this.pythonConfig.pythonPath} ${pythonFilePath} < ${inputFilePath}`
                    : `${this.pythonConfig.pythonPath} ${pythonFilePath}`;

                const { stdout, stderr } = await util.promisify(exec)(command, {
                    timeout: this.pythonConfig.timeout
                });

                if (stderr) {
                    result.error = { message: stderr };
                } else {
                    const output = stdout.trim();
                    const expectedOutput = testCase.expectedOutput;
                    
                    result.passed = this.compareResults(output, expectedOutput, performance.now() - startTime).passed;
                    result.output = output;
                }
            } catch (error) {
                result.error = {
                    name: error.name,
                    message: error.message || error.stderr,
                    stack: error.stack
                };
            }

            result.executionTime = (performance.now() - startTime).toFixed(2);
            results.push(result);
        }

        // Clean up temp files
        this.cleanupTempFiles(tempFiles);

        return results;
    }
}

module.exports = CodeExecutor;