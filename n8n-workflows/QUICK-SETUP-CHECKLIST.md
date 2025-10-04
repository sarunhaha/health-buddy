# ✅ Quick Setup Checklist - AI Workflow

## 🚀 Import Workflow (5 minutes)

### 1. Import to n8n
- [ ] Login to n8n: https://poppsiwaj.app.n8n.cloud
- [ ] Create new workflow
- [ ] Import `1-main-webhook-with-ai.json`
- [ ] Save as "Health Buddy Main AI"

### 2. Configure LINE
- [ ] Click LINE Webhook node
- [ ] Add credential → Header Auth
- [ ] Name: `Authorization`
- [ ] Value: `Bearer k8+TUz8Zqy...` (full token from .env)
- [ ] Save credential

### 3. Configure OpenAI
- [ ] Click OpenAI node
- [ ] Add credential → API Key
- [ ] Enter OpenAI API key: `sk-...`
- [ ] Save credential

### 4. Configure Airtable
- [ ] Click any Airtable node
- [ ] Add credential → API Key
- [ ] Get key from: airtable.com/account
- [ ] Save credential

### 5. Activate & Test
- [ ] Click **Activate** toggle
- [ ] Copy webhook URL from LINE Webhook node
- [ ] Update LINE Developer Console webhook
- [ ] Send test message: "ลงทะเบียน"

---

## 🧪 Test Messages

Send these in LINE to test each feature:

| Message | Expected Response |
|---------|------------------|
| ลงทะเบียน | Start registration flow |
| ทานยาแล้ว | Log medication + Quick Reply |
| ความดัน 120/80 | Log blood pressure |
| สวัสดีค่ะ | AI chat with พลอย |
| ช่วยด้วย | Emergency alert |
| ยกเลิก | Cancel registration |

---

## 🔍 Verify Setup

### Check n8n Execution:
1. Go to **Executions** tab
2. See your test message
3. Click to view details
4. Check each node:
   - ✅ Green = Success
   - ❌ Red = Error

### Common Issues:

**No execution showing?**
- Check workflow is activated
- Verify webhook URL in LINE
- Test LINE webhook verify

**OpenAI error?**
- Check API key is valid
- Verify you have credits
- Test with simple prompt

**Airtable error?**
- Check API key permissions
- Verify base ID: `app3u0M9H6SsZ0J6s`
- Check table access

**Registration not saving state?**
- Check conversation_log table
- Verify note field format
- Clear old test data

---

## 📊 Monitor Performance

### After 10 test messages:
- [ ] Check execution success rate
- [ ] Review AI response quality
- [ ] Verify data in Airtable
- [ ] Test Quick Reply buttons
- [ ] Check state persistence

### Metrics to Track:
- Response time < 3 seconds
- Success rate > 95%
- AI accuracy > 90%
- Registration completion > 80%

---

## 🎯 Quick Wins

1. **Test Registration First**
   - Simple flow to verify setup
   - No external API needed
   - Easy to debug

2. **Then Test AI Chat**
   - Requires OpenAI working
   - Check persona response
   - Verify Thai language

3. **Finally Test Intents**
   - Medication logging
   - Blood pressure
   - Emergency detection

---

## 📝 Notes Section

### Your API Keys:
```
LINE Token: Bearer k8+TUz8Zqy...
OpenAI Key: sk-...
Airtable Key: key...
```

### Your Webhook URL:
```
https://poppsiwaj.app.n8n.cloud/webhook/[path]
```

### Test User Data:
```
Name: สมศรี ใจดี
Nickname: ป้าศรี
Phone: 0812345678
DOB: 15/03/2493
```

---

## ⏱️ Time Estimate

- Import workflow: 2 min
- Configure credentials: 5 min
- Activate & test: 3 min
- Debug (if needed): 5-10 min

**Total: ~15 minutes**

---

## 🆘 Quick Help

**Nothing working?**
1. Check workflow is active
2. Verify all credentials saved
3. Test with simple message
4. Check execution logs

**Still stuck?**
- Check `AI-INTEGRATION-GUIDE.md` for details
- Review `WORKFLOW-EXPLANATION.md` 
- See `SIMPLE-REGISTRATION-GUIDE.md`

---

*Quick setup guide for Health Buddy AI workflow*
*Version: 1.0.0*
*Time to implement: 15 minutes*