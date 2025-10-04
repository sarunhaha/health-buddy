# 📚 n8n Workflows Explanation

## 🗂️ JSON Workflow Files และหน้าที่

### 1. **1-main-webhook.json** (Workflow หลัก)
**หน้าที่:** รับ webhook จาก LINE และจัดการ intent ต่างๆ

**Flow:**
```
LINE Webhook → Parse Event → Intent Detection → Route to Handler → Reply
```

**Features:**
- รับ webhook events จาก LINE
- ตรวจจับ intent (ทานยา, วัดความดัน, ความดัน, น้ำตาล, ดื่มน้ำ, etc.)
- บันทึกลง activity_log
- ส่ง Quick Reply buttons
- **ไม่มี AI Chat** ในไฟล์นี้

---

### 2. **2-onboarding-registration.json** (ลงทะเบียนแบบ API)
**หน้าที่:** รับ POST request สำหรับสร้าง patient ใหม่

**Flow:**
```
Webhook POST /register → Validate → Create Patient → Return Connection Code
```

**Features:**
- รับข้อมูลผู้ป่วยผ่าน API
- Generate connection code
- สร้าง record ใน patient_profile
- ส่ง LINE message ถ้ามี userId
- **ไม่ใช่ conversational** - รับ data ทั้งหมดใน request เดียว

---

### 3. **3-daily-report-generator.json** (สรุปรายวัน)
**หน้าที่:** สร้างรายงานประจำวันเวลา 22:00

**Flow:**
```
Schedule 22:00 → Get Patients → Get Activities → Calculate → Create Report → Send Flex Message
```

**Features:**
- Cron trigger ทุก 22:00
- ดึงข้อมูลกิจกรรมวัน
- คำนวณ completion rate
- สร้าง Flex Message สวยงาม
- บันทึกลง daily_report

---

### 4. **4-alert-monitor.json** (เตือนไม่ตอบ 18 ชม.)
**หน้าที่:** ตรวจสอบผู้ป่วยที่ไม่ตอบเกิน threshold

**Flow:**
```
Every 6 Hours → Get Patients → Check Last Activity → Send Alert if Needed
```

**Features:**
- ทำงานทุก 6 ชั่วโมง
- เช็คว่าไม่ตอบเกิน noReplyHours
- ส่ง DM แจ้งเตือน caregiver
- Log alert events

---

### 5. **5-medication-reminder.json** (เตือนยา)
**หน้าที่:** เตือนทานยาตามเวลา

**Flow:**
```
Schedule (8:00, 12:00, 19:00) → Get Patients → Build Message → Send with Quick Reply
```

**Features:**
- Cron 3 เวลา/วัน
- ดึง medications จาก patient profile
- ใช้ persona ตาม setting
- Quick Reply buttons (ทานแล้ว/เตือนใหม่/ข้าม)

---

### 6. **test-simple.json** (Test workflow)
**หน้าที่:** Workflow สำหรับทดสอบ
- น่าจะเป็น minimal test case
- ขนาดเล็ก (1KB)

---

## ❓ ปัญหาที่พบ: ไม่มี AI Chat Integration!

ตอนนี้ไม่มี workflow ไหนที่เชื่อมต่อกับ ChatGPT/OpenAI เลย!

### สิ่งที่ขาด:
1. **AI Chat Handler** - สำหรับคุยกับผู้ใช้
2. **OpenAI Node** - เชื่อมต่อกับ GPT
3. **Persona System** - ใช้ AI personas (พลอย/โอ๊ต)
4. **Fallback Handler** - ตอบคำถามนอก intent

### ควรมี:
```
User Message → 
  [IF: Not Matched Intent] → 
    OpenAI Chat → 
    Format Response → 
    Reply
```

---

## 🔧 สิ่งที่ต้องแก้ไข:

### 1. Update 1-main-webhook.json
- เพิ่ม OpenAI node สำหรับ AI chat
- เพิ่ม conversational registration handler
- เพิ่ม fallback สำหรับคำถามทั่วไป

### 2. Transform 2-onboarding-registration.json
- เปลี่ยนจาก API endpoint → Conversational flow
- หรือเก็บไว้แยกสำหรับ API registration

### 3. Add AI Integration
- OpenAI node configuration
- Persona prompts
- Context management
- Safety filters

---

## 📊 Workflow Summary Table

| File | Purpose | Trigger | Has AI? | Status |
|------|---------|---------|---------|--------|
| 1-main-webhook | Main handler | LINE webhook | ❌ No | Need AI |
| 2-onboarding | API registration | POST /register | ❌ No | Need update |
| 3-daily-report | Daily summary | 22:00 daily | ❌ No | OK |
| 4-alert-monitor | Alert system | Every 6 hrs | ❌ No | OK |
| 5-medication | Med reminder | 3 times/day | ❌ No | OK |

---

*Last Analysis: 2025-01-27*