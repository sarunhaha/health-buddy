# 📖 Conversational Registration Implementation Guide

## 🎯 Overview
คู่มือการ implement ระบบลงทะเบียนแบบสนทนาผ่าน LINE chatbot

---

## 📋 Implementation Steps

### Step 1: ใช้ patient_profile Table ที่มีอยู่แล้ว

ใช้ table `patient_profile` (Table ID: `tblIJdbBY1D0l5AK7`) ที่มีอยู่แล้วใน Airtable

**เพิ่ม Fields สำหรับ Registration State (ถ้ายังไม่มี):**

| Field Name | Type | Description | Field ID (ถ้ามี) |
|------------|------|-------------|-----------------|
| registrationState | Single Select | State ของการลงทะเบียน | (เพิ่มใหม่) |
| tempData | Long Text | JSON ข้อมูลชั่วคราวระหว่างลงทะเบียน | (เพิ่มใหม่) |
| registrationStarted | Date and time | เวลาเริ่มลงทะเบียน | (เพิ่มใหม่) |

**registrationState Options:**
- `START`
- `ASK_NAME`
- `ASK_NICKNAME`
- `ASK_GENDER`
- `ASK_DOB`
- `ASK_DISEASES`
- `ASK_MEDICATIONS`
- `ASK_ALLERGIES`
- `ASK_CAREGIVER_NAME`
- `ASK_RELATIONSHIP`
- `ASK_PHONE`
- `CONFIRM`
- `COMPLETED`

**Note:** หรือถ้าไม่อยากเพิ่ม field ใหม่ สามารถใช้ memory ใน n8n เก็บ state ชั่วคราวได้

### Alternative: Simple Approach (ไม่ต้องเพิ่ม field)

ถ้าไม่อยากแก้ Airtable สามารถใช้วิธีง่ายๆ:

**Option 1: ใช้ Static Data Node ใน n8n**
- เก็บ state ใน memory ระหว่าง workflow execution
- ข้อเสีย: state หายถ้า workflow restart

**Option 2: ใช้ conversation_log table**
- เก็บ state เป็น note ใน conversation_log
- ดึง message ล่าสุดมาดู state
- ข้อดี: ไม่ต้องแก้ schema

**Option 3: ใช้ Redis/Cache (ถ้ามี)**
- เก็บ state ใน Redis with TTL
- ข้อดี: เร็ว, มี expiration อัตโนมัติ

---

### Step 2: Update Workflow 1 (Inbound Handler)

#### 2.1 Add Registration Intent Check

เพิ่ม node ตรวจจับคำว่า "ลงทะเบียน" หลัง webhook:

```javascript
// Code Node: Check Registration Intent
const text = $json.events[0].message?.text || '';
const userId = $json.events[0].source.userId;

// Check if user wants to register
if (text.includes('ลงทะเบียน') || text === 'register') {
  return {
    intent: 'registration',
    userId: userId,
    text: text
  };
}

// Pass through to other intents
return {
  intent: 'other',
  userId: userId,
  text: text
};
```

#### 2.2 Check Existing Registration

```javascript
// Code Node: Check Registration Status
const userId = $json.userId;

// Output for next nodes
return {
  userId: userId,
  action: 'check_registration'
};
```

**Airtable Node: Search Incomplete Registration**
```json
{
  "resource": "record",
  "operation": "search",
  "base": {"value": "app3u0M9H6SsZ0J6s"},
  "table": {"value": "tblIJdbBY1D0l5AK7"},
  "filterByFormula": "AND({userId} = '{{ $json.userId }}', {registrationState} != 'COMPLETED', {active} = FALSE())"
}
```

**Note:** ค้นหา record ที่ userId ตรง และยังลงทะเบียนไม่เสร็จ

#### 2.3 State Machine Logic

```javascript
// Code Node: Registration State Machine
const userId = $json.userId;
const userMessage = $json.text;
const existingSession = $items[0].json; // From Airtable search

// Initialize or get session
let session = {};
let currentState = 'START';
let tempData = {};

if (existingSession && existingSession.fields) {
  // Continue existing session
  currentState = existingSession.fields.currentState;
  tempData = JSON.parse(existingSession.fields.tempData || '{}');
  session.recordId = existingSession.id;
} else {
  // New registration
  currentState = 'START';
  tempData = {};
}

// State machine logic
let nextState = currentState;
let responseMessage = '';
let quickReply = null;
let shouldCreatePatient = false;

switch(currentState) {
  case 'START':
    nextState = 'ASK_NAME';
    responseMessage = `สวัสดีค่ะ ยินดีต้อนรับสู่ Health Buddy 🏥
ดิฉันจะช่วยลงทะเบียนผู้สูงอายุให้นะคะ

