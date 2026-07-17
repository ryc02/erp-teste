$file = 'C:\ProgramData\MySQL\MySQL Server 8.0\my.ini'
$content = Get-Content $file -Raw
$content = $content -replace '(?m)^bind-address="127\.0\.0\.1"\r?\n?', ''
Set-Content -Path $file -Value $content

# Remove old rule if exists
Remove-NetFirewallRule -DisplayName "Port 3306" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "MySQL Server 8.0 (Local Subnet Only)" -ErrorAction SilentlyContinue

# Create strict LocalSubnet rule
New-NetFirewallRule -DisplayName "MySQL Server 8.0 (Local Subnet Only)" -Direction Inbound -LocalPort 3306 -Protocol TCP -Action Allow -RemoteAddress LocalSubnet -Profile Any

# Restart service
Restart-Service MySQL80
