# git-autopush.ps1
# Script to watch a directory and auto-commit and push to GitHub.

$WatcherPath = "d:/antigravity"
$LogFile = "$WatcherPath/autopush.log"

# Set working directory explicitly for detached background shells
Set-Location -Path $WatcherPath

function Write-Log ($Message) {
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] $Message"
    Write-Host $LogMessage -ForegroundColor Cyan
    Add-Content -Path $LogFile -Value $LogMessage
}

Write-Log "Starting Git Auto-Push Watcher..."

# Initialize FileSystemWatcher
$Watcher = New-Object System.IO.FileSystemWatcher
$Watcher.Path = $WatcherPath
$Watcher.Filter = "*.*"
$Watcher.IncludeSubdirectories = $true
$Watcher.EnableRaisingEvents = $true

# Debouncing timer variables
$global:timer = $null

function Sync-Git {
    Write-Log "Processing changes..."
    
    # Check if there are changes
    $status = git status --porcelain
    if ([string]::IsNullOrEmpty($status)) {
        Write-Log "No actual changes to push."
        return
    }
    
    Write-Log "Staging changes..."
    git add -A
    
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $CommitMessage = "Auto-update: $Timestamp"
    
    Write-Log "Committing changes: '$CommitMessage'..."
    $commitOut = git commit -m $CommitMessage 2>&1
    Write-Log "Git Commit output: $commitOut"
    
    Write-Log "Pushing to GitHub..."
    $pushOut = git push origin main 2>&1
    Write-Log "Git Push output: $pushOut"
    
    Write-Log "Sync completed successfully."
}

$EventHandler = {
    param($sender, $e)
    
    $FilePath = $e.FullPath
    $FileName = $e.Name
    
    # Ignore system files, backups, logs, and watcher scripts themselves
    if ($FileName -like "*.git*" -or 
        $FileName -like "*.bak*" -or 
        $FileName -like "*Copy*" -or 
        $FileName -like "autopush.log" -or
        $FileName -like "autopush.pid" -or
        $FileName -like "git-autopush.ps1" -or
        $FileName -like "start-autopush.ps1" -or
        $FileName -like "stop-autopush.ps1") {
        return
    }
    
    # Filter by relevant file extensions
    $Extension = [System.IO.Path]::GetExtension($FilePath).ToLower()
    $AllowedExtensions = @(".js", ".html", ".css", ".json", ".png", ".jpg", ".txt")
    if ($AllowedExtensions -notcontains $Extension) {
        return
    }
    
    Write-Log "Change detected: $FileName ($($e.ChangeType))"
    
    # Reset/debounce timer
    if ($global:timer) {
        $global:timer.Stop()
        $global:timer.Dispose()
    }
    
    # Wait 4 seconds before committing to group multiple saves
    $global:timer = New-Object System.Timers.Timer
    $global:timer.Interval = 4000
    $global:timer.AutoReset = $false
    
    $Action = {
        Sync-Git
    }
    
    Register-ObjectEvent -InputObject $global:timer -EventName Elapsed -Action $Action | Out-Null
    $global:timer.Start()
}

# Register events
$CreatedEvent = Register-ObjectEvent -InputObject $Watcher -EventName Created -Action $EventHandler
$ChangedEvent = Register-ObjectEvent -InputObject $Watcher -EventName Changed -Action $EventHandler
$DeletedEvent = Register-ObjectEvent -InputObject $Watcher -EventName Deleted -Action $EventHandler
$RenamedEvent = Register-ObjectEvent -InputObject $Watcher -EventName Renamed -Action $EventHandler

Write-Log "Watching path: $WatcherPath. Press Ctrl+C to stop."

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
}
finally {
    Write-Log "Stopping Git Auto-Push Watcher..."
    Unregister-Event -SourceIdentifier $CreatedEvent.Name -ErrorAction SilentlyContinue
    Unregister-Event -SourceIdentifier $ChangedEvent.Name -ErrorAction SilentlyContinue
    Unregister-Event -SourceIdentifier $DeletedEvent.Name -ErrorAction SilentlyContinue
    Unregister-Event -SourceIdentifier $RenamedEvent.Name -ErrorAction SilentlyContinue
    $Watcher.Dispose()
}