ขอทราบชื่อ-นามสกุลของผู้สูงอายุค่ะ
(ตัวอย่าง: คุณสมศรี ใจดี)`;
    break;
    
  case 'ASK_NAME':
    // Save name and move to next
    tempData.patientName = userMessage;
    nextState = 'ASK_NICKNAME';
    responseMessage = `ขอทราบชื่อเล่นที่ใช้เรียกคุณ${userMessage.split(' ')[0]}ค่ะ
(เช่น คุณยาย, คุณแม่, คุณพ่อ)`;
    break;
    
  case 'ASK_NICKNAME':
    tempData.displayName = userMessage;
    nextState = 'ASK_GENDER';
    responseMessage = `เพศของ${userMessage}ค่ะ`;
    quickReply = {
      items: [
        {type: "action", action: {type: "message", label: "👨 ชาย", text: "ชาย"}},
        {type: "action", action: {type: "message", label: "👩 หญิง", text: "หญิง"}}
      ]
    };
    break;
    
  case 'ASK_GENDER':
    tempData.gender = userMessage === 'ชาย' ? 'male' : 'female';
    nextState = 'ASK_DOB';
    responseMessage = `วันเกิดของ${tempData.displayName}ค่ะ
(รูปแบบ: วว/ดด/ปปปป เช่น 01/05/2498)`;
    break;
    
  case 'ASK_DOB':
    // Validate date format
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!datePattern.test(userMessage)) {
      // Stay in same state
      responseMessage = `⚠️ กรุณาใส่วันเกิดในรูปแบบ วว/ดด/ปปปป 
เช่น 01/05/2498 ค่ะ`;
    } else {
      // Convert Thai date to ISO format
      const [day, month, year] = userMessage.split('/');
      const buddhistYear = parseInt(year);
      const gregorianYear = buddhistYear - 543;
      tempData.dateOfBirth = `${gregorianYear}-${month}-${day}`;
      
      nextState = 'ASK_DISEASES';
      responseMessage = `${tempData.displayName}มีโรคประจำตัวไหมคะ`;
      quickReply = {
        items: [
          {type: "action", action: {type: "message", label: "🩸 เบาหวาน", text: "เบาหวาน"}},
          {type: "action", action: {type: "message", label: "💊 ความดัน", text: "ความดัน"}},
          {type: "action", action: {type: "message", label: "❤️ หัวใจ", text: "หัวใจ"}},
          {type: "action", action: {type: "message", label: "✅ ไม่มี", text: "ไม่มี"}}
        ]
      };
    }
    break;
    
  case 'ASK_DISEASES':
    tempData.chronicDiseases = userMessage === 'ไม่มี' ? [] : [userMessage];
    nextState = 'ASK_MEDICATIONS';
    responseMessage = `มียาที่ทานประจำไหมคะ
(พิมพ์ชื่อยาและเวลา หรือพิมพ์ "ไม่มี")`;
    break;
    
  case 'ASK_MEDICATIONS':
    if (userMessage !== 'ไม่มี') {
      // Simple parsing - can be improved
      tempData.medications = [{
        drug: userMessage,
        time: "08:00"
      }];
    } else {
      tempData.medications = [];
    }
    nextState = 'ASK_ALLERGIES';
    responseMessage = `มีประวัติแพ้ยาหรืออาหารไหมคะ
(พิมพ์รายการที่แพ้ หรือ "ไม่มี")`;
    break;
    
  case 'ASK_ALLERGIES':
    tempData.allergies = userMessage;
    nextState = 'ASK_CAREGIVER_NAME';
    responseMessage = 'ขอทราบชื่อผู้ดูแลหลักค่ะ';
    break;
    
  case 'ASK_CAREGIVER_NAME':
    tempData.caregiverName = userMessage;
    nextState = 'ASK_RELATIONSHIP';
    responseMessage = `ความสัมพันธ์กับ${tempData.displayName}ค่ะ`;
    quickReply = {
      items: [
        {type: "action", action: {type: "message", label: "👨‍👩‍👦 ลูก", text: "ลูก"}},
        {type: "action", action: {type: "message", label: "👶 หลาน", text: "หลาน"}},
        {type: "action", action: {type: "message", label: "💑 คู่สมรส", text: "คู่สมรส"}},
        {type: "action", action: {type: "message", label: "👥 ญาติ", text: "ญาติ"}}
      ]
    };
    break;
    
  case 'ASK_RELATIONSHIP':
    tempData.caregiverRelation = userMessage;
    nextState = 'ASK_PHONE';
    responseMessage = `เบอร์โทรผู้ดูแลค่ะ
(สำหรับแจ้งเตือนฉุกเฉิน)`;
    break;
    
  case 'ASK_PHONE':
    tempData.caregiverPhone = userMessage;
    nextState = 'CONFIRM';
    
    // Calculate age
    const dob = new Date(tempData.dateOfBirth);
    const age = Math.floor((Date.now() - dob) / (1000 * 60 * 60 * 24 * 365));
    
    responseMessage = `✅ ข้อมูลครบถ้วนแล้วค่ะ

