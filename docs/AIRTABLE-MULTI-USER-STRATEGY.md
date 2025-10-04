# 🎯 Airtable Multi-User Strategy

## ✨ ข้อดีของ Airtable เหนือ Google Sheets

### **Built-in Features ที่เหมาะกับ Multi-User**
```
✅ Views & Filters ต่อ user/group
✅ Row-level permissions 
✅ Linked Records (relational)
✅ API ที่ดีกว่า
✅ Real-time collaboration
✅ Form views สำหรับ input
✅ Automation built-in
```

---

## 📊 Airtable Structure สำหรับ Multi-User Bot

### Option 1: **Single Base with Views** ✅ (แนะนำ)

```
📦 Base: Health Buddy Platform
│
├── 📋 Table: Users
│   ├── userId (Primary)
│   ├── displayName
│   ├── groupId (Link to Groups)
│   └── role
│
├── 📋 Table: Groups  
│   ├── groupId (Primary)
│   ├── groupName
│   ├── members (Link to Users)
│   └── createdAt
│
├── 📋 Table: Messages
│   ├── messageId
│   ├── userId (Link to Users)
│   ├── groupId (Link to Groups)
│   ├── text
│   ├── intent
│   └── timestamp
│
├── 📋 Table: Medications
│   ├── logId
│   ├── userId (Link to Users)
│   ├── groupId (Link to Groups)
│   ├── takenAt
│   └── status
│
└── 📋 Table: Vitals
    ├── vitalId
    ├── userId (Link to Users)
    ├── bloodPressure
    └── recordedAt
```

### **การแบ่ง Views ต่อ Group** (ดีมาก!)
```javascript
// Airtable Views - แยกข้อมูลอัตโนมัติ
Views:
├── 🔍 "Group A Messages" (Filter: groupId = "Cxxxx1")
├── 🔍 "Group B Messages" (Filter: groupId = "Cxxxx2")
├── 🔍 "Today's Activities" (Filter: date = TODAY())
├── 🔍 "Emergency Alerts" (Filter: intent = "EMERGENCY")
└── 🔍 "Personal - User123" (Filter: userId = "U123")
```

---

## 🔧 Implementation ใน n8n

### 1. **Setup Base Structure**
```javascript
// Airtable Config
const AIRTABLE_CONFIG = {
  baseId: "appXXXXXXXXXX",
  tables: {
    users: "Users",
    groups: "Groups", 
    messages: "Messages",
    medications: "Medications",
    vitals: "Vitals"
  }
};
```

### 2. **Smart Data Writing**
```javascript
// Write with automatic group/user linking
async function logToAirtable(data) {
  const { userId, groupId, text, intent } = data;
  
  // 1. Check/Create User
  const userRecord = await findOrCreateUser(userId);
  
  // 2. Check/Create Group
  const groupRecord = await findOrCreateGroup(groupId);
  
  // 3. Log Message with Links
  await airtable.create("Messages", {
    "User": [userRecord.id],      // Linked record
    "Group": [groupRecord.id],    // Linked record
    "Text": text,
    "Intent": intent,
    "Timestamp": new Date().toISOString()
  });
}
```

### 3. **Filtered Data Reading**
```javascript
// Get data for specific group
async function getGroupData(groupId) {
  const records = await airtable.select("Messages", {
    filterByFormula: `{Group ID} = '${groupId}'`,
    sort: [{field: "Timestamp", direction: "desc"}],
    maxRecords: 100
  });
  
  return records;
}

// Get user's medication history
async function getUserMedications(userId) {
  const records = await airtable.select("Medications", {
    filterByFormula: `AND(
      {User ID} = '${userId}',
      {Taken At} >= '${getToday()}'
    )`,
    view: "Today's Medications" // Use pre-defined view
  });
  
  return records;
}
```

---

## 🎨 Advanced Features

### 1. **Workspace แยกต่อองค์กร** (Enterprise)
```
🏢 Workspace: Hospital A
  └── Base: Health Buddy
      └── Tables...

🏢 Workspace: Hospital B
  └── Base: Health Buddy
      └── Tables...
```

### 2. **Synced Tables** (Share ข้อมูลระหว่าง Bases)
```javascript
// Sync master user list to all bases
Base A (Master):
  Table: Users → Sync to Base B, C, D

Base B (Group):
  Table: Users (Synced) → Read-only from Master
```

### 3. **Interface Designer** (สร้าง Dashboard)
```
📱 Interface: Family Dashboard
  ├── 📊 Chart: Daily Medication Compliance
  ├── 📋 List: Today's Activities
  ├── 🔔 Alert: Missed Medications
  └── 📈 Graph: BP Trends
```

### 4. **Automations** (ไม่ต้องเขียน code)
```yaml
Automation: Daily Report
  Trigger: At 10:00 PM
  Actions:
    1. Find records (Today's data)
    2. Create summary
    3. Send to Slack/Email/LINE
```

