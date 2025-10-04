# 🚀 Simple Conversational Registration Guide
**วิธีง่ายที่สุด - ไม่ต้องแก้ Airtable**

## 📝 Overview
ใช้ `conversation_log` table เก็บ state ของการลงทะเบียน ไม่ต้องเพิ่ม field ใหม่

---

## 🎯 Concept
- เก็บ registration state ใน `note` field ของ `conversation_log`
- ใช้ format: `REGISTRATION:STATE:ASK_NAME`
- ดึง conversation ล่าสุดมาเช็ค state
- พอเสร็จแล้วค่อยสร้าง patient record

---

## 📋 Implementation Steps

### Step 1: Registration Intent Detection

```javascript
// Code Node: Detect Registration Intent
const text = $json.events[0].message?.text || '';
const userId = $json.events[0].source.userId;
const replyToken = $json.events[0].replyToken;

// Check registration keywords
const registrationKeywords = ['ลงทะเบียน', 'register', 'สมัคร'];
const isRegistration = registrationKeywords.some(keyword => 
  text.toLowerCase().includes(keyword)
);

return {
  intent: isRegistration ? 'registration' : 'continue',
  userId: userId,
  userMessage: text,
  replyToken: replyToken
};
```

---

### Step 2: Get Last Registration State

**Airtable Node: Get Last Conversation**
```json
{
  "resource": "record",
  "operation": "search",
  "base": {"value": "app3u0M9H6SsZ0J6s"},
  "table": {"value": "tblpQeph1tVbhyhbW"},
  "filterByFormula": "AND({patientId} = '{{ $json.userId }}', FIND('REGISTRATION:', {note}) > 0)",
  "sort": [{"field": "timestamp", "direction": "desc"}],
  "limit": 1
}
```

---

### Step 3: Simple State Machine

```javascript
// Code Node: Registration Flow
const userId = $json.userId;
const userMessage = $json.userMessage;
const lastConversation = $items[0].json;

// Get current state from last conversation
let currentState = 'START';
let registrationData = {};

if (lastConversation && lastConversation.fields?.note) {
  const noteMatch = lastConversation.fields.note.match(/REGISTRATION:STATE:(\w+):DATA:(.+)/);
  if (noteMatch) {
    currentState = noteMatch[1];
    registrationData = JSON.parse(noteMatch[2] || '{}');
  }
}

// Reset if user says "ลงทะเบียน" and already in progress
if (userMessage === 'ลงทะเบียน' && currentState !== 'START') {
  currentState = 'START';
  registrationData = {};
}

// State machine
let nextState = currentState;
let responseMessage = '';
let quickReply = null;

switch(currentState) {
  case 'START':
    nextState = 'ASK_NAME';
    responseMessage = `สวัสดีค่ะ ยินดีต้อนรับสู่ Health Buddy 🏥
ขอทราบชื่อ-นามสกุลผู้สูงอายุค่ะ`;
    break;
    
  case 'ASK_NAME':
    registrationData.patientName = userMessage;
    nextState = 'ASK_NICKNAME';
    responseMessage = `ชื่อเล่นที่เรียก${userMessage.split(' ')[0]}ค่ะ`;
    break;
    
  case 'ASK_NICKNAME':
    registrationData.displayName = userMessage;
    nextState = 'ASK_GENDER';
    responseMessage = `เพศค่ะ`;
    quickReply = {
      items: [
        {type: "action", action: {type: "message", label: "ชาย", text: "ชาย"}},
        {type: "action", action: {type: "message", label: "หญิง", text: "หญิง"}}
      ]
    };
    break;
    
  case 'ASK_GENDER':
    registrationData.gender = userMessage === 'ชาย' ? 'male' : 'female';
    nextState = 'ASK_DOB';
    responseMessage = `วันเกิด (วว/ดด/ปปปป) ค่ะ`;
    break;
    
  case 'ASK_DOB':
    // Simple date validation
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(userMessage)) {
      responseMessage = `กรุณาใส่รูปแบบ วว/ดด/ปปปป ค่ะ`;
    } else {
      const [d, m, y] = userMessage.split('/');
      registrationData.dateOfBirth = `${parseInt(y)-543}-${m}-${d}`;
      nextState = 'ASK_DISEASES';
      responseMessage = `มีโรคประจำตัวไหมคะ`;
      quickReply = {
        items: [
          {type: "action", action: {type: "message", label: "เบาหวาน", text: "เบาหวาน"}},
          {type: "action", action: {type: "message", label: "ความดัน", text: "ความดัน"}},
          {type: "action", action: {type: "message", label: "ไม่มี", text: "ไม่มี"}}
        ]
      };
    }
    break;
    
  case 'ASK_DISEASES':
    registrationData.diseases = userMessage === 'ไม่มี' ? [] : [userMessage];
    nextState = 'ASK_CAREGIVER';
    responseMessage = `ชื่อผู้ดูแลหลักค่ะ`;
    break;
    
  case 'ASK_CAREGIVER':
    registrationData.caregiverName = userMessage;
    nextState = 'ASK_PHONE';
    responseMessage = `เบอร์โทรผู้ดูแลค่ะ`;
    break;
    
  case 'ASK_PHONE':
    registrationData.caregiverPhone = userMessage;
    nextState = 'COMPLETE';
    
    // Generate connection code
    const code = Math.random().toString(36).substring(2, 6).toUpperCase() + 
                 '-' + Math.floor(Math.random() * 9000 + 1000);
    registrationData.connectionCode = code;
    
    responseMessage = `✅ ลงทะเบียนสำเร็จ!

👤 ${registrationData.displayName}
🔑 รหัส: ${code}