📋 สรุปข้อมูล:
👤 ผู้สูงอายุ: ${tempData.displayName} (${tempData.patientName})
📅 อายุ: ${age} ปี
💊 โรค: ${tempData.chronicDiseases.join(', ') || 'ไม่มี'}
👩 ผู้ดูแล: ${tempData.caregiverName} (${tempData.caregiverRelation})
📞 เบอร์: ${tempData.caregiverPhone}

พิมพ์ "ยืนยัน" เพื่อลงทะเบียน
หรือ "แก้ไข" เพื่อเริ่มใหม่`;
    break;
    
  case 'CONFIRM':
    if (userMessage === 'ยืนยัน' || userMessage.includes('ยืนยัน')) {
      nextState = 'COMPLETED';
      shouldCreatePatient = true;
      responseMessage = 'กำลังลงทะเบียน...';
    } else if (userMessage === 'แก้ไข') {
      // Reset
      nextState = 'ASK_NAME';
      tempData = {};
      responseMessage = 'เริ่มใหม่ค่ะ\n\nขอทราบชื่อ-นามสกุลของผู้สูงอายุค่ะ';
    } else {
      responseMessage = 'กรุณาพิมพ์ "ยืนยัน" หรือ "แก้ไข" ค่ะ';
    }
    break;
}

// Handle cancel at any state
if (userMessage === 'ยกเลิก') {
  nextState = 'CANCELLED';
  responseMessage = 'ยกเลิกการลงทะเบียนแล้วค่ะ\nหากต้องการลงทะเบียนใหม่ พิมพ์ "ลงทะเบียน" ได้เลยค่ะ';
}

return {
  userId: userId,
  sessionRecordId: session.recordId,
  currentState: currentState,
  nextState: nextState,
  tempData: tempData,
  responseMessage: responseMessage,
  quickReply: quickReply,
  shouldCreatePatient: shouldCreatePatient,
  shouldUpdateSession: nextState !== 'COMPLETED' && nextState !== 'CANCELLED'
};
```

---

### Step 3: Update/Create Session in Airtable

#### 3.1 Update Existing Session
**IF Node**: Check if `sessionRecordId` exists

**Airtable Node: Update Session**
```json
{
  "resource": "record",
  "operation": "update",
  "id": "={{ $json.sessionRecordId }}",
  "fields": {
    "fieldValues": [
      {"fieldName": "currentState", "fieldValue": "={{ $json.nextState }}"},
      {"fieldName": "tempData", "fieldValue": "={{ JSON.stringify($json.tempData) }}"}
    ]
  }
}
```

#### 3.2 Create New Session
**Airtable Node: Create Session**
```json
{
  "resource": "record",
  "operation": "create",
  "fields": {
    "fieldValues": [
      {"fieldName": "userId", "fieldValue": "={{ $json.userId }}"},
      {"fieldName": "currentState", "fieldValue": "={{ $json.nextState }}"},
      {"fieldName": "tempData", "fieldValue": "={{ JSON.stringify($json.tempData) }}"},
      {"fieldName": "completed", "fieldValue": false}
    ]
  }
}
```

---

### Step 4: Create Patient Record (When Complete)

**IF Node**: Check if `shouldCreatePatient` is true

**Code Node: Prepare Patient Data**
```javascript
const tempData = $json.tempData;
const userId = $json.userId;

// Generate connection code
const timestamp = Date.now().toString(36).toUpperCase();
const random = Math.floor(Math.random() * 9000 + 1000);
const connectionCode = `${timestamp.slice(-4)}-${random}`;

// Generate patient ID
const patientId = Math.floor(Date.now() / 1000);

// Prepare caregivers array
const caregivers = [{
  role: 'primary',
  name: tempData.caregiverName,
  relation: tempData.caregiverRelation,
  phone: tempData.caregiverPhone,
  lineId: userId
}];

return {
  patientId: patientId,
  userId: userId,
  patientName: tempData.patientName,
  displayName: tempData.displayName,
  gender: tempData.gender,
  dateOfBirth: tempData.dateOfBirth,
  chronicDiseases: tempData.chronicDiseases || [],
  medications: JSON.stringify(tempData.medications || []),
  allergies: tempData.allergies || 'ไม่มี',
  caregivers: JSON.stringify(caregivers),
  connectionCode: connectionCode,
  personaKey: tempData.gender === 'male' ? 'male_basic' : 'female_basic',
  tonePreference: 'formal',
  noReplyHours: 18,
  alertPreference: 'primaryOnly',
  active: true
};
```

