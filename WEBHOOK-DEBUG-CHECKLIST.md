# 🔍 Webhook Debug Checklist

## ปัญหา: พิมพ์ "ลงทะเบียน" แล้วไม่มีการตอบกลับ

### ✅ ตรวจสอบทีละขั้น:

## 1. LINE Developer Console
```
□ Webhook URL = https://health-buddy-six.vercel.app/webhook
□ Use webhook = ON
□ Webhook verify = Success
□ Auto-reply = OFF
□ Greeting message = OFF
```

## 2. n8n Workflow
```
□ Workflow name: 1-main-webhook-with-ai (หรือชื่ออื่น)
□ Status: Active (สวิตช์สีเขียว)
□ LINE Webhook node เป็น node แรก
□ Copy webhook URL จาก node (มี UUID ต่อท้าย)
   Format: https://poppsiwaj.app.n8n.cloud/webhook/XXXXXXXX-XXXX-XXXX
```

## 3. Vercel Environment
```
□ Check current value:
  vercel env ls

□ Update N8N_WEBHOOK_URL:
  - Dashboard: Settings → Environment Variables
  - Value: [URL จาก n8n step 2]
  
□ Redeploy:
  vercel --prod
```

## 4. Test Webhook Chain

### 4.1 Test Vercel Endpoint
```bash
./test-webhook.sh
```
Expected: 200 OK response

### 4.2 Check Vercel Logs
```bash
vercel logs --prod
```
Look for:
- "Webhook Called"
- "Forwarding to n8n"
- Any error messages

### 4.3 Check n8n Executions
```
1. Go to n8n dashboard
2. Click Executions tab
3. Look for new execution
4. If no execution → webhook URL wrong
5. If execution failed → check error in nodes
```

## 5. Common Issues & Fixes

### ❌ Issue: "Not forwarding" in Vercel logs
**Fix:** N8N_WEBHOOK_URL not set or events empty

### ❌ Issue: "n8n forward error: fetch failed"
**Fix:** Wrong webhook URL or n8n workflow not active

### ❌ Issue: n8n execution shows but no reply
**Fix:** 
- Check LINE credentials in n8n
- Check replyToken expired (valid only 1 minute)
- Check Airtable credentials

### ❌ Issue: "Webhook verify failed" in LINE
**Fix:** 
- Vercel endpoint down
- Wrong URL in LINE console

## 6. Quick Test Commands

### Test LINE → Vercel
```bash
curl https://health-buddy-six.vercel.app/webhook
```
Should return: `{"status":"ok","message":"Health Buddy Webhook"}`

### Test Vercel → n8n
```bash
curl $N8N_WEBHOOK_URL \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"events":[{"type":"message","message":{"text":"test"}}]}'
```

### View Vercel Environment
```bash
vercel env pull .env.local
cat .env.local | grep N8N
```

## 7. Step-by-Step Fix

1. **Get correct webhook URL from n8n**
   - Open workflow → LINE Webhook node → Copy URL
   
2. **Update Vercel**
   ```bash
   # Edit .env.local
   N8N_WEBHOOK_URL=https://poppsiwaj.app.n8n.cloud/webhook/[ACTUAL-UUID]
   
   # Deploy
   vercel --prod
   ```

3. **Verify LINE webhook**
   - LINE Console → Verify → Should show "Success"

4. **Test message**
   - Send "ลงทะเบียน" in LINE
   - Check n8n Executions
   - Check Vercel logs

## 8. Expected Flow
```
1. User sends "ลงทะเบียน" in LINE
2. LINE sends to https://health-buddy-six.vercel.app/webhook
3. Vercel webhook.js forwards to n8n URL
4. n8n processes and sends reply via LINE API
5. User sees registration prompt
```

## 9. If All Else Fails

### Option A: Direct Connection (Skip Vercel)
```
1. Copy n8n webhook URL
2. Put directly in LINE console
3. Test without Vercel middleman
```

### Option B: Check Credentials
```
1. n8n → LINE node → Re-add credentials
2. Use full token from .env.local
3. Test with simple reply workflow
```

### Option C: Create New Test Workflow
```
1. Create simple workflow in n8n
2. LINE Webhook → Respond to Webhook
3. Test if basic reply works
4. Then add complexity
```

---

## 📞 Quick Reference

**LINE Token:** (from .env.local)
```
k8+TUz8Zqy+6SNAcdz0CapXM29WKGkeo66239hWYnpufhnDMyxrkCjHFPuKmqfOQSUvWKhQZF2ezKBigi4j2VdKyh5egssSzwOw25bfkr2qeOToX0TnBrox1RU28IZwOE1SqbBoTDUU5dhWmbwM6DQdB04t89/1O/w1cDnyilFU=
```

**Airtable Base ID:**
```
app3u0M9H6SsZ0J6s
```

**Important Files:**
- `/api/webhook.js` - Vercel webhook handler
- `.env.local` - Environment variables
- `test-webhook.sh` - Test script

---

*Debug guide for Health Buddy webhook issues*
*Last updated: 2025-01-27*