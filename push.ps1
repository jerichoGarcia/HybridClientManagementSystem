
# ============================================
# HybridClientManagementSystem
# Git Commit & Push Script
# ============================================

$ErrorActionPreference = "Stop"

# Navigate to the repository folder
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " HybridClientManagementSystem" -ForegroundColor Cyan
Write-Host " GitHub Commit & Push" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verify Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Git is not installed." -ForegroundColor Red
    return
}

# Verify repository
git rev-parse --is-inside-work-tree *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Not a Git repository." -ForegroundColor Red
    return
}

# Detect branch
$branch = (git branch --show-current).Trim()

if (-not $branch) {
    Write-Host "ERROR: No active Git branch." -ForegroundColor Red
    return
}

# Verify remote
$remote = git remote get-url origin 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: GitHub remote 'origin' not found." -ForegroundColor Red
    return
}

Write-Host "Branch: $branch" -ForegroundColor Green
Write-Host "Remote: $remote"
Write-Host ""

# Show pending changes
Write-Host "CURRENT CHANGES:" -ForegroundColor Yellow
git status --short
Write-Host ""

$choice = Read-Host "Stage all non-ignored changes? (YES/NO)"

if ($choice -cne "YES") {
    Write-Host "Cancelled. No new files staged." -ForegroundColor Yellow
    return
}

# Stage changes
git add -A

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Git staging failed." -ForegroundColor Red
    return
}

# Display staged files
Write-Host ""
Write-Host "STAGED FILES:" -ForegroundColor Cyan
git -c core.pager=cat diff --cached --name-status
Write-Host ""

# Detect potentially sensitive files
$stagedFiles = @(git diff --cached --name-only)

$sensitiveFiles = @($stagedFiles | Where-Object {
    $_ -match '(^|/)(\.env($|\.)|.*\.backup$|.*\.dump$|.*\.pfx$|.*\.pem$|secrets\.json$|appsettings.*\.json$)'
})

if ($sensitiveFiles.Count -gt 0) {
    Write-Host "STOP: Potentially sensitive files staged:" -ForegroundColor Red
    $sensitiveFiles | ForEach-Object { Write-Host $_ }
    Write-Host "Review and unstage these files before running again."
    return
}

# Check whitespace problems
git -c core.pager=cat diff --cached --check

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Whitespace issues detected." -ForegroundColor Red
    Write-Host "Fix the reported lines before committing."
    return
}

# Check for changes to commit
git diff --cached --quiet
$diffResult = $LASTEXITCODE

if ($diffResult -eq 0) {
    Write-Host "No new changes to commit." -ForegroundColor Yellow
}
elseif ($diffResult -eq 1) {

    Write-Host ""
    Write-Host "Review the staged files carefully." -ForegroundColor Yellow
    Write-Host "Do not proceed if any file contains passwords or secrets."
    Write-Host ""

    $confirm = Read-Host "Type COMMIT to continue"

    if ($confirm -cne "COMMIT") {
        Write-Host "Cancelled. Staged changes were preserved."
        return
    }

    # Commit message
    $message = Read-Host "Enter your commit message"

    if ([string]::IsNullOrWhiteSpace($message)) {
        Write-Host "ERROR: Commit message is required." -ForegroundColor Red
        return
    }

    Write-Host ""
    Write-Host "Creating commit..." -ForegroundColor Cyan

    git commit -m $message

    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Commit failed." -ForegroundColor Red
        return
    }

    Write-Host "Commit created!" -ForegroundColor Green
}
else {
    Write-Host "ERROR: Could not check staged changes." -ForegroundColor Red
    return
}

# Push to GitHub
Write-Host ""
$pushConfirm = Read-Host "Push committed changes to origin/$branch? (YES/NO)"

if ($pushConfirm -cne "YES") {
    Write-Host "Push cancelled. Local commits are preserved."
    return
}

Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan

git push -u origin $branch

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Push failed." -ForegroundColor Red
    Write-Host "Your local commits are preserved."
    return
}

# Success
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " SUCCESS! PUSHED TO GITHUB" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host ""
Write-Host "Latest commit:"
git log -1 --oneline

Write-Host ""
Write-Host "Final Git status:"
git status --short

Write-Host ""
