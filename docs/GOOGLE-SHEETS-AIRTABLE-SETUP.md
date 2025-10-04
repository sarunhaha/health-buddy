# 📊 บันทึกข้อมูลไป Google Sheets & Airtable

## 🔵 Option 1: Google Sheets (ฟรี + ง่าย)

### ขั้นตอนการ Setup

#### 1. **สร้าง Google Sheet**
1. ไปที่ [Google Sheets](https://sheets.google.com)
2. สร้าง Spreadsheet ใหม่
3. ตั้งชื่อ columns:
   ```
   A1: Timestamp
   B1: User ID
   C1: Display Name  
   D1: Message Type
   E1: Text
   F1: Intent
   G1: Group ID
   H1: Source Type
   ```

#### 2. **Setup Google Service Account**
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com)
2. สร้าง Project ใหม่ (หรือใช้เดิม)
3. Enable Google Sheets API
4. สร้าง Service Account:
   - IAM & Admin → Service Accounts → Create
   - ตั้งชื่อ เช่น "health-buddy-bot"
   - Create Key → JSON → Download
5. Copy email ของ Service Account (xxx@xxx.iam.gserviceaccount.com)

#### 3. **Share Sheet กับ Service Account**
1. เปิด Google Sheet ที่สร้าง
2. คลิก Share
3. ใส่ email ของ Service Account
4. กด Send (ให้สิทธิ์ Editor)

#### 4. **n8n Configuration**
```javascript
// Google Sheets Node ใน n8n
{
  "name": "Save to Google Sheets",
  "type": "n8n-nodes-base.googleSheets",
  "parameters": {
    "authentication": "serviceAccount",
    "operation": "append",
    "sheetId": "YOUR_SHEET_ID", // ID จาก URL
    "range": "Sheet1!A:H",
    "options": {
      "valueInputMode": "USER_ENTERED"
    }
  },
  "credentials": {
    // Upload JSON key file ที่ download มา
  }
}
```

#### 5. **Code Node สำหรับ Format Data**
```javascript
// Format data for Google Sheets
const data = $input.item.json;

return [{
  json: {
    values: [[
      new Date().toISOString(),           // Timestamp
      data.userId || '',                  // User ID
      data.displayName || 'Unknown',      // Display Name
      data.messageType || 'text',         // Message Type
      data.text || '',                    // Text
      data.intent || '',                  // Intent
      data.groupId || '',                 // Group ID (ถ้าในกลุ่ม)
      data.sourceType || 'user'          // Source Type
    ]]
  }
}];
```

---

## 🟣 Option 2: Airtable (UI สวย + API ดี)

### ขั้นตอนการ Setup

