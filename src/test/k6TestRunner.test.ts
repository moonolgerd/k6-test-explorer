import * as assert from 'assert';
import * as vscode from 'vscode';
import { K6TestRunner } from '../k6TestRunner';

suite('K6TestRunner Test Suite', () => {
    vscode.window.showInformationMessage('Start K6TestRunner tests.');

    test('getK6ArgsForFile should include secrets file when configured', async () => {
        const runner = new K6TestRunner();

        // Mock the workspace configuration
        const mockConfig = {
            get: (key: string, defaultValue?: any) => {
                switch (key) {
                    case 'defaultArgs':
                        return []; case 'secretsFile':
                        return 'secrets.env';
                    default:
                        return defaultValue;
                }
            }
        };

        // Mock vscode.workspace.getConfiguration
        const originalGetConfiguration = vscode.workspace.getConfiguration;
        vscode.workspace.getConfiguration = () => mockConfig as any;

        try {            // Use reflection to access the private method for testing
            const getK6ArgsForFile = (runner as any).getK6ArgsForFile.bind(runner);
            const args = getK6ArgsForFile('test.js'); assert.strictEqual(args.some((arg: string) => arg.startsWith('--secret-source=file=')), true, 'Should include --secret-source=file= flag');
            assert.strictEqual(args.some((arg: string) => arg.includes('secrets.env')), true, 'Should include secrets file path');
            assert.strictEqual(args[args.length - 1], 'test.js', 'Test file should be last argument');
        } finally {
            // Restore original function
            vscode.workspace.getConfiguration = originalGetConfiguration;
        }
    });

    test('getK6ArgsForFile should not include secrets file when not configured', async () => {
        const runner = new K6TestRunner();

        // Mock the workspace configuration without secrets file
        const mockConfig = {
            get: (key: string, defaultValue?: any) => {
                switch (key) {
                    case 'defaultArgs':
                        return [];
                    case 'secretsFile':
                        return undefined;
                    default:
                        return defaultValue;
                }
            }
        };

        // Mock vscode.workspace.getConfiguration
        const originalGetConfiguration = vscode.workspace.getConfiguration;
        vscode.workspace.getConfiguration = () => mockConfig as any;

        try {            // Use reflection to access the private method for testing
            const getK6ArgsForFile = (runner as any).getK6ArgsForFile.bind(runner);
            const args = getK6ArgsForFile('test.js'); assert.strictEqual(args.some((arg: string) => arg.startsWith('--secret-source=file=')), false, 'Should not include --secret-source=file= flag');
            assert.strictEqual(args.some((arg: string) => arg.includes('secrets')), false, 'Should not include secrets file path');
            assert.strictEqual(args[args.length - 1], 'test.js', 'Test file should be last argument');
        } finally {
            // Restore original function
            vscode.workspace.getConfiguration = originalGetConfiguration;
        }
    });

    test('getK6ArgsForFile should include default args and secrets file', async () => {
        const runner = new K6TestRunner();

        // Mock the workspace configuration with default args and secrets file
        const mockConfig = {
            get: (key: string, defaultValue?: any) => {
                switch (key) {
                    case 'defaultArgs':
                        return ['--quiet', '--no-color']; case 'secretsFile':
                        return 'my-secrets.env';
                    default:
                        return defaultValue;
                }
            }
        };

        // Mock vscode.workspace.getConfiguration
        const originalGetConfiguration = vscode.workspace.getConfiguration;
        vscode.workspace.getConfiguration = () => mockConfig as any;

        try {
            // Use reflection to access the private method for testing
            const getK6ArgsForFile = (runner as any).getK6ArgsForFile.bind(runner);
            const args = getK6ArgsForFile('test.ts'); assert.strictEqual(args[0], 'run', 'First argument should be run');
            assert.strictEqual(args.includes('--quiet'), true, 'Should include --quiet flag');
            assert.strictEqual(args.includes('--no-color'), true, 'Should include --no-color flag');
            assert.strictEqual(args.some((arg: string) => arg.startsWith('--secret-source=file=')), true, 'Should include --secret-source=file= flag');
            assert.strictEqual(args.some((arg: string) => arg.includes('my-secrets.env')), true, 'Should include secrets file path');
            assert.strictEqual(args[args.length - 1], 'test.ts', 'Test file should be last argument');
        } finally {
            // Restore original function
            vscode.workspace.getConfiguration = originalGetConfiguration;
        }
    });
});
