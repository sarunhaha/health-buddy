# 🚨 AI WORK RULES - MUST FOLLOW EVERY TIME

## 🧠 CRITICAL: ALWAYS USE MEGATHINK MODE
**ทุกครั้งที่เริ่มทำงานให้ใช้ megathink mode ตลอด - NO EXCEPTIONS!**

## 🔄 MANDATORY ON EVERY SESSION START
**ทุกครั้งที่ compact/เริ่มใหม่/clear session ต้องอ่านไฟล์เหล่านี้ ALWAYS!**
1. **n8n docs**: https://docs.n8n.io/?utm_source=n8n_app&utm_medium=app_sidebar
2. **AIRTABLE-SCHEMA.md** - ต้องอ่านก่อนทำงานกับ Airtable ทุกครั้ง!
3. **CLAUDE.md** - Project documentation
4. **LINE LIFF docs**: https://developers.line.biz/en/docs/liff/overview/ - ต้องอ่านก่อนทำ LIFF app!
- อ่านทุกครั้ง ไม่มีข้อยกเว้น!

## 📝 n8n Node Connections & Airtable Operations

### ⚠️ CRITICAL: Node Connections Format
**MUST USE "name" NOT "id" in connections!** (ปัญหาที่เจอบ่อย!)

```json
// ❌ WRONG - Using id
"connections": {
  "schedule_trigger": {  // This is ID - WRONG!
    "main": [[{
      "node": "get_patients",  // This is ID - WRONG!
      "type": "main",
      "index": 0
    }]]
  }
}

// ✅ CORRECT - Using name
"connections": {
  "Every Day at 22:00": {  // This is NAME - CORRECT!
    "main": [[{
      "node": "Get Active Patients",  // This is NAME - CORRECT!
      "type": "main",
      "index": 0
    }]]
  }
}
```

**REMEMBER**: 
- Node has both "id" (e.g., "schedule_trigger") and "name" (e.g., "Every Day at 22:00")
- Connections MUST use "name" field, NOT "id" field
- This is a common mistake that causes nodes to not connect when imported!

### Airtable Node v2 Operations (Updated 2025-01-27):
**⚠️ ACTUAL OPERATIONS FROM n8n UI (ไม่ใช่จาก docs!):**

#### Base Actions:
- `getMany` - Get many bases
- `getSchema` - Get base schema

#### Record Actions:
- `create` - Create a record
- `upsert` - Create or update a record
- `delete` - Delete a record  
- `get` - Get a record
- `search` - Search records
- `update` - Update record

### Airtable Node v2 Correct Format:
```json
{
  "resource": "record",  // หรือ "base" สำหรับ base actions
  "operation": "create|upsert|delete|get|search|update",  // ใช้ตามที่มีใน UI จริง!
  "base": {
    "__rl": true,
    "mode": "id",
    "value": "app3u0M9H6SsZ0J6s"
  },
  "table": {
    "__rl": true,
    "mode": "id",
    "value": "tblXXXXXXXXXXXX"
  },
  "fields": {
    "fieldValues": [
      {
        "fieldName": "fieldName",
        "fieldValue": "value"
      }
    ]
  },
  "credentials": {
    "airtableTokenApi": {
      "id": "1",
      "name": "Airtable API"
    }
  }
}
```

**IMPORTANT**: Always check actual n8n UI for available operations - docs may be outdated!

## 📚 MUST READ DOCUMENTATION (ต้องอ่านก่อนทำทุกครั้ง!)

### 1. **LINE Developers Documentation**: https://developers.line.biz/en/docs/
- **ALWAYS** check official docs before implementing LINE features
- **NEVER** make assumptions about how LINE API works
- Check webhook event structure, API endpoints, console settings
- **LIFF (LINE Front-end Framework)**: https://developers.line.biz/en/docs/liff/overview/
  - **MUST READ BEFORE LIFF DEVELOPMENT**
  - What is LIFF: Platform for web apps within LINE ecosystem
  - LIFF browser: WKWebView (iOS), Android WebView
  - View sizes: Compact, Tall, Full
  - Key SDK methods:
    - `liff.init()` - Initialize LIFF app
    - `liff.getProfile()` - Get user profile
    - `liff.isLoggedIn()` - Check login status
    - `liff.login()` - Trigger login flow
    - `liff.logout()` - Logout user
    - `liff.sendMessages()` - Send messages to chat
    - `liff.closeWindow()` - Close LIFF window
    - `liff.openWindow()` - Open external URL
    - `liff.shareTargetPicker()` - Share to friends/groups
  - Requirements: LINE Login channel, HTTPS endpoint
  - Limitations: Not fully compatible with OpenChat
  - Development tools: LIFF Starter App, Create LIFF App CLI, LIFF Playground
  - **IMPORTANT**: Always use HTTPS, check browser compatibility
