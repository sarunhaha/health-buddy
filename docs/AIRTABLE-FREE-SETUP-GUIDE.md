# 🎯 Airtable Free Version Setup Guide (Step-by-Step)

## 📝 สิ่งที่จะได้ (Free Plan)
- **1,200 records** ต่อ base
- **Unlimited bases**
- **2 GB attachments**
- **Unlimited API calls**
- **พอใช้ 2-3 เดือน** สำหรับ 1-2 groups

---

## 🚀 Step 1: สร้าง Account & Base

### 1.1 สมัคร Airtable
1. ไปที่ https://airtable.com/signup
2. Sign up ด้วย Google หรือ Email
3. Skip onboarding (ข้ามได้)

### 1.2 สร้าง Base ใหม่
1. คลิก **"Start from scratch"**
2. ตั้งชื่อ Base: **"Health Buddy Bot"**
3. เลือก color & icon ตามใจชอบ

---

## 📊 Step 2: สร้าง Tables (แบบ Simple สำหรับ Free)

### Table 1: **Messages** (หลัก)
คลิก "Table 1" แล้ว rename เป็น "Messages"

| Field Name | Field Type | การตั้งค่า |
|------------|------------|-----------|
| timestamp | Date & time | Include time ✅ |
| user_id | Single line text | - |
| user_name | Single line text | - |
| group_id | Single line text | - |
| text | Long text | - |
| intent | Single select | Options: MEDICATION, VITALS, CHAT, EMERGENCY |
| replied | Checkbox | Default: unchecked |

### Table 2: **Medications** 
คลิก + เพิ่ม Table ใหม่

| Field Name | Field Type | การตั้งค่า |
|------------|------------|-----------|
| taken_at | Date & time | Include time ✅ |
| user_id | Single line text | - |
| user_name | Single line text | - |
| period | Single select | Options: เช้า, กลางวัน, เย็น |
| status | Single select | Options: ทานแล้ว, ลืม, ข้าม |

### Table 3: **Vitals**
คลิก + เพิ่ม Table ใหม่

| Field Name | Field Type | การตั้งค่า |
|------------|------------|-----------|
| measured_at | Date & time | Include time ✅ |
| user_id | Single line text | - |
| user_name | Single line text | - |
| bp_sys | Number | Integer, Allow negative ❌ |
| bp_dia | Number | Integer, Allow negative ❌ |
| blood_sugar | Number | Decimal (1.0), Allow negative ❌ |

---

## 🔑 Step 3: Get API Credentials

### 3.1 Get Base ID
1. ดูที่ URL ของ browser
2. จะเห็น: `https://airtable.com/appXXXXXXXXXXXXXX/...`
3. Copy ส่วน **`appXXXXXXXXXXXXXX`** = Base ID ของคุณ

### 3.2 Create Personal Access Token
1. คลิกรูป Profile (มุมขวาบน)
2. ไปที่ **"Developer hub"**
3. คลิก **"Personal access tokens"**
4. คลิก **"Create new token"**

#### ตั้งค่า Token:
```
Name: Health Buddy Bot
Scopes: 
  ✅ data.records:read
  ✅ data.records:write
  ✅ schema.bases:read
  
Access:
  Add a base → เลือก "Health Buddy Bot"
```

5. คลิก **"Create token"**
6. **Copy token ทันที!** (จะไม่แสดงอีก)

### 3.3 Save Credentials
```env
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_API_KEY=patXXXXXXXXXXXXXX.XXXXXXXXXX
```

---

## 🔧 Step 4: Setup n8n Nodes

### 4.1 Add Airtable Credentials ใน n8n
1. ใน n8n → Settings → Credentials
2. Add new → Search "Airtable"
3. ใส่ API Key ที่ copy มา
4. Save

### 4.2 Airtable Write Node
```javascript
Node: Airtable
Operation: Create
Base ID: appXXXXXXXXXXXXXX (ใส่ของคุณ)
Table: Messages
Fields:
  timestamp: {{ new Date().toISOString() }}
  user_id: {{ $json.userId }}
  user_name: {{ $json.displayName }}
  group_id: {{ $json.groupId }}
  text: {{ $json.text }}
  intent: {{ $json.intent }}
  replied: true
```

### 4.3 Airtable Read Node
```javascript
Node: Airtable
Operation: List
Base ID: appXXXXXXXXXXXXXX
Table: Messages
Return All: ✅
Filter By Formula: IS_SAME(timestamp, TODAY(), 'day')
Sort:
  Field: timestamp
  Direction: desc
```

---

## 💻 Step 5: Code สำหรับใช้ใน n8n

### Write Data Code Node
```javascript
// Code Node - Write to Airtable
const data = $input.item.json;

// Prepare record
const record = {
  fields: {
    "timestamp": new Date().toISOString(),
    "user_id": data.userId || "unknown",
    "user_name": data.displayName || "User",
    "group_id": data.groupId || data.userId,
    "text": data.text || "",
    "intent": data.intent || "CHAT",
    "replied": true
  }
};

// Check intent type and write to appropriate table
if (data.intent === "MEDICATION") {
  // Add to Medications table too
  const medRecord = {
    fields: {
      "taken_at": new Date().toISOString(),
      "user_id": data.userId,
      "user_name": data.displayName,
      "period": getTimePeriod(), // เช้า/กลางวัน/เย็น
      "status": "ทานแล้ว"
    }
  };
  
  // Return both records
  return [{
    json: {
      message: record,
      medication: medRecord
    }
  }];
  
} else if (data.intent === "VITALS") {
  // Extract BP values
  const bpMatch = data.text.match(/(\d{2,3})\/(\d{2,3})/);
  
  if (bpMatch) {
    const vitalRecord = {
      fields: {
        "measured_at": new Date().toISOString(),
        "user_id": data.userId,
        "user_name": data.displayName,
        "bp_sys": parseInt(bpMatch[1]),
        "bp_dia": parseInt(bpMatch[2])
      }
    };
    
    return [{
      json: {
        message: record,
        vital: vitalRecord
      }
    }];
  }
}

// Default - just message
return [{json: { message: record }}];

// Helper function
function getTimePeriod() {
  const hour = new Date().getHours();
  if (hour < 10) return "เช้า";
  if (hour < 15) return "กลางวัน";
  return "เย็น";
}