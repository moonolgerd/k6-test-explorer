# Change Log

All notable changes to the "k6-test-explorer" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

## [0.0.7] - 2025-06-25

### Added
- **GitHub CI/CD Workflows**: Added comprehensive GitHub Actions workflows for automated building and publishing
  - Build workflow for PR validation with linting, type checking, and testing
  - Publish workflow for automated VS Code Marketplace publishing on version tags
  - Cross-platform support with proper artifact generation
- **Development Documentation**: Added detailed setup instructions for marketplace publishing
  - Complete PAT token setup guide for Azure DevOps integration
  - Step-by-step publisher configuration instructions
- **GitHub Copilot Instructions**: Added comprehensive context file for better AI-assisted development
  - Detailed project structure and coding conventions
  - Development guidelines and best practices
  - Common patterns and testing strategies

## [0.0.6] - 2025-06-25

### Added
- **Arrow Function Support**: Added comprehensive support for TypeScript arrow function syntax
  - Supports typed parameters and complex return type annotations
  - Works with async arrow functions and various TypeScript type declarations
- **Docker Integration**: Added complete Docker support with cross-platform configurations
  - Windows (PowerShell) and macOS/Linux specific Docker configurations
  - Automatic workspace mounting and secrets file support
  - Easy installation via `docker pull grafana/k6:latest`

## [0.0.5] - 2025-06-25

### Added
- **Expanded File Pattern Support**: Updated test pattern to include `-test.ts` and `-test.js` naming conventions

### Fixed
- **Fixed Test Recognition**: Resolved issue where files named with `-test` suffix (e.g., `secrets-test.ts`) were not being discovered
- **Updated Default Pattern**: Changed default test pattern from `**/*.test.{js,ts}` to `**/*{.test,-test}.{js,ts}`

### Changed
- **Better Documentation**: Updated README with comprehensive test file naming conventions

## [0.0.4] - 2025-06-25

### Added
- **Improved Test Discovery**: Enhanced regex patterns to properly detect async functions and complex TypeScript return types
- **Better Function Detection**: Fixed detection of `export default async function ()` patterns used in modern k6 tests
- **TypeScript Support**: Enhanced support for complex return type annotations including `Promise<void>` and union types

### Fixed
- **Eliminated Duplicates**: Resolved duplicate function detection for lifecycle functions (setup, teardown, handleSummary)
- **Sample Test Updates**: All sample tests now properly detected by the test explorer

## [0.0.3] - 2025-06-25

### Added
- **Secrets Management**: Added support for k6's file-based secret sources
  - Configure secrets file path via `k6TestExplorer.secretsFile` setting
  - Use key=value format for secrets files (k6 standard)
  - Async `secrets.get()` API support with proper TypeScript definitions
- **Enhanced TypeScript Support**: Improved module resolution and async function handling
- **Updated Sample Tests**: Added secrets usage examples and comprehensive documentation

### Changed
- **Removed --compatibility flag**: TypeScript tests now run without experimental compatibility mode

### Fixed
- **Bug Fixes**: Fixed k6 argument formatting and import syntax issues

## [0.0.2] - 2025-06-25

### Added
- **TypeScript Support**: TypeScript test files are now supported with the `.test.ts` extension
- **Improved Type Safety**: Enhanced editor support for TypeScript users

## [0.0.1] - 2025-06-25

### Added
- **Initial Release**: Basic test discovery for k6 JavaScript files
- **Test Explorer Integration**: Integration with VS Code Test Explorer
- **Test Execution**: Run individual tests and all tests
- **Configuration**: Configurable k6 path and test patterns
- **Real-time Output**: Real-time output in integrated terminal

### Features
- **Advanced Test Discovery**: Automatically discovers k6 test files with enhanced pattern matching
- **Test Groups**: Organize tests by file and test groups for better visibility
- **Configurable Settings**: Customize k6 executable path, test file patterns, and default arguments