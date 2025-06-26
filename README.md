# K6 Test Explorer

A VS Code extension that integrates k6 performance testing with the VS Code Test Explorer. Run,- `k6TestExplorer.k6Path`: Path to the k6 executable (default: "k6")

- `k6TestExplorer.testPattern`: Glob pattern to find k6 test files (default: "\*\*/\*{.test,-test}.{js,ts}")
- `k6TestExplorer.defaultArgs`: Default arguments to pass to k6 run command (default: [])bug, and manage your k6 performance tests directly from the VS Code interface.

## Features

- **Advanced Test Discovery**: Automatically discovers k6 test files with enhanced pattern matching for async functions and TypeScript annotations
- **TypeScript Support**: Full support for TypeScript k6 tests with complex return types and async functions (no longer requires --compatibility flag)
- **Secrets Management**: Secure handling of sensitive data through k6's file-based secret sources
- **Test Explorer Integration**: View and manage k6 tests in the VS Code Test Explorer panel
- **Run Tests**: Execute individual tests or all tests at once
- **Real-time Output**: View k6 test results and logs in the integrated terminal
- **Configurable**: Customize k6 executable path, test file patterns, default arguments, and secrets file location
- **Test Groups**: Organize tests by file and test groups for better visibility

## Requirements

- [k6](https://k6.io/docs/get-started/installation/) must be installed and available in your PATH
- VS Code version 1.100.0 or higher

## Installation

1. Install k6 on your system:

   ```bash
   # Windows (using winget - recommended)
   winget install k6.k6

   # Windows (using chocolatey)
   choco install k6

   # macOS (using homebrew)
   brew install k6

   # Linux (using package manager or download binary)
   sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6

   # Docker (cross-platform)
   docker pull grafana/k6:latest
   ```

   **Note**: If using Docker, you'll need to configure the extension to use Docker by setting:

   ```json
   {
     "k6TestExplorer.k6Path": "docker",
     "k6TestExplorer.defaultArgs": [
       "run",
       "--rm",
       "-v",
       "${workspaceFolder}:/app",
       "-w",
       "/app",
       "grafana/k6:latest"
     ]
   }
   ```

2. Install this extension from the VS Code marketplace

## Usage

### Creating k6 Tests

Create JavaScript or TypeScript files with the `.test.js`, `.test.ts`, `-test.js`, or `-test.ts` extension.

**JavaScript Example:**

```javascript
import http from "k6/http"
import { check, sleep } from "k6"

export const options = {
  vus: 10, // 10 virtual users
  duration: "30s", // for 30 seconds
}

export default function () {
  const response = http.get("https://httpbin.org/json")

  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  })

  sleep(1)
}
```

**TypeScript Example:**

```typescript
import http from "k6/http"
import { check, sleep } from "k6"
import secrets from "k6/secrets"
import { Options } from "k6/options"

export const options: Options = {
  vus: 10,
  duration: "30s",
}

interface ApiResponse {
  status: number
  body: string
}

export default async function (): Promise<void> {
  // Load secrets if configured
  let apiKey = ""
  try {
    apiKey = await secrets.get("API_KEY")
  } catch (e) {
    console.log("No API_KEY secret found, running without authentication")
  }

  const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
  const response = http.get("https://httpbin.org/json", { headers })

  check(response, {
    "status is 200": (r: ApiResponse) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  })

  sleep(1)
}
```

**TypeScript Arrow Function Example:**

```typescript
import http from "k6/http"
import { check, sleep } from "k6"
import { Options } from "k6/options"

export interface User {
  id: number
  name: string
  email: string
}

export const options: Options = {
  vus: 5,
  duration: "15s",
}

// Arrow function with typed parameters
export default (users: User[]): void => {
  const user = users[Math.floor(Math.random() * users.length)]
  const response = http.get(`https://httpbin.org/get?user=${user.id}`)

  check(response, {
    "status is 200": (r) => r.status === 200,
    "has user data": (r) => r.url.includes(`user=${user.id}`),
  })

  sleep(1)
}

