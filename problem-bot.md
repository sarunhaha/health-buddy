# 🐛 Health Buddy Bot - Problem Tracking

## 📅 Last Updated: 2025-01-09

## 🔴 Current Problems

### 5. Intermittent Webhook Failures
**Status:** ✅ Resolved  
**Problem:** Webhook บางครั้งทำงาน บางครั้ง fetch failed  
**Root Cause:** Network instability และไม่มี retry mechanism
**Solution:** เพิ่ม timeout, better error logging, และ auto-retry สำหรับ network failures

**Fix Applied:**
- [x] Add 5-second timeout to prevent hanging
- [x] Add specific error logging for different failure types
- [x] Implement auto-retry for fetch failed errors
- [x] Better logging to track response status

### 6. Vercel to n8n Forward Not Working
**Status:** 🔄 In Progress  
**Problem:** curl direct to n8n works, but LINE → Vercel → n8n doesn't create execution
**Verified:** 
- curl to n8n directly = works ✅
- curl to Vercel = returns 200 but no n8n execution ❌
- Vercel logs show "Forward initiated to n8n"

**Root Cause:** Likely Vercel production env vars not updated
**Troubleshooting Steps:**
- [x] Test n8n webhook directly - works
- [x] Test via Vercel endpoint - returns 200 but no execution
- [x] Add response logging to debug
- [ ] Verify Vercel production env vars
- [ ] Check if env vars are set for all environments
- [ ] Redeploy after env var update

### 7. No LINE Reply Despite Successful Webhook  
**Status:** 🔄 In Progress  
**Problem:** Webhook forward สำเร็จ แต่ไม่มีข้อความตอบกลับใน LINE  
**Possible Causes:**
- Workflow execution timeout
- Parse Event node intent detection issues
- IF nodes conditions don't match
- No fallback path for unmatched conditions

**Troubleshooting Steps:**
- [x] Verify webhook reaches n8n 
- [ ] Simplify workflow for testing
- [ ] Check Parse Event output
- [ ] Add default/fallback reply path
- [ ] Test with fixed text reply

## 🔴 Previous Problems (Now Resolved)

### 1. LINE Webhook Not Receiving Messages
**Status:** ✅ Resolved  
**Problem:** LINE ส่งข้อความมาที่ Vercel แล้ว แต่ n8n ไม่ได้รับ (fetch failed)  
**Error:** `n8n forward error (non-blocking): fetch failed`  
**Root Cause:** Webhook path mismatch ระหว่าง Vercel และ n8n
**Solution:** ใช้ path `line-bot-webhook` ที่ตั้งใน n8n workflow และ update ให้ตรงกันทั้ง 2 ที่

**Troubleshooting Steps:**
- [x] ตรวจสอบ LINE webhook URL configuration
- [x] ตรวจสอบ Vercel logs - พบ error fetch failed
- [x] ตรวจสอบ n8n workflow activation status
- [x] Test webhook directly with curl - พบว่า `line-bot-webhook` ทำงาน (200 OK)
- [x] Update `.env.local` ใช้ `line-bot-webhook`
- [x] Verify n8n webhook responds with 200 OK

---

### 2. LINE Reply Node - Invalid Reply Token
**Status:** ✅ Resolved  
**Problem:** Reply token ไม่ valid เพราะใช้ test data (pinData)  
**Error:** `400 - Invalid reply token`  
**Solution:** ลบ pinData และทดสอบด้วย LINE จริงเท่านั้น

**Fix Applied:**
- [x] Remove pinData from LINE Webhook node
- [x] Test with actual LINE messages only
- [x] Understand reply token has 30-second expiry

---

### 3. LINE Reply Node - JSON Parameter Error
**Status:** ✅ Resolved  
**Problem:** JSON body format ไม่ถูกต้องใน HTTP Request  
**Error:** `JSON parameter needs to be valid JSON`  
**Solution:** แก้ไข JSON body expression ใน LINE Reply node

**Fix Applied:**
- [x] Change from `={{ JSON.stringify($json) }}` to proper format
- [x] Update body structure to match LINE API requirements

---

### 4. Webhook Configuration Mismatch
**Status:** 🔄 In Progress  
**Problem:** LINE OA ไม่ส่ง webhook มาเลยในตอนแรก  
**Root Cause:** Response mode ใน LINE OA Manager ยังเป็น "Chat" แทนที่จะเป็น "Bot"

**Configuration Checklist:**
- [x] LINE Developers Console - Webhook URL set
- [x] LINE Developers Console - Use webhook: ON
- [ ] LINE OA Manager - Response mode: Bot
- [ ] LINE OA Manager - Webhooks: ON
- [ ] LINE OA Manager - Auto-response: OFF

---

## ✅ Resolved Problems

### Problem #1: Webhook Returns 403
**Date Resolved:** 2025-01-08  
**Solution:** Simplified webhook to always return 200 OK without signature validation in MVP

### Problem #2: Node Connections in n8n
**Date Resolved:** 2025-01-08  
**Solution:** Fixed using IF nodes instead of Switch node in workflow

### Problem #3: Token Truncation in Environment
**Date Resolved:** 2025-01-08  
**Solution:** Used full token from .env.local file

---

## 📝 Problem Resolution Process

1. **Identify** - จับ error message และ logs
2. **Diagnose** - หา root cause 
3. **Fix** - แก้ไขตามขั้นตอน
4. **Test** - ทดสอบว่าแก้ได้จริง
5. **Document** - อัพเดทใน problem-bot.md

---

## 🔧 Common Issues & Quick Fixes

| Problem | Quick Check | Quick Fix |
|---------|-------------|-----------|
| No webhook received | Check LINE OA Manager settings | Set Response mode to "Bot" |
| Fetch failed | Check n8n webhook path | Ensure path matches in both Vercel & n8n |
| Invalid reply token | Check if using test data | Use real LINE messages only |
| JSON error | Check body format | Use proper JSON expression |
| Workflow not triggered | Check activation status | Activate workflow in n8n |

---

## 📊 Problem Statistics

- **Total Problems Encountered:** 7
- **Resolved:** 3
- **In Progress:** 2
- **Pending:** 2

---

## 🚀 Next Actions

1. Update Vercel environment variables with new webhook path
2. Update n8n webhook node to use `line-bot-webhook`
3. Configure LINE OA Manager properly (Bot mode)
4. Test end-to-end webhook flow
5. Document any new problems that arise

---

*This document tracks all problems encountered during Health Buddy bot development. Update this file whenever a new problem is found or resolved.*