# Windows Powershell

$SERVER_URL = "http://localhost:3001"

# Check if db-dump.json exists
if (Test-Path -Path "db-dump.json") {
    Write-Host "Found db-dump.json, proceeding with restore..."
    # Send the file to the server using Invoke-RestMethod
    $response = Invoke-RestMethod -Uri "$SERVER_URL/api/db-import" -Method Post -ContentType "application/json" -InFile "db-dump.json"
    if ($?) {
        Write-Host "Database restore completed successfully."
    } else {
        Write-Host "Error: Database restore failed."
        exit 1
    }
} else {
    Write-Host "Error: db-dump.json not found."
    exit 1
}