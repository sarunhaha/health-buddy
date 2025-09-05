# 🏥 Health Buddy - LINE Healthcare Companion

AI-powered LINE chatbot for elderly healthcare monitoring with daily family reports.

## 🌟 Features

### For Elderly Users
- 💊 **Medication Reminders** - Daily reminders with quick reply buttons
- 📊 **Health Tracking** - Log blood pressure, glucose, weight via chat
- 🗣️ **AI Companion** - Friendly conversation with 2 personas (โอ๊ต/พลอย)
- 📸 **Photo Logging** - Send photos of medications or vitals
- 🚨 **Emergency Detection** - Automatic alerts for critical keywords

### For Family Members
- 📱 **Daily Reports** - Automated health summary at 22:00
- ⚠️ **18-Hour Alerts** - Notification if no response from elderly
- 📈 **Trend Analysis** - Weekly health patterns
- 🔔 **Real-time Alerts** - Immediate notification for emergencies

## 🛠 Tech Stack

- **LINE Messaging API** - Bot interface
- **Vercel** - Serverless webhook hosting
- **n8n Cloud** - Workflow automation
- **Supabase** - PostgreSQL database with realtime
- **OpenAI API** - AI conversation and report generation

## 📋 Prerequisites

1. **LINE Official Account** with Messaging API enabled
2. **Supabase** project for database
3. **n8n Cloud** account for automation
4. **Vercel** account for deployment
5. **OpenAI API** key (optional for AI features)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/sarunhaha/health-buddy.git
cd health-buddy
```

### 2. Setup Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 3. Database Setup
```sql
-- Run migration in Supabase SQL Editor
-- Copy content from database/supabase-migration.sql
```

### 4. Deploy to Vercel
```bash
npm i -g vercel
vercel --prod
```

### 5. Configure LINE Webhook
```
LINE Developers Console
→ Webhook URL: https://your-app.vercel.app/webhook
→ Use webhook: ON
```

### 6. Import n8n Workflows
- Import JSON files from `n8n-workflows/` to your n8n cloud
- Configure credentials in n8n

## 📁 Project Structure

```
health-buddy/
├── api/
│   └── webhook.js         # Vercel serverless function
├── n8n-workflows/         # Automation workflows
│   ├── webhook-handler.json
│   ├── daily-reminders.json
│   └── daily-report.json
├── database/
│   └── supabase-migration.sql
├── docs/                  # Setup guides
└── src/                   # Source code (if needed)
```

## 🔄 System Flow

```
User → LINE App → Vercel Webhook → n8n Cloud → Supabase
                                       ↓
                                    OpenAI
                                       ↓
                                 Daily Reports → Family
```

## ⚙️ Configuration

### Daily Schedule (Bangkok Time)
- **08:00** - Morning medication reminder
- **12:00** - Noon medication reminder
- **18:00** - Evening medication reminder
- **22:00** - Daily report to family
- **Every hour** - Check for 18-hour inactivity

### Alert Thresholds
- No response > 18 hours
- Blood pressure > 180/110 or < 90/60
- Glucose > 300 or < 70
- Emergency keywords: "ช่วย", "หายใจไม่ออก", "แน่นหน้าอก"

## 🧪 Testing

1. Add bot as friend (scan QR from LINE Developers)
2. Send test messages:
   - "สวัสดี" - Greeting
   - "ทานยาแล้ว" - Log medication
   - "ความดัน 120/80" - Log blood pressure
   - "ช่วยด้วย" - Trigger emergency

## 📊 MVP Scope

### ✅ Phase 1 (Current)
- Basic medication reminders
- Simple health logging
- Daily reports via Flex Messages
- 18-hour inactivity alerts
- Emergency keyword detection

### 🔜 Phase 2 (Planned)
- LIFF dashboard for graphs
- Voice message support
- Medical device integration
- Multi-language support
- Family group features

## 🔐 Security

- LINE signature validation
- Supabase Row Level Security
- Environment variables for secrets
- No medical advice - reminders only

## 📝 Documentation

- [LINE OA Setup Guide](docs/LINE_OA_SETUP_GUIDE.md)
- [LINE Group Bot Guide](docs/LINE_GROUP_BOT_GUIDE.md)
- [MVP Todo List](MVP_TODO.md)

## 🤝 Contributing

This is a private MVP project. For issues or suggestions, please contact the maintainer.

## 📄 License

Private - All rights reserved

## 👨‍💻 Maintainer

- GitHub: [@sarunhaha](https://github.com/sarunhaha)

## 🙏 Acknowledgments

- LINE Messaging API
- Vercel for hosting
- Supabase for database
- n8n for automation
- OpenAI for AI capabilities

---

**Status**: 🟢 MVP Development

**Last Updated**: January 2025