- **Flex Messages**: https://developers.line.biz/en/docs/messaging-api/using-flex-messages/
  - Flex Message structure (bubble, carousel)
  - Components (header, hero, body, footer)
  - Elements (text, button, image, box)
  - Flex Message Simulator: https://developers.line.biz/flex-simulator/
  - JSON structure and validation
  - Design guidelines and best practices

### 2. **n8n Documentation**: https://docs.n8n.io/
- **PRIMARY DOCS**: https://docs.n8n.io/?utm_source=n8n_app&utm_medium=app_sidebar
- **ALWAYS** check correct node parameters and formats
- **NEVER** guess node configurations
- Check webhook modes, node types, expression syntax
- **อ่านทุกครั้งที่ compact/clear/เริ่ม session ใหม่**
- Webhook response modes ที่เคยใช้ผิด:
  - ❌ `immediateResponse` → ✅ `immediately`
  - ❌ `responseNode` → ✅ `responseNode` (ต้องมี Response node)
  - ❌ `lastNode` → ✅ `lastNode` (รอ workflow เสร็จ)

### 3. **Supabase Documentation** (ต้องอ่านก่อนใช้ Supabase):
- **Main Docs**: https://supabase.com/docs
  - Getting started guides
  - Product overviews
  - Client library references
- **Database**: https://supabase.com/docs/guides/database
  - Full PostgreSQL database
  - Row Level Security (RLS) - **CRITICAL!**
  - Migrations และ backups
  - Extensions support
  - Table relationships
- **Authentication**: https://supabase.com/docs/guides/auth
  - JWT tokens
  - **anon key** vs **service key** differences:
    - anon key: ใช้กับ client-side, ต้องผ่าน RLS
    - service key: ข้าม RLS, ใช้ server-side เท่านั้น!
  - OAuth providers
  - Magic links และ OTP
- **API**: https://supabase.com/docs/guides/api
  - Auto-generated REST API จาก schema
  - Endpoint: `https://<project_ref>.supabase.co/rest/v1/`
  - Headers required:
    ```
    apikey: YOUR_KEY
    Authorization: Bearer YOUR_KEY
    Content-Type: application/json
    ```
  - PostgREST query syntax
- **Realtime**: https://supabase.com/docs/guides/realtime
  - Listen to database changes
  - Broadcast messages
  - Presence (user states)
- **Storage**: https://supabase.com/docs/guides/storage
  - File uploads/downloads
  - RLS policies for files
  - Public vs private buckets
- **Important Notes**:
  - **ALWAYS enable RLS** on production tables
  - **Use service key carefully** - it bypasses all security
  - Database backups don't include Storage objects
  - Check connection pooling for high traffic
  - Monitor rate limits and quotas
- **ALWAYS** test RLS policies
- **NEVER** expose service key to client

### 4. **Airtable Documentation** (ต้องอ่านก่อนใช้ Airtable):
- **Support Docs**: https://support.airtable.com/
  - Formula reference
  - Field types และ limitations
  - Views และ filtering
  - Best practices
- **API Documentation**: https://airtable.com/developers/web/api/introduction
  - Rate limits (5 req/sec for free)
  - API endpoints และ methods
  - Response formats
  - Error codes
  - Authentication: OAuth หรือ Personal Access Tokens
  - Attachment URLs expire in 2 hours
- **Important Notes**:
  - Field names are CASE SENSITIVE!
  - Table names are CASE SENSITIVE!
  - Use Personal Access Tokens for bots (easier than OAuth)
  - Download attachments immediately (URLs expire)
  - Check permissions: read/comment/edit/create
