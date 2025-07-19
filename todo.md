- After a db import you need to force a total refresh
- Don't need to backup stories table
- Create api tester

```
curl https://api.x.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <x api key>" \
  -d '{
  "messages": [
    {
      "role": "system",
      "content": "You are a test assistant."
    },
    {
      "role": "user",
      "content": "Testing. Just say hi and hello world and nothing else."
    }
  ],
  "model": "grok-3-latest",
  "stream": false,
  "temperature": 0
}'
```
