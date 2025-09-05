# Health Buddy MVP - Development TODO List

## 🎯 MVP Goal
ระบบดูแลผู้สูงอายุผ่าน LINE ที่ใช้ง่าย: เตือนกินยา → บันทึก log → สรุปรายวัน → แจ้งเตือนฉุกเฉิน

---

## 📋 MVP Features Checklist

### Phase 1: Core System Setup (Day 1-2)
- [ ] **LINE OA Configuration**
  - [ ] Create LINE OA account
  - [ ] Setup Messaging API
  - [ ] Configure webhook endpoint
  - [ ] Setup LIFF for mini-app

- [ ] **Database Setup (Supabase)**
  - [ ] Run migration script
  - [ ] Setup RLS policies
  - [ ] Configure realtime subscriptions
  - [ ] Create service keys

- [ ] **Environment Setup**
  - [ ] Configure .env with all keys
  - [ ] Setup OpenAI API
  - [ ] Configure n8n instance
  - [ ] Setup Redis (optional for caching)

### Phase 2: Onboarding Flow (Day 3-4)
- [ ] **Registration System**
  - [ ] Create registration form via LIFF
  - [ ] Collect elderly info (name, age, conditions)
  - [ ] Register medications & schedule
  - [ ] Link caregiver LINE accounts

- [ ] **Initial Setup Messages**
  - [ ] Welcome message with instructions
  - [ ] Quick setup guide
  - [ ] Test reminder scheduling

### Phase 3: Daily Interaction (Day 5-7)
- [ ] **Reminder System**
  - [ ] Morning medication reminder (08:00)
  - [ ] Lunch reminder (12:00)
  - [ ] Evening medication reminder (18:00)
  - [ ] Night check-in (20:00)
  - [ ] Quick Reply buttons (✅ ทานแล้ว / ⏰ ไว้ก่อน)

- [ ] **Log Collection**
  - [ ] Text message logging
  - [ ] Photo upload & storage
  - [ ] Voice message transcription
  - [ ] BP/glucose value extraction
  - [ ] Timestamp recording

- [ ] **Response Handling**
  - [ ] Intent detection (medication/vitals/mood)
  - [ ] Confirmation messages
  - [ ] Data validation
  - [ ] Error handling

### Phase 4: AI & Personas (Day 8-9)
- [ ] **2 MVP Personas**
  - [ ] โอ๊ต - พยาบาลชาย (warm, caring tone)
  - [ ] พลอย - พยาบาลหญิง (gentle, friendly tone)
  - [ ] Persona selection during onboarding
  - [ ] Consistent tone across messages

- [ ] **AI Safety Guardrails**
  - [ ] Limited to utility responses
  - [ ] No deep emotional bonding
  - [ ] Medical question redirect
  - [ ] Fallback responses

- [ ] **Emergency Keywords Detection**
  - [ ] Keywords: "แน่นหน้าอก", "หายใจไม่ออก", "ล้ม", "ช่วย"
  - [ ] Mood indicators: "ไม่อยากอยู่", "เหนื่อย", "เหงา"
  - [ ] Immediate family notification
  - [ ] Emergency escalation flow

### Phase 5: Reports & Alerts (Day 10-11)
- [ ] **Daily Report Generator**
  - [ ] Collect day's logs at 22:00
  - [ ] AI summarization (4 sections)
    - Mood assessment
    - Medication compliance %
    - Notable events
    - Suggestions
  - [ ] Generate Flex Message
  - [ ] Send to registered caregivers

- [ ] **18-Hour Alert System**
  - [ ] Track last interaction timestamp
  - [ ] Check every hour for inactivity
  - [ ] Send alert if > 18 hours
  - [ ] Escalation to multiple caregivers

- [ ] **Flex Message Templates**
  - [ ] Daily report card
  - [ ] Alert notification
  - [ ] Weekly summary
  - [ ] Emergency alert

### Phase 6: LIFF Dashboard (Day 12-13)
- [ ] **Basic Health Graphs**
  - [ ] Medication compliance chart
  - [ ] BP trend (7 days)
  - [ ] Mood tracker (emoji calendar)
  - [ ] Activity timeline

- [ ] **Caregiver View**
  - [ ] View daily reports history
  - [ ] Check current status
  - [ ] Update reminder settings
  - [ ] Emergency contact list

### Phase 7: n8n Workflows (Day 14-15)
- [ ] **Scheduled Jobs**
  - [ ] Daily reminder crons
  - [ ] Hourly activity check
  - [ ] Nightly report generation
  - [ ] Weekly summary

- [ ] **Event-Driven Flows**
  - [ ] Webhook message handler
  - [ ] Photo/voice processing
  - [ ] Alert triggering
  - [ ] Report distribution

- [ ] **Integration Nodes**
  - [ ] LINE API calls
  - [ ] Supabase queries
  - [ ] OpenAI summarization
  - [ ] Media storage

---

## 🔧 Technical Implementation Details

### Database Tables (MVP Schema)
```sql
-- Essential tables only
users (id, line_user_id, name, age, conditions[], persona)
caregivers (id, user_id, line_user_id, relationship, receive_alerts)
medications (id, user_id, name, schedule_times[])
activity_logs (id, user_id, type, content, photo_url, timestamp)
daily_reports (id, user_id, date, summary_json, sent_at)
alerts (id, user_id, type, triggered_at, resolved)
```

### Message Flow Architecture
```
LINE User → Webhook → Intent Detection → Action Handler → Database → Response
                           ↓
                    Emergency Check → Alert System → Caregiver Notification
```

### AI Prompt Template (MVP)
```
You are {persona_name}, a 30-year-old nurse assistant.
Your role is to:
1. Send medication reminders
2. Acknowledge responses politely
3. Log health data
4. Detect emergencies

Constraints:
- Keep responses under 50 words
- Be warm but professional
- Don't engage in personal conversations
- Redirect medical questions to doctors
```

---

## 📊 MVP Success Metrics

### Week 1 Goals
- [ ] 10 test users onboarded
- [ ] 90% reminder delivery rate
- [ ] < 1 min response time
- [ ] 0 critical bugs

### Week 2 Goals
- [ ] 95% daily report generation
- [ ] 100% emergency alert delivery
- [ ] 80% user response rate
- [ ] < 30 sec alert triggering

---

## 🚀 Launch Checklist

### Pre-Launch (Day 16)
- [ ] All workflows tested
- [ ] Emergency flow verified
- [ ] Reports generating correctly
- [ ] Personas responding appropriately

### Soft Launch (Day 17-20)
- [ ] 5 beta families testing
- [ ] Monitor logs for errors
- [ ] Collect feedback
- [ ] Fix critical issues

### MVP Release (Day 21)
- [ ] Documentation ready
- [ ] Support channel active
- [ ] Monitoring dashboard live
- [ ] Backup system ready

---

## 📝 Notes

### Priority Order
1. **Critical**: Reminder system + Basic logging
2. **High**: Daily reports + 18hr alerts
3. **Medium**: AI personas + Emergency detection
4. **Low**: LIFF graphs + Weekly summaries

### Risk Mitigation
- Fallback to simple reminders if AI fails
- Manual alert system if automation breaks
- Direct LINE message if Flex fails
- Phone call option for emergencies

### Post-MVP Roadmap
- Voice interaction
- Medical device integration
- Multi-language support
- Family group features
- Health trend predictions

---

*Last Updated: 2025-01-03*
*MVP Timeline: 3 weeks*
*Team Size: 2-3 developers*