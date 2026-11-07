# Start the FreeLLMAPI router hidden in the background.
# No-op if something is already listening on port 3001.
$ErrorActionPreference = 'Stop'
$repo = 'C:\Users\ay660\freellmapi'
$port = 3001

$listening = $false
try {
  $c = New-Object Net.Sockets.TcpClient
  $c.Connect('127.0.0.1', $port)
  $listening = $c.Connected
  $c.Close()
} catch { }

if (-not $listening) {
  Start-Process -FilePath 'E:\Local Disk\node.exe' `
    -ArgumentList 'server\dist\index.js' `
    -WorkingDirectory $repo `
    -RedirectStandardOutput "$repo\server-run.log.out" `
    -RedirectStandardError "$repo\server-run.log.err" `
    -WindowStyle Hidden
}
