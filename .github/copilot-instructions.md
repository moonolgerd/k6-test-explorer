# GitHub Copilot Instructions for K6 Test Explorer

This document provides context and guidelines for GitHub Copilot when working on the K6 Test Explorer VS Code extension.

## Project Overview

The K6 Test Explorer is a VS Code extension that integrates k6 performance testing with the VS Code Test Explorer. It allows users to discover, run, and manage k6 performance tests directly from the VS Code interface.

## Key Technologies

- **TypeScript**: Primary development language
- **VS Code Extension API**: Core framework for extension functionality
- **esbuild**: Build tool for bundling and optimization
- **k6**: Performance testing tool that this extension integrates with

## Project Structure

```
src/
├── extension.ts           # Main extension entry point
├── k6TestController.ts    # Core test controller logic
├── k6TestDiscovery.ts     # Test file discovery and parsing
├── k6TestRunner.ts        # Test execution logic
└── test/                  # Unit tests
    ├── extension.test.ts
    └── k6TestRunner.test.ts

sample-tests/              # Example k6 test files
types/                     # TypeScript type definitions
.github/                   # GitHub CI/CD workflows
```

## Core Features

1. **Test Discovery**: Automatically finds k6 test files using glob patterns
2. **TypeScript Support**: Full support for TypeScript k6 tests with complex return types
3. **Secrets Management**: Secure handling of sensitive data through k6's file-based secret sources
4. **Test Explorer Integration**: Native VS Code Test Explorer integration
5. **Docker Support**: Can run k6 tests using Docker containers

## Code Patterns and Conventions

### File Naming
- Test files: `*.test.js`, `*.test.ts`, `*-test.js`, `*-test.ts`
- Source files: PascalCase (e.g., `k6TestController.ts`)
- Use descriptive names that reflect functionality

### TypeScript Patterns
- Use interfaces for complex data structures
- Leverage VS Code API types (e.g., `vscode.TestItem`, `vscode.ExtensionContext`)
- Async/await for asynchronous operations
- Proper error handling with try/catch blocks

### k6 Test Detection
The extension detects k6 tests by looking for:
- `export default function()` - Standard k6 test function
- `export default async function()` - Async k6 test function
- Arrow functions: `export default (params): ReturnType => {}`
- Lifecycle functions: `setup`, `teardown`, `handleSummary`

### Configuration
Extension settings are prefixed with `k6TestExplorer`:
- `k6TestExplorer.k6Path` - Path to k6 executable
- `k6TestExplorer.testPattern` - Glob pattern for test files
- `k6TestExplorer.defaultArgs` - Default k6 arguments
- `k6TestExplorer.secretsFile` - Path to secrets file

## Development Guidelines

### When adding new features:
1. Update the `package.json` contributes section if adding new commands/settings
2. Add appropriate error handling and logging
3. Consider both JavaScript and TypeScript test files
4. Update documentation and examples
5. Add unit tests for new functionality

### When modifying test discovery:
- Test with various k6 function patterns (async, arrow functions, typed returns)
- Ensure both `.js` and `.ts` files are handled
- Validate complex TypeScript type annotations work correctly
- Test with sample files in `sample-tests/` directory

### When working with VS Code API:
- Use proper disposal patterns for resources
- Handle workspace changes appropriately
- Leverage VS Code's Test Explorer API correctly
- Ensure proper command registration and cleanup

### Error Handling
- Always wrap k6 execution in try/catch blocks
- Provide meaningful error messages to users
- Log errors for debugging while avoiding sensitive data
- Handle missing k6 executable gracefully

## Testing Strategy

### Unit Tests
- Test individual components in isolation
- Mock VS Code API dependencies
- Focus on core logic like test discovery and parsing

### Integration Tests
- Test with actual k6 test files
- Validate extension activation and command registration
- Test configuration changes and their effects

### Manual Testing
- Test with various k6 file patterns in `sample-tests/`
- Verify Docker integration works correctly
- Test secrets functionality with actual secrets files

## Build and Deployment

### Local Development
```bash
npm install          # Install dependencies
npm run watch        # Development build with watch mode
npm run test         # Run unit tests
npm run package      # Production build
```

### CI/CD
- GitHub Actions workflows in `.github/workflows/`
- Build workflow runs on PR/push to validate changes
- Publish workflow deploys to VS Code Marketplace on tags

## Common Patterns

### Async Operations
```typescript
export default async function(): Promise<void> {
    const apiKey = await secrets.get("API_KEY");
    // test logic
}
```

### Error Handling
```typescript
try {
    const result = await k6Runner.runTest(testFile);
    // handle success
} catch (error) {
    vscode.window.showErrorMessage(`Failed to run test: ${error.message}`);
}
```

### Configuration Access
```typescript
const config = vscode.workspace.getConfiguration('k6TestExplorer');
const k6Path = config.get<string>('k6Path', 'k6');
```

## Dependencies to Consider

- Always use VS Code API types from `@types/vscode`
- k6 types from `@types/k6` for better TypeScript support
- Avoid adding heavy dependencies that increase bundle size
- Prefer native Node.js modules when possible

## Documentation

- Update CHANGELOG.md for all user-facing changes
- Keep README.md current with new features
- Add JSDoc comments for public APIs
- Include usage examples for new features
