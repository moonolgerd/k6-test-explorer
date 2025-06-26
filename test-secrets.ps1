#!/usr/bin/env pwsh

# Test script to demonstrate k6 secrets functionality
Write-Host "Testing K6 with secrets file..." -ForegroundColor Green

# Check if k6 is installed
try {
    $k6Version = k6 version
    Write-Host "K6 found: $k6Version" -ForegroundColor Yellow
}
catch {
    Write-Host "Error: k6 is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if secrets file exists
$secretsFile = "sample-tests/secrets.json"
if (-Not (Test-Path $secretsFile)) {
    Write-Host "Error: Secrets file not found at $secretsFile" -ForegroundColor Red
    exit 1
}

Write-Host "Secrets file found: $secretsFile" -ForegroundColor Yellow

# Run the secrets test
Write-Host "Running k6 test with secrets..." -ForegroundColor Green
try {
    k6 run --secret-source $secretsFile sample-tests/secrets.test.ts
    Write-Host "Test completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Test failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
