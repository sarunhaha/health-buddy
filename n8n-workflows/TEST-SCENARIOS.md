# 🧪 Health Buddy - Test Scenarios

## 📅 Last Updated: 2025-01-27

---

## 🎯 Test Scenario 1: Patient Registration via LINE OA

### Overview
ทดสอบการลงทะเบียนผู้ป่วยใหม่ผ่าน LINE Official Account โดยใช้ connection code

### Pre-requisites
- [ ] LINE OA ถูก setup และ webhook เชื่อมต่อกับ n8n แล้ว
- [ ] Workflow 1 (Inbound Handler) active ใน n8n พร้อม conversational registration
- [ ] Airtable base พร้อมใช้งาน (Base ID: `app3u0M9H6SsZ0J6s`)
- [ ] มี LINE account สำหรับทดสอบ (ผู้ป่วย + ผู้ดูแล)
- [ ] Rich Menu configured with "ลงทะเบียน" button

---

## 📝 Step-by-Step Test Instructions

### Phase 1: Register Patient via Conversational Chat

#### Step 1.1: Start Registration Conversation
เริ่มการลงทะเบียนโดยพิมพ์ในแชทส่วนตัวกับ Bot (ไม่ใช่ในกลุ่ม):

**Input:** พิมพ์หรือกดปุ่ม Rich Menu
```
ลงทะเบียน
```

**Expected Response:**
```
สวัสดีค่ะ ยินดีต้อนรับสู่ Health Buddy 🏥
ดิฉันจะช่วยลงทะเบียนผู้สูงอายุให้นะคะ

ขอทราบชื่อ-นามสกุลของผู้สูงอายุค่ะ
(ตัวอย่าง: คุณสมศรี ใจดี)
```

#### Step 1.2: Complete Registration Conversation

**Conversation Flow:**

```
Bot: ขอทราบชื่อ-นามสกุลของผู้สูงอายุค่ะ
User: สมศรี ใจดี

Bot: ขอทราบชื่อเล่นที่ใช้เรียกค่ะ (เช่น คุณยาย, คุณแม่)
User: คุณแม่

Bot: เพศของคุณแม่ค่ะ
[Quick Reply: ชาย | หญิง]
User: หญิง

Bot: วันเกิดค่ะ (รูปแบบ: วว/ดด/ปปปป)
User: 01/05/2498

Bot: คุณแม่มีโรคประจำตัวไหมคะ
[Quick Reply: เบาหวาน | ความดัน | หัวใจ | ไม่มี]
User: เบาหวาน

Bot: มียาที่ทานประจำไหมคะ (พิมพ์ชื่อยาและเวลา หรือพิมพ์ "ไม่มี")
User: Metformin 500mg เช้า-เย็น

Bot: มีประวัติแพ้ยาหรืออาหารไหมคะ
User: ไม่มี

Bot: ขอทราบชื่อผู้ดูแลหลักค่ะ
User: นางสาวอรุณี ใจดี

Bot: ความสัมพันธ์กับคุณแม่ค่ะ
[Quick Reply: ลูก | หลาน | คู่สมรส | ญาติ | อื่นๆ]
User: ลูก

Bot: เบอร์โทรผู้ดูแลค่ะ (สำหรับแจ้งเตือนฉุกเฉิน)
User: 081-234-5678

Bot: ✅ ข้อมูลครบถ้วนแล้วค่ะ กำลังลงทะเบียน...

🎊 ลงทะเบียนสำเร็จ!

👤 ผู้สูงอายุ: คุณแม่ (คุณสมศรี)
📅 อายุ: 67 ปี
💊 โรค: เบาหวาน
👩 ผู้ดูแล: นางสาวอรุณี (ลูก)

🔑 รหัสเชื่อมต่อ: TEST-9999

📝 ขั้นตอนต่อไป:
1. สร้างกลุ่ม LINE ครอบครัว
2. เชิญ Health Buddy เข้ากลุ่ม
3. พิมพ์รหัส TEST-9999 ในกลุ่ม
4. ระบบจะเชื่อมต่ออัตโนมัติ

⚠️ รหัสนี้ใช้ได้ 7 วัน
```

#### Step 1.3: Handle Registration Errors

**Scenario: Invalid Date Format**
```
Bot: วันเกิดค่ะ (รูปแบบ: วว/ดด/ปปปป)
User: 1 พฤษภาคม 2498
Bot: ⚠️ กรุณาใส่วันเกิดในรูปแบบ วว/ดด/ปปปป เช่น 01/05/2498 ค่ะ
```

**Scenario: Cancel Registration**
```
User: ยกเลิก
Bot: ยกเลิกการลงทะเบียนแล้วค่ะ หากต้องการลงทะเบียนใหม่ พิมพ์ "ลงทะเบียน" ได้เลยค่ะ
```

