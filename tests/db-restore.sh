#!/bin/bash

SERVER_URL="http://localhost:3001"

#!/bin/bash

# Check if db-dump.json exists
if [ -f "db-dump.json" ]; then
    echo "Found db-dump.json, proceeding with restore..."
    # Send the file to the server using curl
    curl -X POST "${SERVER_URL}/api/db-import" \
         -H "Content-Type: application/json" \
         -d @db-dump.json
    if [ $? -eq 0 ]; then
        echo "Database restore completed successfully."
    else
        echo "Error: Database restore failed."
        exit 1
    fi
else
    echo "Error: db-dump.json not found."
    exit 1
fi
