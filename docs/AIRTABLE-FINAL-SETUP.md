# 🚀 Airtable Setup แบบครบ จบ ไม่ต้องเปลี่ยน

## 📊 Database Structure (ทำครั้งเดียว ใช้ได้นาน)

### Base: "Health Buddy Production"

#### 1️⃣ **Table: Users**
| Field | Type | Purpose |
|-------|------|---------|
| user_id | Single line (Primary) | LINE User ID |
| display_name | Single line | ชื่อแสดง |
| group | Link to Groups | กลุ่มที่อยู่ |
| role | Single select | elderly/caregiver |
| created_at | Created time | Auto timestamp |
| last_active | Date | Update ทุกครั้งที่ active |

#### 2️⃣ **Table: Groups**
| Field | Type | Purpose |
|-------|------|---------|
| group_id | Single line (Primary) | LINE Group ID |
| group_name | Single line | ชื่อกลุ่ม |
| members | Link to Users | สมาชิกในกลุ่ม |
| created_at | Created time | Auto timestamp |
| active | Checkbox | Active/Inactive |

#### 3️⃣ **Table: Messages**
| Field | Type | Purpose |
|-------|------|---------|
| message_id | Autonumber | Auto ID |
| timestamp | Date & time | เวลาที่ส่ง |
| user | Link to Users | ใครส่ง |
| group | Link to Groups | กลุ่มไหน |
| text | Long text | ข้อความ |
| intent | Single select | MEDICATION/VITALS/CHAT/EMERGENCY |
| replied | Checkbox | Bot ตอบแล้วหรือยัง |

#### 4️⃣ **Table: Medications**
| Field | Type | Purpose |
|-------|------|---------|
| log_id | Autonumber | Auto ID |
| user | Link to Users | ใครทาน |
| group | Link to Groups | กลุ่มไหน |
| taken_at | Date & time | เวลาที่ทาน |
| period | Single select | เช้า/กลางวัน/เย็น |
| status | Single select | ทานแล้ว/ข้าม/ลืม |
| logged_by | Link to Users | ใคร log ให้ |

#### 5️⃣ **Table: Vitals**
| Field | Type | Purpose |
|-------|------|---------|
| vital_id | Autonumber | Auto ID |
| user | Link to Users | ของใคร |
| group | Link to Groups | กลุ่มไหน |
| measured_at | Date & time | เวลาที่วัด |
| bp_systolic | Number | ความดันบน |
| bp_diastolic | Number | ความดันล่าง |
| blood_sugar | Number | น้ำตาล (optional) |
| weight | Number | น้ำหนัก (optional) |
| notes | Long text | หมายเหตุ |

#### 6️⃣ **Table: Daily_Reports**
| Field | Type | Purpose |
|-------|------|---------|
| report_id | Autonumber | Auto ID |
| date | Date | วันที่ |
| group | Link to Groups | กลุ่มไหน |
| summary_json | Long text | Flex Card JSON |
| sent | Checkbox | ส่งแล้วหรือยัง |
| sent_at | Date & time | เวลาที่ส่ง |

---

## 🔍 Views (สร้างไว้ตั้งแต่แรก)

### Messages Table Views:
1. **"Today's Messages"** - Filter: `IS_SAME({timestamp}, TODAY(), 'day')`
2. **"Emergency Alerts"** - Filter: `{intent} = 'EMERGENCY'`
3. **"By Group"** - Group by: `{group}`
4. **"Unanswered"** - Filter: `{replied} = FALSE()`

### Medications Table Views:
1. **"Today's Medications"** - Filter: `IS_SAME({taken_at}, TODAY(), 'day')`
2. **"Missed Medications"** - Filter: `{status} = 'ลืม'`
3. **"By User"** - Group by: `{user}`

### Vitals Table Views:
1. **"Latest Vitals"** - Sort: `{measured_at}` DESC
2. **"High BP Alert"** - Filter: `OR({bp_systolic} > 140, {bp_diastolic} > 90)`
3. **"Weekly Trend"** - Filter: Last 7 days

---

## 🤖 Automations (ตั้งไว้เลย)

### 1. **Daily Report Generator**
```
Trigger: Every day at 22:00
Actions:
1. Find records (Today's data)
2. Run script (Generate summary)
3. Create record in Daily_Reports
4. Send webhook to n8n (trigger LINE send)
```

