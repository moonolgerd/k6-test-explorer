# GitHub CI Setup for VS Code Extension

This repository includes GitHub Actions workflows for building and publishing the K6 Test Explorer extension.

## Workflows

### 1. Build and Test (`build.yml`)
- **Triggers**: Push to main/master branches and pull requests
- **Purpose**: Validates code quality, runs tests, and builds the extension
- **Outputs**: Creates a VSIX package as an artifact for testing

### 2. Publish Extension (`publish.yml`)
- **Triggers**: 
  - Push to version tags (e.g., `v0.0.7`)
  - Manual workflow dispatch
- **Purpose**: Publishes the extension to VS Code Marketplace
- **Requirements**: VSCE_PAT secret must be configured

## Setup Instructions

### 1. Get a Personal Access Token (PAT)

1. Go to [Azure DevOps](https://dev.azure.com)
2. Sign in with your Microsoft account
3. Click on your profile picture → Personal Access Tokens
4. Create a new token with:
   - **Name**: VS Code Marketplace Publishing
   - **Organization**: All accessible organizations
   - **Scopes**: Custom defined → Marketplace → Manage

### 2. Configure GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add a new repository secret:
   - **Name**: `VSCE_PAT`
   - **Value**: Your personal access token from step 1


### 4. Publishing Process

#### Option 1: Tag-based Release
```bash
# Create and push a version tag
git tag v0.0.7
git push origin v0.0.7
```

#### Option 2: Manual Dispatch
1. Go to Actions tab in GitHub
2. Select "Publish Extension" workflow
3. Click "Run workflow"
4. Enter the version number

## Local Testing

To test the extension locally before publishing:

```bash
# Install vsce globally
npm install -g @vscode/vsce

# Package the extension
npm run package
vsce package

# Install the generated .vsix file in VS Code
code --install-extension k6-test-explorer-0.0.6.vsix
```

## Version Management

The workflow automatically uses the version from `package.json`. To release a new version:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Commit changes
4. Create and push a tag: `git tag v<version> && git push origin v<version>`
