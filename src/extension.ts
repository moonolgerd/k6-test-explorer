// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { K6TestController } from './k6TestController';

let testController: K6TestController;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('K6 Test Explorer extension is activating...');

	// Create the test controller
	testController = new K6TestController(context);

	// Register commands
	const refreshCommand = vscode.commands.registerCommand('k6-test-explorer.refreshTests', () => {
		testController.refreshTests();
	});

	const runTestCommand = vscode.commands.registerCommand('k6-test-explorer.runTest', (testItem: vscode.TestItem) => {
		testController.runTest(testItem);
	});

	const runAllTestsCommand = vscode.commands.registerCommand('k6-test-explorer.runAllTests', () => {
		testController.runAllTests();
	});

	context.subscriptions.push(refreshCommand, runTestCommand, runAllTestsCommand);

	console.log('K6 Test Explorer extension is now active!');
}

// This method is called when your extension is deactivated
export function deactivate() {
	if (testController) {
		testController.dispose();
	}
}