#### Step 1.4: Verify in Airtable
1. เปิด Airtable base: Health Buddy Duulair
2. ไปที่ table `patient_profile`
3. **Verify:**
   - [ ] Record สร้างสำเร็จ
   - [ ] Field `patientName` = "สมศรี ใจดี"
   - [ ] Field `displayName` = "คุณแม่"
   - [ ] Field `connectionCode` มีค่า (auto-generated)
   - [ ] Field `groupId` ยังว่างอยู่ (รอการ connect)
   - [ ] Field `userId` = LINE userId ของผู้ลงทะเบียน
   - [ ] Field `active` = checked ✅

---

### Phase 2: LINE Group Setup

#### Step 2.1: Create LINE Group
1. เปิด LINE app บนมือถือ
2. สร้างกลุ่มใหม่ชื่อ "Test Health Buddy"
3. เชิญสมาชิกครอบครัว (อย่างน้อย 2 คน)

#### Step 2.2: Add Bot to Group
1. ค้นหา LINE OA: @healthbuddy (หรือชื่อที่ตั้งไว้)
2. เพิ่มเป็นเพื่อน
3. เชิญ bot เข้ากลุ่ม "Test Health Buddy"

#### Step 2.3: Activate Connection
1. พิมพ์ connection code ในกลุ่ม (ตามที่ได้จาก Step 1.1):
   ```
   #connect TEST-9999
   ```
   หรือ
   ```
   TEST-9999
   ```

2. **Expected Response:**
   ```
   ✅ เชื่อมต่อสำเร็จ!
   
   ยินดีต้อนรับคุณทดสอบค่ะ
   ตอนนี้ระบบพร้อมดูแลสุขภาพแล้ว
   
   📋 ข้อมูลที่ลงทะเบียน:
   • ชื่อ: คุณทดสอบ
   • โรคประจำตัว: เบาหวาน, ความดัน
   • ยาที่ต้องทาน: 2 รายการ
   • ผู้ดูแล: ลูกสาว
   
   🔔 ระบบจะเตือน:
   • ยาตอน 08:00, 19:00
   • รายงานประจำวัน 22:00
   • แจ้งเตือนถ้าไม่ตอบ > 18 ชม.
   ```

#### Step 2.4: Verify in Airtable
1. กลับไปที่ Airtable
2. Check record ที่สร้างไว้
3. **Verify:**
   - [ ] Field `groupId` มีค่าแล้ว (เช่น "C1234567890abcdef")
   - [ ] Timestamp updated

---

### Phase 3: Test Basic Interactions

#### Step 3.1: Test Medication Confirmation
**Input:** พิมพ์ในกลุ่ม
```
ทานยาแล้ว
```

**Expected Response:**
```
✅ บันทึกการทานยาเรียบร้อยค่ะ
เก่งมากค่ะคุณทดสอบ 💊

กิจกรรมวันนี้:
• ทานยา: 1/2 ครั้ง
• วัดความดัน: 0/1 ครั้ง
```

**Verify in Airtable:**
- [ ] New record in `activity_log` table
- [ ] taskType = "medication"
- [ ] patientId = 999

#### Step 3.2: Test Blood Pressure Recording
**Input:** พิมพ์ในกลุ่ม
```
ความดัน 120/80
```

**Expected Response:**
```
📊 บันทึกความดันโลหิตแล้วค่ะ

ค่าความดัน: 120/80 mmHg
ผลการประเมิน: ปกติ ✅

คำแนะนำ: ค่าความดันอยู่ในเกณฑ์ดีค่ะ
```

**Verify in Airtable:**
- [ ] New record in `activity_log` table
- [ ] taskType = "vitals"
- [ ] value = "BP: 120/80 mmHg"

#### Step 3.3: Test Image Upload (Optional)
**Input:** ส่งรูปถ่ายเครื่องวัดความดัน

**Expected Response:**
```
📸 ได้รับรูปแล้วค่ะ
กำลังวิเคราะห์...

📊 ผลการอ่านค่า:
• ความดัน: 125/82 mmHg
• ชีพจร: 72 bpm

บันทึกข้อมูลเรียบร้อยค่ะ
```

---

### Phase 4: Test Daily Report (22:00)

#### Step 4.1: Manual Trigger (for testing)
1. ไปที่ n8n workflow "3. Daily Report Generator"
2. คลิก "Execute Workflow" manually
3. Check LINE group for report

**Expected Report Format:**
```
📊 รายงานประจำวัน - คุณทดสอบ

✅ ความสำเร็จ: 75% 🥈
💊 ทานยา: 1 ครั้ง
📊 วัดความดัน: 1 ครั้ง
💧 ดื่มน้ำ: 0 ครั้ง

⚠️ แจ้งเตือน: ยังไม่ได้ดื่มน้ำ
```

