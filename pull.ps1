
# ============================================
# HybridClientManagementSystem
# GitHub Pull Script
# ============================================

$ErrorActionPreference = "Stop"

# Navigate to the folder containing this script
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " HybridClientManagementSystem" -ForegroundColor Cyan
Write-Host " GitHub Pull - Latest Updates" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Git is not installed." -ForegroundColor Red
    return
}

# Verify this is the repository root
$repoRoot = git rev-parse --show-toplevel 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Not a Git repository." -ForegroundColor Red
    return
}

$expectedRoot = (Resolve-Path $PSScriptRoot).Path
$actualRoot = (Resolve-Path $repoRoot.Trim()).Path

if ($expectedRoot -ne $actualRoot) {
    Write-Host "ERROR: Place pull.ps1 in the repository root." -ForegroundColor Red
    return
}

# Detect the current branch
$branch = (git branch --show-current).Trim()

if ($LASTEXITCODE -ne 0 -or -not $branch) {
    Write-Host "ERROR: No active Git branch." -ForegroundColor Red
    return
}

# Verify the GitHub remote
$remote = git remote get-url origin 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Origin remote not found." -ForegroundColor Red
    return
}

$expectedRemote = "github.com/jerichoGarcia/HybridClientManagementSystem"

if ($remote -notmatch "github\.com[:/]jerichoGarcia/HybridClientManagementSystem(\.git)?$") {
    Write-Host "ERROR: Unexpected Git remote:" -ForegroundColor Red
    Write-Host $remote
    return
}

Write-Host "Branch: $branch" -ForegroundColor Green
Write-Host "Remote: $remote"
Write-Host ""

# Stop if local changes exist
$changes = @(git status --porcelain --untracked-files=normal)

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Could not check Git status." -ForegroundColor Red
    return
}

if ($changes.Count -gt 0) {
    Write-Host "WARNING: Local changes detected!" -ForegroundColor Yellow
    $changes | ForEach-Object { Write-Host $_ }

    Write-Host ""
    Write-Host "Pull cancelled to protect your work." -ForegroundColor Red
    Write-Host "Commit or safely stash your changes first."
    return
}

# Confirm the branch
if ($branch -ne "main") {
    Write-Host "ERROR: Expected branch main, found $branch." -ForegroundColor Red
    return
}

Write-Host "Checking GitHub for updates..." -ForegroundColor Cyan

# Fetch updates without modifying working files
git fetch origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Could not fetch GitHub updates." -ForegroundColor Red
    return
}

# Check if branch has diverged
$counts = git rev-list --left-right --count "HEAD...origin/main"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Could not compare branches." -ForegroundColor Red
    return
}

$parts = ($counts.Trim() -split '\s+')
$ahead = [int]$parts[0]
$behind = [int]$parts[1]

if ($ahead -gt 0) {
    Write-Host "WARNING: Local commits not on GitHub." -ForegroundColor Yellow
    Write-Host "Pull cancelled. Review Git history first."
    return
}

if ($behind -eq 0) {
    Write-Host ""
    Write-Host "Already up to date!" -ForegroundColor Green
}
else {
    Write-Host ""
    Write-Host "$behind new commit(s) available." -ForegroundColor Yellow

    $confirm = Read-Host "Download updates? (YES/NO)"

    if ($confirm -cne "YES") {
        Write-Host "Pull cancelled."
        return
    }

    # Fast-forward only: no automatic merge commits
    git merge --ff-only origin/main

    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Pull failed. No reset performed." -ForegroundColor Red
        return
    }

    Write-Host ""
    Write-Host "SUCCESS! Project updated." -ForegroundColor Green
}

Write-Host ""
Write-Host "Latest commit:"
git log -1 --oneline

Write-Host ""
Write-Host "Current Git status:"
git status --short

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " GitHub Synchronization Complete" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