- **ALWAYS** check exact field/table names
- **NEVER** assume API behavior

### 5. **OpenAI API Documentation** (ต้องอ่านก่อนใช้ AI features):
- **Concepts & Guides**: https://platform.openai.com/docs/concepts
  - Models overview
  - Best practices
  - Rate limits and quotas
  - Error handling
- **API Reference**: https://platform.openai.com/docs/api-reference
  - Chat completions endpoint
  - Vision (GPT-4V) for image analysis
  - Embeddings
  - Function calling
- **Models**:
  - GPT-3.5-turbo (cost-effective)
  - GPT-4 (advanced reasoning)
  - GPT-4-vision-preview (image analysis)
  - GPT-4o (multimodal)
- **Important Notes**:
  - API key required for all requests
  - Rate limits vary by model and tier
  - Token usage affects cost
  - Temperature controls randomness (0-2)
  - Max tokens limits response length
  - System message sets behavior
- **ALWAYS** handle API errors gracefully
- **NEVER** expose API key in client code

### 6. **Vercel Documentation** (ต้องอ่านก่อน deploy):
- **Main Docs**: https://vercel.com/docs
  - Getting started guide
  - Project configuration
  - Deployment concepts
- **Serverless Functions**: https://vercel.com/docs/functions
  - API Routes
  - Edge Functions
  - Function limitations
  - Request/Response handling
- **Environment Variables**: https://vercel.com/docs/environment-variables
  - Development vs Production
  - Secret management
  - System environment variables
- **Domains & DNS**: https://vercel.com/docs/domains
  - Custom domains
  - DNS configuration
  - SSL certificates
- **Important Notes**:
  - Functions have 10 second timeout by default
  - Max payload size: 4.5MB
  - Cold starts can affect performance
  - Use environment variables for secrets
- **ALWAYS** test locally before deploy
- **NEVER** commit secrets to git

### 7. **Supabase Documentation** (ต้องอ่านก่อนใช้ Supabase):
- **Main Docs**: https://supabase.com/docs
  - Getting started guides
  - Product overviews
  - Client library references
- **Database**: https://supabase.com/docs/guides/database
  - Full PostgreSQL database
  - Row Level Security (RLS) - **CRITICAL!**
  - Migrations และ backups
  - Extensions support
  - Table relationships
- **Authentication**: https://supabase.com/docs/guides/auth
  - JWT tokens
  - **anon key** vs **service key** differences:
    - anon key: ใช้กับ client-side, ต้องผ่าน RLS
    - service key: ข้าม RLS, ใช้ server-side เท่านั้น!
  - OAuth providers
  - Magic links และ OTP
- **API**: https://supabase.com/docs/guides/api
  - Auto-generated REST API จาก schema
  - Endpoint: `https://<project_ref>.supabase.co/rest/v1/`
  - Headers required:
    ```
    apikey: YOUR_KEY
    Authorization: Bearer YOUR_KEY
    Content-Type: application/json
    ```
  - PostgREST query syntax
- **Realtime**: https://supabase.com/docs/guides/realtime
  - Listen to database changes
  - Broadcast messages
  - Presence (user states)
- **Storage**: https://supabase.com/docs/guides/storage
  - File uploads/downloads
  - RLS policies for files
  - Public vs private buckets
- **Important Notes**:
  - **ALWAYS enable RLS** on production tables
  - **Use service key carefully** - it bypasses all security
  - Database backups don't include Storage objects
  - Check connection pooling for high traffic
  - Monitor rate limits and quotas
- **ALWAYS** test RLS policies
- **NEVER** expose service key to client

## 🎯 LIFF Development Checklist
**ต้องทำทุกครั้งก่อนสร้าง LIFF app:**
- [ ] Check LIFF documentation first
- [ ] Ensure HTTPS endpoint (LIFF requires HTTPS!)
- [ ] Create LINE Login channel
- [ ] Configure LIFF app size (Compact/Tall/Full)
- [ ] Include LIFF SDK: `<script src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>`
- [ ] Initialize LIFF with correct ID: `liff.init({ liffId: 'YOUR-LIFF-ID' })`
- [ ] Check login status before accessing profile
- [ ] Handle errors properly with try-catch
- [ ] Test in LINE app (not just browser)
- [ ] Check browser compatibility

