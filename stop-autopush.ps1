# stop-autopush.ps1
# Script to stop the Git Auto-Push watcher running in the background.

$WatcherPath = "d:/antigravity"
$PidFile = "$WatcherPath/autopush.pid"

if (Test-Path $PidFile) {
    $TargetPid = Get-Content $PidFile -Raw
    $Process = Get-Process -Id $TargetPid -ErrorAction SilentlyContinue
    
    if ($Process) {
        Stop-Process -Id $TargetPid -Force
        Write-Host "Git Auto-Push Watcher stopped successfully (Process $TargetPid terminated)." -ForegroundColor Green
    } else {
        Write-Host "No active process found with PID $TargetPid. It may have already stopped." -ForegroundColor Yellow
    }
    
    Remove-Item $PidFile -Force
} else {
    Write-Host "Git Auto-Push Watcher is not currently running." -ForegroundColor Yellow
}
