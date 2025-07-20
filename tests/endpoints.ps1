# Windows Powershell

$SERVER_URL = "http://localhost:3001"

Write-Host "`nHealth check"
Invoke-RestMethod -Uri "$SERVER_URL/api/health" -Method Get

Write-Host "`nThumbnail fetch"
Invoke-RestMethod -Uri "$SERVER_URL/api/thumbnail?url=https://foxnews.com" -Method Get

Write-Host "`nxAI: Testing connection"
Invoke-RestMethod -Uri "$SERVER_URL/api/check-xapi" -Method Get

Write-Host "`nxAI: Testing communications"
$body = @{ question = "What is the capital of New Hampshire, USA?" } | ConvertTo-Json
Invoke-RestMethod -Uri "$SERVER_URL/api/askGrok" -Method Post -ContentType "application/json" -Body $body

Write-Host "`nBacking up - Database dump"
$header = '{"exportInfo": {"timestamp": "' + (Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ") + '","version": "1.0.0","application": "RSS Reader"},"data": '
$footer = '}'
$dump = Invoke-RestMethod -Uri "$SERVER_URL/api/db-dump" -Method Get
"$header$dump$footer" | Out-File -FilePath "db-dump.json" -Encoding UTF8

Write-Host "`nDatabase import (empty)"
Write-Host "Everything will have been reset, go check the database or use the web interface"
$data = '{"exportInfo":{"timestamp":"2025-07-20T16:49:01.066Z","version":"1.0.0","application":"RSS Reader"},"data":{"categories":[{"uid":1,"title":"Import Test Pass"}]}}'
Invoke-RestMethod -Uri "$SERVER_URL/api/db-import" -Method Post -ContentType "application/json" -Body $data

Write-Host "You will need to restore the database backup (db-dump.json) via the interface or use the script db-restore.ps1"
Write-Host
