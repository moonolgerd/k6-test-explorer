import * as vscode from 'vscode';
import * as fs from 'fs';

export interface K6Test {
    name: string;
    description?: string;
    range?: vscode.Range;
}

export class K6TestDiscovery {

    public async discoverTests(uri: vscode.Uri): Promise<K6Test[]> {
        try {
            const content = await fs.promises.readFile(uri.fsPath, 'utf8');
            return this.parseTestFile(content);
        } catch (error) {
            console.error(`Error reading file ${uri.fsPath}:`, error);
            return [];
        }
    }

    private parseTestFile(content: string): K6Test[] {
        const tests: K6Test[] = [];
        const lines = content.split('\n');

        // Look for k6 test patterns - only include default function
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Look for export default function or export function patterns (including async and arrow functions)
            const exportDefaultMatch = line.match(/export\s+default\s+(?:async\s+)?function\s*\([^)]*\)\s*(?::\s*[\w<>\[\]|\s,Promise<>]+\s*)?[{;]/);
            // Enhanced arrow function pattern to handle typed parameters like (users: EqWebUser[]): void =>
            const exportDefaultArrowMatch = line.match(/export\s+default\s+(?:async\s+)?\([^)]*\)\s*(?::\s*[\w<>\[\]|\s,.:]+\s*)?=>/);

            if (exportDefaultMatch || exportDefaultArrowMatch) {
                // This is the main test function - only include this as a test
                tests.push({
                    name: 'default',
                    description: 'Main k6 test function',
                    range: new vscode.Range(i, 0, i, line.length)
                });
            }

            // Skip all other exported functions and lifecycle functions
            // Only the default function is considered a test
        }

        // If no tests found but file appears to be a k6 test, add a default test
        if (tests.length === 0 && this.looksLikeK6Test(content)) {
            tests.push({
                name: 'k6 test',
                description: 'K6 performance test',
                range: new vscode.Range(0, 0, 0, 0)
            });
        }

        return tests;
    }

    private looksLikeK6Test(content: string): boolean {
        const k6Indicators = [
            /import.*from\s+['"]k6['"]/,
            /import.*from\s+['"]k6\//,
            /require\(['"]k6['"]\)/,
            /require\(['"]k6\//,
            /export\s+let\s+options/,
            /export\s+const\s+options/,
            /export\s+default\s+function/,
            /scenarios:/,
            /check\(/,
            /sleep\(/,
            /group\(/,
            /__VU/,
            /__ITER/
        ];

        return k6Indicators.some(pattern => pattern.test(content));
    }
}