### 2. **18-Hour Alert**
```
Trigger: Every hour
Condition: IF last_active > 18 hours ago
Actions:
1. Create alert record
2. Send webhook to n8n
3. Update user status
```

### 3. **Archive Old Data**
```
Trigger: Every week
Condition: Records older than 30 days
Actions:
1. Move to Archive table
2. Delete from main table
```

---

## 🔧 n8n Integration Code

### **Write to Airtable**
```javascript
// Universal write function
async function writeToAirtable(table, data) {
  const record = {
    fields: {}
  };
  
  // Auto-map fields based on table
  switch(table) {
    case 'Messages':
      record.fields = {
        "timestamp": new Date().toISOString(),
        "user": [await getUserRecordId(data.userId)],
        "group": [await getGroupRecordId(data.groupId)],
        "text": data.text,
        "intent": data.intent,
        "replied": true
      };
      break;
      
    case 'Medications':
      record.fields = {
        "user": [await getUserRecordId(data.userId)],
        "group": [await getGroupRecordId(data.groupId)],
        "taken_at": new Date().toISOString(),
        "period": getPeriod(), // เช้า/กลางวัน/เย็น
        "status": "ทานแล้ว"
      };
      break;
      
    case 'Vitals':
      const bp = data.text.match(/(\d{2,3})\/(\d{2,3})/);
      record.fields = {
        "user": [await getUserRecordId(data.userId)],
        "group": [await getGroupRecordId(data.groupId)],
        "measured_at": new Date().toISOString(),
        "bp_systolic": parseInt(bp[1]),
        "bp_diastolic": parseInt(bp[2])
      };
      break;
  }
  
  return await airtable.create(table, record);
}

// Helper: Get or create user
async function getUserRecordId(userId) {
  let user = await airtable.select('Users', {
    filterByFormula: `{user_id} = '${userId}'`
  });
  
  if (!user.length) {
    user = await airtable.create('Users', {
      fields: {
        "user_id": userId,
        "display_name": "New User",
        "created_at": new Date().toISOString()
      }
    });
  }
  
  return user[0].id;
}
```

### **Read for Flex Card**
```javascript
// Get today's summary
async function getTodaySummary(groupId) {
  // Use view for performance
  const records = await airtable.select({
    table: 'Messages',
    view: "Today's Messages",
    filterByFormula: `{group_id} = '${groupId}'`
  });
  
  // Data already in JSON!
  const summary = {
    medications: records.filter(r => r.fields.intent === 'MEDICATION'),
    vitals: records.filter(r => r.fields.intent === 'VITALS'),
    total: records.length
  };
  
  return generateFlexCard(summary);
}
```

---

## 💡 Pro Tips

### 1. **Use Record IDs for Linking**
```javascript
// ❌ Wrong - store as text
{ "user": "U12345" }

// ✅ Right - link to record
{ "user": ["recABC123"] }
```

### 2. **Cache Record IDs**
```javascript
const userCache = new Map();

function getUserId(userId) {
  if (userCache.has(userId)) {
    return userCache.get(userId);
  }
  // Fetch and cache...
}
```

### 3. **Batch Operations**
```javascript
// Create multiple records at once
const records = data.map(d => ({
  fields: { /* ... */ }
}));

await airtable.batchCreate('Messages', records);
```

### 4. **Use Formulas for Calculations**
```javascript
// In Airtable, create Formula field:
"Compliance Rate" = COUNT({Medications}) / 3

// Then just read the calculated value!
```

---

## 📱 Mobile Access

### For Admin:
1. Download Airtable app
2. Login → See all data
3. Can edit/add records
4. Get notifications

### For Family:
1. Share read-only view link
2. Or create Interface (gallery/dashboard)
3. Embed in LINE LIFF (optional)

---

## 💰 Cost Breakdown

### Year 1:
- **Month 1-3**: Free tier (1,200 records)
- **Month 4-12**: $20/mo = $180
- **Total Year 1**: $180 (6,000฿)

### Year 2+:
- **$20/mo** = $240/year (8,000฿)
- Supports up to 50,000 records
- ~50 groups no problem

### Compare:
- Developer time saved: 20+ hours
- No migration needed
- No scaling issues
- = Worth it! ✅

---

## 🚀 Start Now

1. Sign up Airtable (free)
2. Copy this structure
3. Get API key
4. Setup n8n nodes
5. Done! ไม่ต้องเปลี่ยนอีก 2-3 ปี

---

*"ทำถูกตั้งแต่แรก ดีกว่าแก้ทีหลัง"*