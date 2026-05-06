# AlvaroCaveroVFX — Deploy Script
param()

$ErrorActionPreference = "Stop"
$ProjectDir = $PSScriptRoot

Write-Host ""
Write-Host "=== AlvaroCaveroVFX Deploy ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build
Write-Host "[1/4] Building production bundle..." -ForegroundColor Yellow
Set-Location $ProjectDir
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build FAILED. Aborting deploy." -ForegroundColor Red
    exit 1
}
Write-Host "Build succeeded." -ForegroundColor Green
Write-Host ""

# Step 2: Stage all changes
Write-Host "[2/4] Staging changes..." -ForegroundColor Yellow
git add .
Write-Host ""

# Step 3: Commit message prompt
Write-Host "[3/4] Enter commit message:" -ForegroundColor Yellow
$CommitMsg = Read-Host "> "
if ([string]::IsNullOrWhiteSpace($CommitMsg)) {
    Write-Host "Commit message cannot be empty. Aborting." -ForegroundColor Red
    exit 1
}
git commit -m $CommitMsg
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nothing to commit or commit failed." -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Push
Write-Host "[4/4] Pushing to GitHub..." -ForegroundColor Yellow
git push
if ($LASTEXITCODE -ne 0) {
    Write-Host "Push FAILED." -ForegroundColor Red
    exit 1
}
Write-Host ""
Write-Host "Deployed! Opening Vercel site..." -ForegroundColor Green
Start-Process "https://alvarocaverovfx.vercel.app"