**Verify in Airtable:**
- [ ] New record in `daily_report` table
- [ ] completionRate = 75
- [ ] medal = "🥈 เงิน"

---

### Phase 5: Test Alert System

#### Step 5.1: Simulate No Response
1. หยุดการตอบในกลุ่ม 18+ ชั่วโมง
2. รอ workflow "4. Alert Monitor" ทำงาน (หรือ trigger manually)

**Expected Alert to Caregiver (DM):**
```
🚨 แจ้งเตือนด่วน!

คุณทดสอบ ไม่มีการตอบกลับมากกว่า 18 ชั่วโมงแล้ว

กิจกรรมล่าสุด: medication เมื่อ 2025-01-27 08:00

กรุณาติดต่อตรวจสอบด่วน!
```

**Verify:**
- [ ] Caregiver ได้รับ DM
- [ ] Alert logged in `activity_log`
- [ ] taskType = "alert"

---

## 🎨 Rich Menu Configuration

### LINE Rich Menu Setup (2x3 Layout)

Configure LINE Rich Menu with 6 buttons in 2 rows x 3 columns:

#### **แถวบน (งานหลักประจำวัน)**
1. **📝 บันทึกสุขภาพ**
   - Action: Send text message "บันทึกสุขภาพ"
   - Purpose: สำหรับบันทึกยา/ความดัน/น้ำตาล
   - Quick Reply Options:
     - ✅ ทานยาแล้ว
     - 📊 บันทึกความดัน
     - 🩸 บันทึกน้ำตาล
     - 💧 ดื่มน้ำแล้ว

2. **📊 ดูรายงาน**
   - Action: Send text message "ดูรายงาน"
   - Purpose: ดูประวัติและแนวโน้มสุขภาพ
   - Response: Daily/Weekly summary

3. **💬 คุยกับ AI**
   - Action: Send text message "คุยกับ AI"
   - Purpose: เริ่มการสนทนากับ AI Companion
   - Response: AI greeting and start conversation

#### **แถวล่าง (การจัดการ)**
4. **📝 ลงทะเบียน**
   - Action: Send text message "ลงทะเบียน"
   - Purpose: สำหรับผู้ใช้ใหม่/เพิ่มข้อมูลผู้สูงอายุ
   - Response: Start conversational registration flow

5. **💎 แพ็กเกจ** (หรือ "สมาชิก")
   - Action: Send text message "แพ็กเกจ"
   - Purpose: ดูและสมัครบริการ
   - Response: Package options and pricing

6. **❓ ช่วยเหลือ**
   - Action: Send text message "ช่วยเหลือ"
   - Purpose: ติดต่อทีมงาน/คำถามที่พบบ่อย
   - Response: Help menu with FAQs

### Rich Menu JSON Structure (for LINE Manager)
```json
{
  "size": {
    "width": 2500,
    "height": 1686
  },
  "selected": true,
  "name": "Health Buddy Menu",
  "chatBarText": "เมนู",
  "areas": [
    {
      "bounds": {"x": 0, "y": 0, "width": 833, "height": 843},
      "action": {"type": "message", "text": "บันทึกสุขภาพ"}
    },
    {
      "bounds": {"x": 833, "y": 0, "width": 834, "height": 843},
      "action": {"type": "message", "text": "ดูรายงาน"}
    },
    {
      "bounds": {"x": 1667, "y": 0, "width": 833, "height": 843},
      "action": {"type": "message", "text": "คุยกับ AI"}
    },
    {
      "bounds": {"x": 0, "y": 843, "width": 833, "height": 843},
      "action": {"type": "message", "text": "ลงทะเบียน"}
    },
    {
      "bounds": {"x": 833, "y": 843, "width": 834, "height": 843},
      "action": {"type": "message", "text": "แพ็กเกจ"}
    },
    {
      "bounds": {"x": 1667, "y": 843, "width": 833, "height": 843},
      "action": {"type": "message", "text": "ช่วยเหลือ"}
    }
  ]
}
```

### Setup Steps:
1. **Create Rich Menu Image**
   - Size: 2500 x 1686 pixels
   - 2 rows x 3 columns layout
   - Use icons and Thai text

2. **Upload to LINE Manager**
   - Login to LINE Official Account Manager
   - Go to Rich Menu section
   - Create new Rich Menu
   - Upload image
   - Configure tap areas
   - Set as default

