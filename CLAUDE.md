# 🤖 Health Buddy - Development Progress

## 📅 Last Updated: 2025-01-09

## 🎯 Project Goal (MVP Focus)
**MVP**: ระบบดูแลผู้สูงอายุผ่าน LINE ที่ใช้ง่าย - เตือนกินยา → บันทึก log → สรุปรายวัน → แจ้งเตือน 18 ชม.

## 🏗️ Architecture
```
LINE User → LINE Webhook → Vercel (Forward) → n8n Cloud (Process) → LINE Reply
                                                    ↓
                                              Supabase DB
```

## 🔑 Key Components

### 1. **Vercel** (Webhook Endpoint Only)
- URL: https://health-buddy-six.vercel.app/webhook
- File: `/api/webhook.js`
- Function: Forward events to n8n cloud
- Status: ✅ Deployed & Working

### 2. **n8n Cloud** (All Logic & Automation)  
- URL: https://poppsiwaj.app.n8n.cloud
- Workflow: `health-buddy-mvp-fixed.json`
- Features:
  - Intent detection (medication, vitals, emergency, chat)
  - AI Chat with GPT-3.5 (พลอย persona)
  - Image analysis with GPT-4 Vision
  - Quick reply buttons
  - Daily reports (Flex Messages)

### 3. **Supabase** (Database)
- URL: https://mqxklnzxfrupwwkwlwwc.supabase.co
- Tables: users, medication_logs, vitals_logs, alerts

### 4. **LINE OA**
- Channel Access Token: Configured in n8n
- Webhook: Verified ✅

## 🛠️ Setup Progress

### ✅ Completed Tasks
1. Setup LINE OA and configure bot
2. Configure Vercel webhook endpoint only
3. Setup n8n workflows for all automation
4. Setup Supabase database and run migrations
5. Configure environment variables
6. Deploy webhook to Vercel
7. Debug webhook 403 error (fixed)
8. Import and configure n8n workflows
9. Fix node connections in n8n
10. Configure LINE API credential in n8n
11. Configure OpenAI API credential in n8n

### 🔄 In Progress
- Update Vercel environment with n8n webhook URL
- Activate n8n workflow
- Transitioning from Supabase to Airtable

### 📝 Pending Tasks
- Test medication logging feature
- Test vitals tracking feature  
- Test image analysis feature
- Test AI chat feature
- Setup daily report scheduler (22:00)
- Setup 18-hour inactivity alert

## 📁 Project Structure
```
health-buddy/
├── api/
│   └── webhook.js          # Vercel webhook endpoint
├── n8n-workflows/
│   ├── health-buddy-mvp-fixed.json  # Main workflow (use this!)
│   ├── image-analysis-node.json     # Image analysis component
│   ├── mvp-with-ai.json            # Previous version
│   └── IMPORT-GUIDE.md             # Import instructions
├── database/
│   ├── schema.sql          # Database schema
│   └── migrations/         # DB migrations
├── docs/
│   └── api-examples.md     # API documentation
├── .env.local             # Environment variables
├── vercel.json            # Vercel config
└── README.md              # Project documentation
```

## 🔐 Environment Variables

### Vercel (.env.local)
```bash
# LINE
LINE_CHANNEL_ACCESS_TOKEN=k8+TUz8Zqy...
LINE_CHANNEL_SECRET=341f7410352...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://mqxklnzxfrupwwkwlwwc.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...

# n8n
N8N_WEBHOOK_URL=https://poppsiwaj.app.n8n.cloud/webhook/[ACTUAL_PATH]
```

### n8n Credentials
1. **LINE API**: Header Auth with Bearer token
2. **OpenAI**: API key for GPT-3.5 and GPT-4 Vision

## 🧪 Test Commands

Send these messages in LINE to test:

| Command | Feature | Expected Response |
|---------|---------|-------------------|
| "ทานยาแล้ว" | Medication logging | ✅ บันทึกการทานยา + Quick reply |
| "ความดัน 120/80" | Vitals tracking | 📊 บันทึกความดัน + Assessment |
| Send BP image | Image analysis | Analyze BP values from photo |
| "สวัสดีค่ะ" | AI Chat | พลอย will respond |
| "ช่วยด้วย" | Emergency | 🚨 Emergency alert |

## 🚀 Next Steps

1. **Immediate**:
   - [ ] Copy webhook URL from n8n LINE Webhook node
   - [ ] Update N8N_WEBHOOK_URL in Vercel environment
   - [ ] Redeploy Vercel
   - [ ] Activate n8n workflow
   - [ ] Test all features

2. **After Testing**:
   - [ ] Add Schedule node for 22:00 daily report
   - [ ] Setup 18-hour inactivity monitoring
   - [ ] Add more personas (โอ๊ต - male nurse)
   - [ ] Implement group chat features

## 📌 Important Notes

1. **n8n Version**: 1.108.2
2. **Use `health-buddy-mvp-fixed.json`** - this has proper node connections
3. **Webhook Flow**: LINE → Vercel → n8n → Process → LINE Reply
4. **No LIFF needed for MVP** - pure chat interface
5. **AI Models**:
   - Chat: GPT-3.5-turbo (cost-effective)
   - Image: GPT-4-vision-preview or GPT-4o

## 🐛 Known Issues & Fixes

1. **403 Webhook Error**: Fixed by simplifying webhook to always return 200 OK
2. **Nodes not connecting**: Fixed in `health-buddy-mvp-fixed.json` using IF nodes
3. **Token truncation**: Use full token from .env.local

## ⚠️ IMPORTANT - AI WORK RULES

**MUST READ:** `AI-WORK-RULES.md` - Contains critical rules to prevent repeated mistakes
- Checklist for validation
- Common errors to avoid
- Correct formats for all nodes
- Step-by-step testing approach
- **Updated 2025-01-27**: Correct Airtable node operations from actual n8n UI

## 📞 Support

- GitHub: https://github.com/sarunhaha/health-buddy
- n8n Cloud: https://poppsiwaj.app.n8n.cloud
- Vercel: https://health-buddy-six.vercel.app

---
*This document tracks the development progress and serves as a reference for continuing work on the Health Buddy project.*