ขั้นตอนต่อไป:
1. เชิญบอทเข้ากลุ่ม LINE
2. พิมพ์รหัสในกลุ่ม`;
    break;
}

// Cancel anytime
if (userMessage === 'ยกเลิก') {
  nextState = 'CANCELLED';
  responseMessage = 'ยกเลิกแล้วค่ะ';
}

// Save state to note
const stateNote = `REGISTRATION:STATE:${nextState}:DATA:${JSON.stringify(registrationData)}`;

return {
  userId: userId,
  nextState: nextState,
  responseMessage: responseMessage,
  quickReply: quickReply,
  stateNote: stateNote,
  registrationData: registrationData,
  shouldCreatePatient: nextState === 'COMPLETE'
};
```

---

### Step 4: Log Conversation with State

**Airtable Node: Save Conversation**
```json
{
  "resource": "record",
  "operation": "create",
  "base": {"value": "app3u0M9H6SsZ0J6s"},
  "table": {"value": "tblpQeph1tVbhyhbW"},
  "fields": {
    "fieldValues": [
      {"fieldName": "patientId", "fieldValue": "={{ $json.userId }}"},
      {"fieldName": "senderRole", "fieldValue": "bot"},
      {"fieldName": "messageType", "fieldValue": "text"},
      {"fieldName": "messageContent", "fieldValue": "={{ $json.responseMessage }}"},
      {"fieldName": "note", "fieldValue": "={{ $json.stateNote }}"},
      {"fieldName": "timestamp", "fieldValue": "={{ new Date().toISOString() }}"}
    ]
  }
}
```

---

### Step 5: Create Patient (When Complete)

**IF Node**: Check `shouldCreatePatient`

**Code Node: Prepare Patient Data**
```javascript
const data = $json.registrationData;

return {
  patientId: Date.now(),
  userId: $json.userId,
  patientName: data.patientName,
  displayName: data.displayName,
  gender: data.gender,
  dateOfBirth: data.dateOfBirth,
  chronicDiseases: data.diseases || [],
  caregivers: JSON.stringify([{
    role: 'primary',
    name: data.caregiverName,
    phone: data.caregiverPhone,
    lineId: $json.userId
  }]),
  connectionCode: data.connectionCode,
  personaKey: data.gender === 'male' ? 'male_basic' : 'female_basic',
  noReplyHours: 18,
  alertPreference: 'primaryOnly',
  active: false  // Not active until connected to group
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
      {"fieldName": "displayName", "fieldValue": "={{ $json.displayName }}"},
      {"fieldName": "gender", "fieldValue": "={{ $json.gender }}"},
      {"fieldName": "dateOfBirth", "fieldValue": "={{ $json.dateOfBirth }}"},
      {"fieldName": "chronicDiseases", "fieldValue": "={{ $json.chronicDiseases }}"},
      {"fieldName": "caregivers", "fieldValue": "={{ $json.caregivers }}"},
      {"fieldName": "connectionCode", "fieldValue": "={{ $json.connectionCode }}"},
      {"fieldName": "personaKey", "fieldValue": "={{ $json.personaKey }}"},
      {"fieldName": "noReplyHours", "fieldValue": "={{ $json.noReplyHours }}"},
      {"fieldName": "alertPreference", "fieldValue": "={{ $json.alertPreference }}"},
      {"fieldName": "active", "fieldValue": "={{ $json.active }}"}
    ]
  },
  "options": {
    "typecast": true
  }
}
```

---

### Step 6: Send LINE Reply

**LINE Node: Reply to User**
```json
{
  "resource": "message",
  "operation": "reply",
  "replyToken": "={{ $node['Detect Registration Intent'].json.replyToken }}",
  "messages": [
    {
      "type": "text",
      "text": "={{ $node['Registration Flow'].json.responseMessage }}",
      "quickReply": "={{ $node['Registration Flow'].json.quickReply }}"
    }
  ]
}
```

---

## 🔄 Complete Workflow

```
LINE Webhook
    ↓
Detect Registration Intent
    ↓
[IF: Registration?]
    ├─ Yes → Get Last Conversation
    │         ↓
    │      Registration Flow
    │         ↓
    │      Save Conversation with State
    │         ↓
    │      [IF: Complete?]
    │         ├─ Yes → Create Patient
    │         └─ No → Continue
    │         ↓
    │      Send LINE Reply
    │
    └─ No → [Other Intents]
```

---

## ✅ Advantages

1. **ไม่ต้องแก้ Airtable schema**
2. **ใช้ table ที่มีอยู่แล้ว**
3. **State เก็บใน conversation log**
4. **ง่ายต่อการ debug**
5. **มี history ครบ**

---

## 🧪 Test Cases

### Normal Flow
```
User: ลงทะเบียน
Bot: ขอชื่อ-นามสกุล
User: สมศรี ใจดี
[Continue...]
Bot: ✅ สำเร็จ! รหัส: ABCD-1234
```

### Cancel
```
User: ลงทะเบียน
Bot: ขอชื่อ
User: ยกเลิก
Bot: ยกเลิกแล้วค่ะ
```

### Resume
```
User: ลงทะเบียน
Bot: ขอชื่อ
User: สมศรี
[User goes away]
--- Later ---
User: ใจดี
Bot: ชื่อเล่นค่ะ [continues from where left]
```

---

## 🐛 Debug Tips

1. **Check conversation_log** - ดู note field
2. **State format**: `REGISTRATION:STATE:ASK_NAME:DATA:{...}`
3. **Clear state**: ลบ record ใน conversation_log ที่มี REGISTRATION
4. **Test in LINE app** - Quick Reply ไม่ทำงานใน desktop

---

*Simplest approach - No Airtable changes needed!*
*Version: 1.0.0*
*Last Updated: 2025-01-27*