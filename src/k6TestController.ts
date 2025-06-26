import * as vscode from 'vscode';
import * as path from 'path';
import { K6TestRunner, TestResult } from './k6TestRunner';
import { K6TestDiscovery } from './k6TestDiscovery';

export class K6TestController {
    private testController: vscode.TestController;
    private testRunner: K6TestRunner;
    private testDiscovery: K6TestDiscovery;
    private fileWatcher!: vscode.FileSystemWatcher;

    constructor(private context: vscode.ExtensionContext) {
        this.testController = vscode.tests.createTestController(
            'k6TestController',
            'K6 Tests'
        );

        this.testRunner = new K6TestRunner();
        this.testDiscovery = new K6TestDiscovery();

        // Set up file watching
        this.setupFileWatcher();

        // Set up test controller handlers
        this.setupTestController();

        // Initial test discovery
        this.refreshTests();

        context.subscriptions.push(this.testController);
    } private setupFileWatcher(): void {
        const config = vscode.workspace.getConfiguration('k6TestExplorer');
        const testPattern = config.get<string>('testPattern', '**/*.test.{js,ts}');

        this.fileWatcher = vscode.workspace.createFileSystemWatcher(testPattern);

        this.fileWatcher.onDidCreate(uri => this.handleFileChange(uri));
        this.fileWatcher.onDidChange(uri => this.handleFileChange(uri));
        this.fileWatcher.onDidDelete(uri => this.handleFileDelete(uri));

        this.context.subscriptions.push(this.fileWatcher);
    }

    private setupTestController(): void {
        this.testController.refreshHandler = () => this.refreshTests();

        this.testController.createRunProfile(
            'Run K6 Tests',
            vscode.TestRunProfileKind.Run,
            (request, token) => this.runTests(request, token)
        );

        this.testController.createRunProfile(
            'Debug K6 Tests',
            vscode.TestRunProfileKind.Debug,
            (request, token) => this.debugTests(request, token)
        );
    }

    private async handleFileChange(uri: vscode.Uri): Promise<void> {
        const testItem = this.findTestItemByUri(uri);
        if (testItem) {
            await this.updateTestItem(testItem, uri);
        } else {
            await this.discoverTestsInFile(uri);
        }
    }

    private handleFileDelete(uri: vscode.Uri): void {
        const testItem = this.findTestItemByUri(uri);
        if (testItem) {
            this.testController.items.delete(testItem.id);
        }
    }

    private findTestItemByUri(uri: vscode.Uri): vscode.TestItem | undefined {
        for (const [, item] of this.testController.items) {
            if (item.uri?.toString() === uri.toString()) {
                return item;
            }
        }
        return undefined;
    }

    public async refreshTests(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return;
        }

        this.testController.items.replace([]);

        for (const folder of workspaceFolders) {
            await this.discoverTestsInWorkspace(folder);
        }
    } private async discoverTestsInWorkspace(workspaceFolder: vscode.WorkspaceFolder): Promise<void> {
        const config = vscode.workspace.getConfiguration('k6TestExplorer');
        const testPattern = config.get<string>('testPattern', '**/*.test.{js,ts}');

        const files = await vscode.workspace.findFiles(
            new vscode.RelativePattern(workspaceFolder, testPattern),
            '**/node_modules/**'
        );

        for (const file of files) {
            await this.discoverTestsInFile(file);
        }
    }

    private async discoverTestsInFile(uri: vscode.Uri): Promise<void> {
        try {
            const tests = await this.testDiscovery.discoverTests(uri);

            if (tests.length > 0) {
                const fileItem = this.testController.createTestItem(
                    uri.toString(),
                    path.basename(uri.fsPath),
                    uri
                );

                fileItem.canResolveChildren = true;
                fileItem.description = path.relative(vscode.workspace.workspaceFolders![0].uri.fsPath, uri.fsPath);

                for (const test of tests) {
                    const testItem = this.testController.createTestItem(
                        `${uri.toString()}::${test.name}`,
                        test.name,
                        uri
                    );

                    testItem.range = test.range;
                    testItem.description = test.description;
                    fileItem.children.add(testItem);
                }

                this.testController.items.add(fileItem);
            }
        } catch (error) {
            console.error(`Error discovering tests in ${uri.fsPath}:`, error);
        }
    }

    private async updateTestItem(testItem: vscode.TestItem, uri: vscode.Uri): Promise<void> {
        // Remove existing test item and rediscover
        this.testController.items.delete(testItem.id);
        await this.discoverTestsInFile(uri);
    }

    private async runTests(request: vscode.TestRunRequest, token: vscode.CancellationToken): Promise<void> {
        const run = this.testController.createTestRun(request);

        try {
            const tests = this.getTestsToRun(request);

            for (const test of tests) {
                if (token.isCancellationRequested) {
                    break;
                }

                run.started(test);

                try {
                    const result = await this.testRunner.runTest(test, token);

                    if (result.success) {
                        run.passed(test, result.duration);
                    } else {
                        const message = new vscode.TestMessage(result.error || 'Test failed');
                        run.failed(test, message, result.duration);
                    }
                } catch (error) {
                    const message = new vscode.TestMessage(error instanceof Error ? error.message : String(error));
                    run.failed(test, message);
                }
            }
        } finally {
            run.end();
        }
    }

    private async debugTests(request: vscode.TestRunRequest, token: vscode.CancellationToken): Promise<void> {
        // For now, just run the tests normally
        // TODO: Implement debugging support
        await this.runTests(request, token);
    }

    private getTestsToRun(request: vscode.TestRunRequest): vscode.TestItem[] {
        const tests: vscode.TestItem[] = [];

        if (request.include) {
            for (const item of request.include) {
                this.collectTests(item, tests);
            }
        } else {
            // Run all tests
            for (const [, item] of this.testController.items) {
                this.collectTests(item, tests);
            }
        }

        return tests;
    }

    private collectTests(item: vscode.TestItem, tests: vscode.TestItem[]): void {
        if (item.children.size === 0) {
            // This is a leaf test item
            tests.push(item);
        } else {
            // This is a container, collect all children
            item.children.forEach(child => this.collectTests(child, tests));
        }
    }

    public async runTest(testItem: vscode.TestItem): Promise<void> {
        const request = new vscode.TestRunRequest([testItem]);
        await this.runTests(request, new vscode.CancellationTokenSource().token);
    }

    public async runAllTests(): Promise<void> {
        const request = new vscode.TestRunRequest();
        await this.runTests(request, new vscode.CancellationTokenSource().token);
    }

    public dispose(): void {
        this.testController.dispose();
        this.fileWatcher.dispose();
    }
}