**Airtable Node: Create Patient**
```json
{
  "resource": "record",
  "operation": "create",
  "base": {"value": "app3u0M9H6SsZ0J6s"},
  "table": {"value": "tblIJdbBY1D0l5AK7"},
  "fields": {
    "fieldValues": [
      {"fieldName": "patientId", "fieldValue": "={{ $json.patientId }}"},
      {"fieldName": "userId", "fieldValue": "={{ $json.userId }}"},
      {"fieldName": "patientName", "fieldValue": "={{ $json.patientName }}"},
      // ... all other fields
    ]
  }
}
```

---

### Step 5: Send LINE Reply

**Code Node: Build Reply Message**
```javascript
const responseMessage = $node['Registration State Machine'].json.responseMessage;
const quickReply = $node['Registration State Machine'].json.quickReply;
const shouldCreatePatient = $node['Registration State Machine'].json.shouldCreatePatient;
const replyToken = $node['Webhook'].json.events[0].replyToken;

// If patient was created, add success message
let finalMessage = responseMessage;

if (shouldCreatePatient && $json.connectionCode) {
  finalMessage = `🎊 ลงทะเบียนสำเร็จ!

👤 ผู้สูงอายุ: ${$json.displayName}
🔑 รหัสเชื่อมต่อ: ${$json.connectionCode}

📝 ขั้นตอนต่อไป:
1. สร้างกลุ่ม LINE ครอบครัว
2. เชิญ Health Buddy เข้ากลุ่ม
3. พิมพ์รหัส ${$json.connectionCode} ในกลุ่ม
4. ระบบจะเชื่อมต่ออัตโนมัติ

⚠️ รหัสนี้ใช้ได้ 7 วัน`;
}

// Build message object
const messages = [{
  type: 'text',
  text: finalMessage
}];

// Add quick reply if exists
if (quickReply && !shouldCreatePatient) {
  messages[0].quickReply = quickReply;
}

return {
  replyToken: replyToken,
  messages: messages
};
```

**LINE Node: Reply Message**
```json
{
  "resource": "message",
  "operation": "reply",
  "replyToken": "={{ $json.replyToken }}",
  "messages": "={{ $json.messages }}"
}
```

---

## 🔄 Complete Workflow Structure

```
Webhook
  ↓
Check Registration Intent
  ↓
[IF: Is Registration?]
  ├─ Yes → Search Existing Session
  │         ↓
  │      Registration State Machine
  │         ↓
  │      [IF: Update Session?]
  │         ├─ Update → Update Session
  │         └─ Create → Create Session
  │         ↓
  │      [IF: Create Patient?]
  │         ├─ Yes → Prepare Patient Data
  │         │        ↓
  │         │     Create Patient Record
  │         │        ↓
  │         │     Mark Session Complete
  │         └─ No → Continue
  │         ↓
  │      Build Reply Message
  │         ↓
  │      Send LINE Reply
  │
  └─ No → [Continue with other intents...]
```

---

## 🧪 Testing Steps

### 1. Test New Registration
```
User: ลงทะเบียน
Bot: สวัสดีค่ะ... ขอทราบชื่อ-นามสกุล
User: สมศรี ใจดี
Bot: ขอทราบชื่อเล่น...
[Continue until complete]
```

### 2. Test Resume Session
```
User: ลงทะเบียน
Bot: [Starts registration]
User: สมศรี
[User stops responding]
--- 5 minutes later ---
User: ลงทะเบียน
Bot: [Continues from where left off]
```

### 3. Test Cancel
```
User: ลงทะเบียน
Bot: [Starts]
User: ยกเลิก
Bot: ยกเลิกการลงทะเบียนแล้วค่ะ
```

### 4. Test Validation
```
Bot: วันเกิดค่ะ (วว/ดด/ปปปป)
User: 1 พฤษภาคม
Bot: ⚠️ กรุณาใส่ในรูปแบบ วว/ดด/ปปปป
User: 01/05/2498
Bot: [Continues]
```

---

## 🐛 Troubleshooting

### Problem: Session not found
- Check `filterByFormula` syntax
- Verify `expiresAt` calculation
- Check timezone settings

### Problem: State not updating
- Verify field names in Airtable
- Check JSON.stringify/parse
- Look for typos in state names

### Problem: Quick Reply not showing
- Check message format
- Verify quickReply object structure
- Test in LINE app (not LINE desktop)

### Problem: Connection code not generated
- Check patient creation success
- Verify all required fields
- Look at error logs

---

## 📝 Notes

1. **Session Timeout**: Set to 30 minutes, can adjust in formula
2. **Connection Code**: Valid for 7 days (check in group connection logic)
3. **Quick Reply**: Only works in mobile LINE app
4. **Date Format**: Thai Buddhist year needs -543 conversion
5. **Phone Format**: Consider adding validation/formatting

---

*Version: 1.0.0*
*Last Updated: 2025-01-27*
*For: Health Buddy Conversational Registration*