export function handleSummary(data: any) {
  return {
    "summary.json": JSON.stringify(data),
  }
}
```

### Running Tests

1. Open the Test Explorer panel (View → Test Explorer)
2. Your k6 tests will be automatically discovered and displayed
3. Click the play button next to any test to run it
4. Use the "Run All Tests" button to execute all discovered tests
5. View results in the integrated terminal

**Note**: The extension now supports advanced function detection including:

- Async default functions: `export default async function () {}`
- Arrow functions: `export default (users: EqWebUser[]): void => {}`
- TypeScript return types: `export default function (): Promise<void> {}`
- K6 lifecycle functions: `setup`, `teardown`, `handleSummary`
- Complex TypeScript annotations and union types

### Quick Start with Secrets

To get started with secrets in your k6 tests:

1. **Create a secrets file** (e.g., `secrets.env`):

   ```
   API_KEY=sk-1234567890abcdef
   DB_PASSWORD=mySecretPassword
   ```

2. **Add to .gitignore**:

   ```
   # Secrets
   secrets.env
   *.secrets
   ```

3. **Configure VS Code settings**:

   ```json
   {
     "k6TestExplorer.secretsFile": "./secrets.env"
   }
   ```

4. **Use in your test**:

   ```javascript
   import secrets from "k6/secrets"

   export default async function () {
     const apiKey = await secrets.get("API_KEY")
     // Your test logic here...
   }
   ```

### Commands

- `K6 Test Explorer: Refresh Tests` - Manually refresh the test discovery
- `K6 Test Explorer: Run Test` - Run a specific test
- `K6 Test Explorer: Run All Tests` - Run all discovered tests

## Extension Settings

This extension contributes the following settings:

- `k6TestExplorer.k6Path`: Path to the k6 executable (default: "k6")
- `k6TestExplorer.testPattern`: Glob pattern to find k6 test files (default: "\*\*/\*{.test,-test}.{js,ts}")
- `k6TestExplorer.defaultArgs`: Default arguments to pass to k6 run command (default: [])
- `k6TestExplorer.secretsFile`: Path to the secrets file for k6 tests (default: "")

### Example Settings

```json
{
  "k6TestExplorer.k6Path": "/usr/local/bin/k6",
  "k6TestExplorer.testPattern": "**/*{.test,.perf,.load}.{js,ts}",
  "k6TestExplorer.defaultArgs": ["--quiet", "--no-color"],
  "k6TestExplorer.secretsFile": "./secrets.env"
}
```

### Docker Configuration

If you prefer to use k6 with Docker instead of installing it locally, configure the extension as follows:

**Windows (PowerShell)**:

```json
{
  "k6TestExplorer.k6Path": "docker",
  "k6TestExplorer.defaultArgs": [
    "run",
    "--rm",
    "-v",
    "${workspaceFolder}:/app",
    "-w",
    "/app",
    "grafana/k6:latest"
  ]
}
```

**macOS/Linux**:

```json
{
  "k6TestExplorer.k6Path": "docker",
  "k6TestExplorer.defaultArgs": [
    "run",
    "--rm",
    "-v",
    "${workspaceFolder}:/app:ro",
    "-w",
    "/app",
    "grafana/k6:latest"
  ]
}
```

**With secrets file (add volume mount for secrets)**:

```json
{
  "k6TestExplorer.k6Path": "docker",
  "k6TestExplorer.defaultArgs": [
    "run",
    "--rm",
    "-v",
    "${workspaceFolder}:/app",
    "-w",
    "/app",
    "grafana/k6:latest"
  ],
  "k6TestExplorer.secretsFile": "./secrets.env"
}
```

**Note**: When using Docker, the extension will automatically mount your workspace folder into the container so k6 can access your test files and secrets.

### Secrets Management

The extension supports k6's file-based secret sources for secure handling of sensitive data like API keys, passwords, and tokens.

1. **Create a secrets file** (e.g., `secrets.env`) using key=value format:

   ```
   API_KEY=your-secret-api-key
   DATABASE_PASSWORD=your-db-password
   AUTH_TOKEN=your-auth-token
   ```

2. **Configure the secrets file path** in VS Code settings:

   ```json
   {
     "k6TestExplorer.secretsFile": "./secrets.env"
   }
   ```

3. **Use secrets in your tests**:

   ```typescript
   import secrets from "k6/secrets"

   export default async function () {
     const apiKey = await secrets.get("API_KEY")
     // Use the secret in your test...
   }
   ```

**Important**:

- Always add your secrets file to `.gitignore` to prevent committing sensitive data
- Use the key=value format (not JSON) as required by k6
- The secrets API is asynchronous, so use `await` when calling `secrets.get()`

## Known Issues

- Test discovery requires files to have the `.test.js` or `.test.ts` extension by default
- Test results are displayed in terminal only (result parsing planned for future versions)
- Secrets files must use key=value format (not JSON) as required by k6

---

## Development

To contribute to this extension:

1. Clone the repository
2. Run `npm install` to install dependencies
3. Press F5 to launch a new Extension Development Host
4. Make changes and test
5. Submit a pull request

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/moonolgerd/k6-test-explorer).

**Enjoy testing with k6!**
