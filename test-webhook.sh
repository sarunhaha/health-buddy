#!/bin/bash

# Test Vercel Webhook
echo "=== Testing Vercel Webhook ==="
curl -X POST https://health-buddy-six.vercel.app/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "events": [{
      "type": "message",
      "message": {
        "type": "text",
        "text": "ลงทะเบียน"
      },
      "source": {
        "type": "user",
        "userId": "test-user-001"
      },
      "replyToken": "test-reply-token"
    }]
  }' -v

echo -e "\n\n=== Check Vercel Logs ==="
echo "Run: vercel logs --prod"

echo -e "\n\n=== Check n8n Executions ==="
echo "Go to: https://poppsiwaj.app.n8n.cloud"
echo "Check Executions tab for new entries"