---

## 💰 Pricing & Limits

### **Free Plan**
- 1,200 records per base
- 2 GB attachments
- Unlimited bases
- **เหมาะ:** 1-5 groups (240 records/group)

### **Team Plan** ($20/user/month)
- 50,000 records per base
- 20 GB attachments
- Revision history
- **เหมาะ:** 50-500 groups

### **Business Plan** ($45/user/month)
- 125,000 records per base
- 100 GB attachments
- Admin panel
- **เหมาะ:** Enterprise

---

## 📊 เปรียบเทียบ Airtable vs Google Sheets

| Feature | Airtable | Google Sheets |
|---------|----------|---------------|
| **การแบ่งข้อมูล** | Views & Filters ✅ | Manual tabs ⚠️ |
| **Scalability** | 50,000 records (paid) | 10M cells แต่ช้า |
| **API** | RESTful + SDK | Google API |
| **UI** | Database UI สวย | Spreadsheet |
| **Mobile** | Dedicated app ดีมาก | Sheets app |
| **Permissions** | Row-level possible | Sheet-level only |
| **Relations** | Linked records ✅ | VLOOKUP 😅 |
| **Cost** | $20/mo (team) | Free |

---

## 🚀 Migration Strategy

### **Phase 1: Prototype** (Free tier)
```javascript
// Single base, simple structure
const base = {
  tables: ["Messages", "Users"],
  records: "< 1,200"
};
```

### **Phase 2: Growth** (Team plan)
```javascript
// Add more tables and views
const base = {
  tables: ["Messages", "Users", "Groups", "Medications", "Vitals"],
  views: ["Per Group", "Per User", "Daily Summary"],
  automations: ["Daily Report", "Alert System"]
};
```

### **Phase 3: Scale** (Business/Enterprise)
```javascript
// Multiple bases with sync
const architecture = {
  bases: {
    master: "User Management",
    operational: ["Region A", "Region B"],
    analytics: "Reporting Base"
  },
  syncedTables: ["Users", "Groups"],
  interfaces: ["Admin Panel", "Family Dashboard"]
};
```

---

## 💡 Best Practices สำหรับ Bot

### 1. **Use Linked Records**
```javascript
// ❌ Bad: Store as text
{
  "userId": "U12345",
  "userName": "John"  // Duplicated
}

// ✅ Good: Link to Users table
{
  "User": ["recXXXXX"],  // Linked record ID
}
```

### 2. **Batch Operations**
```javascript
// Batch create multiple records
const records = messages.map(msg => ({
  fields: {
    "User": [msg.userId],
    "Text": msg.text,
    "Timestamp": msg.timestamp
  }
}));

await airtable.batchCreate("Messages", records);
```

### 3. **Use Views for Performance**
```javascript
// ❌ Slow: Filter everything in code
const allRecords = await getAll();
const filtered = allRecords.filter(r => r.groupId === 'xxx');

// ✅ Fast: Use Airtable view
const records = await airtable.select({
  view: "Group_XXX_View"
});
```

### 4. **Implement Caching**
```javascript
// Cache frequently accessed data
const cache = new Map();

async function getGroupInfo(groupId) {
  if (cache.has(groupId)) {
    return cache.get(groupId);
  }
  
  const data = await airtable.find("Groups", groupId);
  cache.set(groupId, data);
  
  // Clear cache after 5 minutes
  setTimeout(() => cache.delete(groupId), 300000);
  
  return data;
}
```

---

## 🎯 Recommendation

### **ใช้ Airtable เมื่อ:**
- ✅ ต้องการ UI สวยสำหรับ non-technical users
- ✅ ต้องการ views แยกต่อ group/user
- ✅ ต้องการ mobile app ที่ดี
- ✅ Budget $20-45/month OK
- ✅ ต้องการ automation ที่ไม่ต้องเขียน code

### **ใช้ Google Sheets เมื่อ:**
- ✅ ต้องการฟรี 100%
- ✅ Prototype/MVP phase
- ✅ < 10 groups
- ✅ ไม่ต้องการ features พิเศษ

### **Code Template สำหรับ n8n + Airtable:**
```javascript
// n8n Code Node
const groupId = $json.groupId;
const userId = $json.userId;

// Auto-create view name
const viewName = `Group_${groupId.substring(0,8)}`;

// Check if view exists, create if not
try {
  await $items[0].binary.airtable.select({
    view: viewName
  });
} catch (error) {
  // View doesn't exist, use filterByFormula
  const records = await $items[0].binary.airtable.select({
    filterByFormula: `{Group ID} = '${groupId}'`
  });
}

return records;
```

---

*สรุป: Airtable แบ่งข้อมูล multi-user ได้ดีกว่า Google Sheets มาก ด้วย Views, Filters, และ Linked Records แต่ต้องจ่ายเงินถ้าข้อมูลเยอะ*