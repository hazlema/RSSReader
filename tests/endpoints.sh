#!/bin/bash
SERVER_URL="http://localhost:3001"

echo 
echo 
echo "Health check"
curl -X GET "${SERVER_URL}/api/health"

echo 
echo 
echo "Thumbnail fetch"
curl -X GET "${SERVER_URL}/api/thumbnail?url=https://foxnews.com"

echo 
echo 
echo "xAI: Testing connection"
curl -X GET "${SERVER_URL}/api/check-xapi"

echo 
echo 
echo "xAI: Testing communications"
curl -X POST "${SERVER_URL}/api/askGrok" -H "Content-Type: application/json" -d '{"question":"What is the capital of New Hampshire, USA?"}'

echo 
echo 
echo "Backing up - Database dump"
HEADER='{"exportInfo": {"timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%NZ)'","version": "1.0.0","application": "RSS Reader"},"data": '
FOOTER='}'
DUMP=$(curl -s -X GET "${SERVER_URL}/api/db-dump")
echo "${HEADER}${DUMP}${FOOTER}" > db-dump.json

echo 
echo 
echo "Database import (empty)"
echo "Everything will have been reset, go check the database or use the web interface"
DATA='{"exportInfo":{"timestamp":"2025-07-20T16:49:01.066Z","version":"1.0.0","application":"RSS Reader"},"data":{"categories":[{"uid":1,"title":"Import Test Pass"}]}}'
curl -X POST "${SERVER_URL}/api/db-import" -H "Content-Type: application/json" -d "$DATA"

echo 
echo "You will need to retore the database backup (db-dump.json) via the interface or use the script db-restore.sh"
echo 
echo 