## ❌ PROBLEMS I KEEP MAKING:
1. **Using "id" instead of "name" in n8n connections** (เจอบ่อยมาก!)
2. Using wrong API/node formats without checking docs
3. Copy-pasting without validation
4. Not testing step by step
5. Making assumptions about versions/formats
6. Fixing multiple things at once instead of one by one
7. Not checking LINE official documentation first

## ✅ MANDATORY CHECKLIST BEFORE ANY WORK:

### 1. **CHECK DOCUMENTATION FIRST**
- [ ] อ่าน LINE Developers docs สำหรับ LINE features
- [ ] อ่าน n8n docs สำหรับ node configurations
- [ ] อ่าน Airtable docs สำหรับ API และ formulas (ถ้าใช้ Airtable)
- [ ] อ่าน Supabase docs สำหรับ database, auth, API (ถ้าใช้ Supabase)
- [ ] ตรวจสอบ official API formats ก่อนเขียน code

### 2. **UNDERSTAND PROJECT**
- [ ] Ask for exact version numbers (n8n, API, Node.js)
- [ ] Ask for actual error messages
- [ ] Ask what has been tested already
- [ ] Check existing files before creating new ones

### 3. **VERIFY BEFORE CODING**
```
ALWAYS CHECK:
- API documentation for correct format
- Node types and versions
- Input/output requirements
- Connection flow logic
```

### 4. **TEST INCREMENTALLY**
```
Step 1: Fix ONE thing
Step 2: Test that ONE thing
Step 3: If works → next issue
Step 4: If fails → stop and analyze
```

### 5. **VALIDATE JSON/CODE**
- Check JSON syntax
- Verify all required fields
- Test data flow paths
- Confirm input/output matches

### 6. **COMMON MISTAKES TO AVOID**

#### n8n Specific:
```
❌ resource: "chat" → ✅ resource: "text"
❌ Merge node multiplex → ✅ Code node pass-through
❌ Parallel IFs → ✅ Switch node
❌ Missing input connections → ✅ Check all data flows
```

#### OpenAI Node:
```
✅ Correct format:
{
  "resource": "text",
  "operation": "message",
  "messages": {
    "values": [
      {"role": "system", "content": "..."},
      {"role": "user", "content": "={{ $json.text }}"}
    ]
  }
}
```

#### LINE Reply:
```
✅ Must have:
- replyToken (valid for 30 seconds)
- messages array
- Content-Type: application/json
```

## 📋 PROJECT SPECIFIC INFO:

### n8n Version: 1.8+
- Uses @n8n/n8n-nodes-langchain.openAi
- resource must be "text" or "image"
- No "chat" resource exists

### Files to Update When Problems Fixed:
1. `problem-bot.md` - Track all problems
2. `CLAUDE.md` - Project documentation
3. Workflow JSON files

### Current Working Files:
- **`AIRTABLE-SCHEMA.md`** - Database schema (READ FIRST!)
- **`main-webhook-complete.json`** - Main webhook workflow
- **Base ID**: app3u0M9H6SsZ0J6s (ไม่ใช่ appOlcNYYD8rfRy5q!)

## 🎯 EFFICIENCY RULES:

1. **ONE CHANGE AT A TIME**
2. **TEST BEFORE NEXT CHANGE**
3. **READ ERROR MESSAGES COMPLETELY**
4. **CHECK DOCS IF UNSURE**
5. **ASK FOR CLARIFICATION INSTEAD OF GUESSING**

## 🔴 CRITICAL REMINDERS:

- **NEVER** create files unless absolutely necessary
- **ALWAYS** check existing files first
- **NEVER** assume formats - verify from docs
- **ALWAYS** validate JSON before saving
- **NEVER** fix multiple issues simultaneously

---

# THIS FILE MUST BE READ EVERY SESSION
# THESE RULES PREVENT REPEATED MISTAKES
# FOLLOW CHECKLIST EVERY TIME

Last Updated: 2025-01-12
Version: 1.2 - Added Supabase documentation with detailed sections