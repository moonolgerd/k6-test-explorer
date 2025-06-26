# Test K6 Secrets Functionality
# This script tests that secrets are properly loaded and used in k6 tests

Write-Host "🧪 Testing K6 Secrets Functionality" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check if k6 is installed
Write-Host "`n📋 Checking k6 installation..." -ForegroundColor Yellow
try {
    $k6Version = k6 version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ k6 is installed: $($k6Version -split "`n" | Select-Object -First 1)" -ForegroundColor Green
    }
    else {
        Write-Host "❌ k6 is not installed or not in PATH" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ k6 is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if secrets file exists
$secretsFile = "sample-tests\secrets.env"
Write-Host "`n📋 Checking secrets file..." -ForegroundColor Yellow
if (Test-Path $secretsFile) {
    Write-Host "✅ Secrets file found: $secretsFile" -ForegroundColor Green
    
    # Display secrets file content (with masked sensitive data)
    $secretsContent = Get-Content $secretsFile
    Write-Host "📄 Secrets file contains:" -ForegroundColor Blue
    foreach ($line in $secretsContent) {
        if ($line -match "^([^=]+)=(.*)$") {
            $key = $matches[1]
            $value = $matches[2]
            if ($key -eq "api_key" -or $key -eq "password") {
                $maskedValue = $value.Substring(0, [Math]::Min(3, $value.Length)) + "..."
                Write-Host "   $key=$maskedValue" -ForegroundColor Gray
            }
            else {
                Write-Host "   $key=$value" -ForegroundColor Gray
            }
        }
    }
}
else {
    Write-Host "❌ Secrets file not found: $secretsFile" -ForegroundColor Red
    Write-Host "💡 Creating a sample secrets file..." -ForegroundColor Yellow
    
    $sampleSecretsContent = @"
api_key=sk-test-$(Get-Random -Minimum 1000 -Maximum 9999)abcdef
username=testuser
password=secretpassword123
base_url=https://httpbin.org
"@
    
    $sampleSecretsContent | Out-File -FilePath $secretsFile -Encoding UTF8
    Write-Host "✅ Sample secrets file created" -ForegroundColor Green
}

# Test each secrets test file
$testFiles = @(
    "sample-tests\secrets-test.ts"
)

foreach ($testFile in $testFiles) {
    if (Test-Path $testFile) {
        Write-Host "`n🧪 Testing: $testFile" -ForegroundColor Cyan
        Write-Host "Running: k6 run --secret-source=file=$secretsFile $testFile" -ForegroundColor Gray
        
        try {
            $output = k6 run "--secret-source=file=$secretsFile" $testFile 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Test passed: $testFile" -ForegroundColor Green
                
                # Extract key metrics from output
                $lines = $output -split "`n"
                foreach ($line in $lines) {
                    if ($line -match "http_reqs|http_req_failed|http_req_duration") {
                        Write-Host "   📊 $line" -ForegroundColor Blue
                    }
                    if ($line -match "Using API key|Username|Loaded secrets") {
                        Write-Host "   🔑 $line" -ForegroundColor Magenta
                    }
                }
            }
            else {
                Write-Host "❌ Test failed: $testFile" -ForegroundColor Red
                Write-Host "Error output:" -ForegroundColor Red
                Write-Host $output -ForegroundColor Red
            }
        }
        catch {
            Write-Host "❌ Error running test: $testFile" -ForegroundColor Red
            Write-Host "Error: $_" -ForegroundColor Red
        }
    }
    else {
        Write-Host "⚠️  Test file not found: $testFile" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Secrets testing completed!" -ForegroundColor Green
Write-Host "`n💡 To use secrets in VS Code:" -ForegroundColor Yellow
Write-Host "   1. Configure 'k6TestExplorer.secretsFile' in settings" -ForegroundColor Gray
Write-Host "   2. Run tests through Test Explorer" -ForegroundColor Gray
Write-Host "   3. Secrets will be automatically included with --secret-source=file= flag" -ForegroundColor Gray