#### 1. **สร้าง Airtable Base**
1. ไปที่ [Airtable](https://airtable.com)
2. สร้าง Base ใหม่ "Health Buddy Data"
3. สร้าง Table "Messages" พร้อม fields:
   - `Timestamp` (Date time)
   - `User ID` (Single line text)
   - `Display Name` (Single line text)
   - `Message Type` (Single select: text/image/sticker)
   - `Text` (Long text)
   - `Intent` (Single select: MEDICATION/VITALS/CHAT/EMERGENCY)
   - `Group ID` (Single line text)
   - `Source Type` (Single select: user/group/room)

#### 2. **Get API Credentials**
1. ไปที่ [Airtable API](https://airtable.com/api)
2. เลือก Base ที่สร้าง
3. Copy:
   - Base ID: `appXXXXXXXXXXXXXX`
   - Table Name: `Messages`
4. สร้าง Personal Access Token:
   - Account → Developer hub → Personal access tokens
   - Create new token
   - Add scope: `data.records:write`
   - Add base: เลือก Base ที่สร้าง

#### 3. **n8n Configuration**
```javascript
// Airtable Node ใน n8n
{
  "name": "Save to Airtable",
  "type": "n8n-nodes-base.airtable",
  "parameters": {
    "operation": "create",
    "base": "appXXXXXXXXXXXXXX",
    "table": "Messages",
    "options": {}
  },
  "credentials": {
    "airtableApi": {
      "apiKey": "YOUR_PERSONAL_ACCESS_TOKEN"
    }
  }
}
```

#### 4. **Code Node สำหรับ Format Data**
```javascript
// Format data for Airtable
const data = $input.item.json;

return [{
  json: {
    fields: {
      "Timestamp": new Date().toISOString(),
      "User ID": data.userId || '',
      "Display Name": data.displayName || 'Unknown',
      "Message Type": data.messageType || 'text',
      "Text": data.text || '',
      "Intent": data.intent || '',
      "Group ID": data.groupId || '',
      "Source Type": data.sourceType || 'user'
    }
  }
}];
```

---

## 🔀 เปรียบเทียบ Google Sheets vs Airtable

| Feature | Google Sheets | Airtable |
|---------|--------------|----------|
| **ราคา** | ฟรี 100% | ฟรี 1,200 records/base |
| **Setup** | ยุ่งยากนิดหน่อย (Service Account) | ง่าย (API Token) |
| **UI** | Spreadsheet ธรรมดา | Database UI สวยงาม |
| **API** | ผ่าน Google API | REST API มาตรฐาน |
| **Filtering** | ใช้ formulas | Views & Filters |
| **Automation** | ต้องใช้ Apps Script | Built-in Automations |
| **Mobile App** | Google Sheets app | Airtable app (ดีมาก) |
| **Sharing** | Share link ง่าย | Share views แยกได้ |

---

## 📝 n8n Workflow Example

```javascript
// Complete workflow structure
{
  "nodes": [
    // 1. LINE Webhook
    {
      "name": "LINE Webhook",
      "type": "n8n-nodes-base.webhook"
    },
    
    // 2. Parse Event
    {
      "name": "Parse Event",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Parse LINE event..."
      }
    },
    
    // 3. Format for Database
    {
      "name": "Format Data",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Format for Sheets/Airtable..."
      }
    },
    
    // 4. Save to Database (เลือก 1)
    {
      "name": "Save to Google Sheets",
      "type": "n8n-nodes-base.googleSheets"
      // OR
      "name": "Save to Airtable",
      "type": "n8n-nodes-base.airtable"
    },
    
    // 5. Continue with bot logic...
    {
      "name": "Intent Router",
      "type": "n8n-nodes-base.switch"
    }
  ]
}
```

---

## 🎯 Use Cases

### 1. **Log ทุก Message**
บันทึกทุกข้อความที่ bot ได้รับ เพื่อ analysis

### 2. **Track Medication**
บันทึกเฉพาะการทานยา:
```javascript
if (intent === 'MEDICATION') {
  // Save to sheet with medication details
  saveToSheet({
    timestamp: new Date(),
    userId: userId,
    medication: "ทานยาแล้ว",
    status: "completed"
  });
}
```

### 3. **Daily Summary Report**
ดึงข้อมูลจาก Sheet/Airtable มาสรุป:
```javascript
// Read from Google Sheets
const today = new Date().toDateString();
const todayRecords = await getSheetData({
  filter: `date = "${today}"`
});

// Generate summary
const summary = {
  totalMessages: todayRecords.length,
  medicationCount: todayRecords.filter(r => r.intent === 'MEDICATION').length,
  users: [...new Set(todayRecords.map(r => r.userId))]
};
```

### 4. **Emergency Alert Log**
บันทึก emergency events แยก:
```javascript
if (intent === 'EMERGENCY') {
  // Save to emergency sheet
  await saveToEmergencyLog({
    timestamp: new Date(),
    userId: userId,
    message: text,
    groupId: groupId,
    alertSent: true
  });
}
```

---

## 💡 Tips & Best Practices

1. **Batch Operations**: รวม records แล้วส่งทีเดียว ประหยัด API calls
2. **Error Handling**: ใส่ try-catch เผื่อ API fail
3. **Data Validation**: เช็คข้อมูลก่อนส่ง
4. **Backup**: Export data เป็นระยะ
5. **Privacy**: อย่าเก็บข้อมูล sensitive (รหัสผ่าน, เลขบัตร)

---

## 🔗 Resources

- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [Airtable API Docs](https://airtable.com/developers/web/api/introduction)
- [n8n Google Sheets Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/)
- [n8n Airtable Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.airtable/)

---
*เลือกใช้ตามความเหมาะสม: Google Sheets ถ้าต้องการฟรี 100%, Airtable ถ้าต้องการ UI สวยและ features เยอะ*