import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export interface TestResult {
    success: boolean;
    duration?: number;
    error?: string;
    output?: string;
}

export class K6TestRunner {

    private async compileTypeScriptIfNeeded(filePath: string): Promise<string> {
        if (!filePath.endsWith('.ts')) {
            return filePath;
        }

        const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
        if (!workspaceFolder) {
            throw new Error('Could not determine workspace folder for TypeScript compilation');
        }

        return filePath;
    }

    private getK6ArgsForFile(filePath: string): string[] {
        const config = vscode.workspace.getConfiguration('k6TestExplorer');
        const defaultArgs = config.get<string[]>('defaultArgs', []);
        const secretsFile = config.get<string>('secretsFile');

        let args = ['run', ...defaultArgs];
        if (secretsFile) {
            args.push(`--secret-source=file=${secretsFile}`);
        }
        args.push(filePath);
        return args;
    }

    public async runTest(testItem: vscode.TestItem, token: vscode.CancellationToken): Promise<TestResult> {
        const config = vscode.workspace.getConfiguration('k6TestExplorer');
        const k6Path = config.get<string>('k6Path', 'k6');

        if (!testItem.uri) {
            throw new Error('Test item has no associated file');
        }

        const filePath = testItem.uri.fsPath;
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(testItem.uri);
        const cwd = workspaceFolder?.uri.fsPath || path.dirname(filePath);

        try {
            const executablePath = await this.compileTypeScriptIfNeeded(filePath);
            const args = this.getK6ArgsForFile(executablePath);

            return new Promise<TestResult>((resolve) => {
                const startTime = Date.now();
                let output = '';
                let error = '';

                const process = cp.spawn(k6Path, args, {
                    cwd,
                    shell: true,
                    stdio: ['pipe', 'pipe', 'pipe']
                });

                process.stdout?.on('data', (data) => {
                    output += data.toString();
                });

                process.stderr?.on('data', (data) => {
                    error += data.toString();
                });

                process.on('close', (code) => {
                    const duration = Date.now() - startTime;

                    if (code === 0) {
                        resolve({
                            success: true,
                            duration,
                            output
                        });
                    } else {
                        resolve({
                            success: false,
                            duration,
                            error: error || `Process exited with code ${code}`,
                            output
                        });
                    }
                });

                process.on('error', (err) => {
                    const duration = Date.now() - startTime;
                    resolve({
                        success: false,
                        duration,
                        error: err.message
                    });
                });

                token.onCancellationRequested(() => {
                    process.kill();
                });
            });
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }

    public async validateK6Installation(): Promise<{ isValid: boolean; version?: string; error?: string }> {
        const config = vscode.workspace.getConfiguration('k6TestExplorer');
        const k6Path = config.get<string>('k6Path', 'k6');

        return new Promise((resolve) => {
            const process = cp.spawn(k6Path, ['version'], {
                shell: true,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let output = '';
            let error = '';

            process.stdout?.on('data', (data) => {
                output += data.toString();
            });

            process.stderr?.on('data', (data) => {
                error += data.toString();
            });

            process.on('close', (code) => {
                if (code === 0) {
                    const versionMatch = output.match(/k6 v([\d.]+)/);
                    resolve({
                        isValid: true,
                        version: versionMatch ? versionMatch[1] : 'unknown'
                    });
                } else {
                    resolve({
                        isValid: false,
                        error: error || `Process exited with code ${code}`
                    });
                }
            });

            process.on('error', (err) => {
                resolve({
                    isValid: false,
                    error: err.message
                });
            });

            setTimeout(() => {
                process.kill();
                resolve({
                    isValid: false,
                    error: 'Timeout waiting for k6 version check'
                });
            }, 5000);
        });
    }
}