3. **Test Rich Menu Actions**
   - [ ] บันทึกสุขภาพ → Shows health recording options
   - [ ] ดูรายงาน → Shows reports
   - [ ] คุยกับ AI → Starts AI conversation
   - [ ] ลงทะเบียน → Shows registration process
   - [ ] แพ็กเกจ → Shows package options
   - [ ] ช่วยเหลือ → Shows help menu

---

## 🔍 Test Data Validation

### Check Airtable Tables

#### patient_profile
```sql
filterByFormula: "connectionCode = 'TEST-9999'"
```
- [ ] 1 record found
- [ ] groupId is populated
- [ ] active = TRUE

#### activity_log
```sql
filterByFormula: "AND(patientId = 999, IS_SAME(timestamp, TODAY(), 'day'))"
```
- [ ] Multiple records for today
- [ ] Different taskTypes recorded

#### conversation_log
```sql
filterByFormula: "patientId = 999"
```
- [ ] All messages logged
- [ ] senderRole correctly identified

#### daily_report
```sql
filterByFormula: "AND(patientId = 999, date = TODAY())"
```
- [ ] 1 report for today
- [ ] Correct calculations

---

## ⚠️ Troubleshooting Guide

### Issue 1: Bot ไม่ตอบเมื่อพิมพ์ connection code
**Possible Causes:**
- [ ] Workflow 0 ไม่ active
- [ ] Webhook ไม่ forward ไปที่ n8n
- [ ] Connection code ไม่มีใน database

**Solutions:**
1. Check n8n workflow status
2. Test webhook endpoint: `curl https://health-buddy-six.vercel.app/webhook`
3. Verify connection code in Airtable

### Issue 2: Bot ตอบว่า "ไม่พบข้อมูล"
**Possible Causes:**
- [ ] filterByFormula syntax error
- [ ] Field ID ไม่ถูกต้อง
- [ ] Airtable credentials expired

**Solutions:**
1. Test query ใน Airtable API directly
2. Check field IDs match AIRTABLE-SCHEMA.md
3. Re-authenticate Airtable in n8n

### Issue 3: ไม่ได้รับ Daily Report
**Possible Causes:**
- [ ] Workflow 3 ไม่ active
- [ ] Cron schedule ไม่ถูกต้อง
- [ ] No activities logged for the day

**Solutions:**
1. Manually execute workflow
2. Check cron expression: `0 22 * * *`
3. Create test activities first

### Issue 4: Caregiver ไม่ได้รับ Alert
**Possible Causes:**
- [ ] LINE userId ของ caregiver ไม่ถูกต้อง
- [ ] alertPreference = "none"
- [ ] Workflow 4 ไม่ active

**Solutions:**
1. Verify caregiver lineId format
2. Check alertPreference setting
3. Test LINE Push API directly

---

## 📊 Success Criteria

### Registration Success ✅
- [ ] Patient profile created in Airtable
- [ ] Connection code accepted
- [ ] groupId populated
- [ ] Welcome message sent

### Daily Operations ✅
- [ ] Medication logging works
- [ ] Vitals recording works
- [ ] Daily report generated at 22:00
- [ ] All activities logged in database

### Alert System ✅
- [ ] 18-hour rule triggers correctly
- [ ] Caregivers receive DM alerts
- [ ] Alert events logged

### Data Integrity ✅
- [ ] All tables have correct relationships
- [ ] Timestamps are accurate
- [ ] No duplicate records
- [ ] JSON fields parsed correctly

---

## 🎬 Demo Script (for presentation)

### Scene 1: Morning (08:00)
```
Bot: ☀️ อรุณสวัสดิ์ค่ะ
     คุณทดสอบค่ะ
     ถึงเวลาทานยาแล้วค่ะ
     
     💊 Metformin 500mg
     
     [✅ ทานยาแล้ว] [⏰ เตือนใหม่]
```

### Scene 2: User Response
```
User: ทานยาแล้ว
Bot: ✅ บันทึกเรียบร้อยค่ะ
```

### Scene 3: Evening Report (22:00)
```
Bot: [Flex Message - Daily Report Card]
     ความสำเร็จวันนี้ 85% 🥇
```

### Scene 4: Alert Demo (next day)
```
Bot to Caregiver: 🚨 คุณทดสอบไม่ตอบ > 18 ชม.
```

---

## 📝 Notes

1. **Test Environment**: ใช้ connection code ที่ขึ้นต้นด้วย "TEST-" เพื่อแยกจาก production
2. **Clean Up**: หลังทดสอบเสร็จ ลบ test records ออกจาก Airtable
3. **Logging**: เปิด n8n execution logs เพื่อดู debug info
4. **Rate Limits**: ระวัง LINE API rate limits (60 msgs/min)

---

*Document Version: 1.0*
*Created: 2025-01-27*
*For: Health Buddy MVP Testing*