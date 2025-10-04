# 📊 Airtable Free Setup - Part 2: Read & Display

## 🔍 Step 6: อ่านข้อมูลสำหรับ Flex Card

### Read & Generate Report Code Node
```javascript
// Code Node - Read from Airtable and Generate Flex Card
const records = $input.all()[0].json.records || [];
const groupId = $json.groupId;

// Filter for today and this group
const today = new Date().toDateString();
const todayRecords = records.filter(r => {
  const recordDate = new Date(r.fields.timestamp).toDateString();
  const recordGroup = r.fields.group_id;
  return recordDate === today && recordGroup === groupId;
});

// Calculate summary
const medicationCount = todayRecords.filter(r => 
  r.fields.intent === 'MEDICATION'
).length;

const vitalsRecords = todayRecords.filter(r => 
  r.fields.intent === 'VITALS'
);

const latestVital = vitalsRecords[0];

// Create timeline items
const timelineItems = todayRecords
  .slice(0, 5)
  .map(r => {
    const time = new Date(r.fields.timestamp).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let text = '';
    switch(r.fields.intent) {
      case 'MEDICATION':
        text = `✅ ${r.fields.user_name} ทานยาแล้ว`;
        break;
      case 'VITALS':
        const bp = r.fields.text.match(/(\d{2,3})\/(\d{2,3})/);
        text = `📊 ${r.fields.user_name} วัดความดัน ${bp ? bp[0] : ''}`;
        break;
      default:
        text = `💬 ${r.fields.user_name}: ${r.fields.text.substring(0, 20)}...`;
    }
    
    return { time, text };
  });

// Generate Flex Card
const flexCard = {
  type: "flex",
  altText: "📊 สรุปสุขภาพประจำวัน",
  contents: {
    type: "bubble",
    size: "mega",
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "📊 รายงานสุขภาพประจำวัน",
          color: "#ffffff",
          size: "lg",
          weight: "bold"
        },
        {
          type: "text",
          text: new Date().toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          color: "#ffffff88",
          size: "sm"
        }
      ],
      backgroundColor: "#27ACB2",
      paddingAll: "20px"
    },
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        // Summary section
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "💊 การทานยา",
                  size: "sm",
                  color: "#555555"
                },
                {
                  type: "text",
                  text: `${medicationCount}/3 มื้อ`,
                  size: "xl",
                  color: medicationCount >= 3 ? "#27ACB2" : "#FF6B6B",
                  weight: "bold"
                }
              ],
              flex: 1
            },
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: "🩺 ความดันล่าสุด",
                  size: "sm",
                  color: "#555555"
                },
                {
                  type: "text",
                  text: latestVital ? 
                    latestVital.fields.text.match(/\d{2,3}\/\d{2,3}/)?.[0] || "ไม่มีข้อมูล" : 
                    "ยังไม่วัด",
                  size: "xl",
                  color: "#27ACB2",
                  weight: "bold"
                }
              ],
              flex: 1
            }
          ],
          spacing: "md"
        },
        // Separator
        {
          type: "separator",
          margin: "xl"
        },
        // Timeline section
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "📝 กิจกรรมวันนี้",
              weight: "bold",
              color: "#333333",
              size: "md"
            },
            {
              type: "box",
              layout: "vertical",
              contents: timelineItems.length > 0 ? 
                timelineItems.map(item => ({
                  type: "box",
                  layout: "horizontal",
                  contents: [
                    {
                      type: "text",
                      text: item.time,
                      size: "sm",
                      color: "#999999",
                      flex: 2
                    },
                    {
                      type: "text",
                      text: item.text,
                      size: "sm",
                      color: "#555555",
                      flex: 5,
                      wrap: true
                    }
                  ]
                })) : 
                [{
                  type: "text",
                  text: "ยังไม่มีกิจกรรม",
                  size: "sm",
                  color: "#999999"
                }],
              spacing: "sm",
              margin: "md"
            }
          ],
          margin: "xl"
        }
      ],
      paddingAll: "20px"
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          style: "primary",
          action: {
            type: "message",
            label: "💊 บันทึกทานยา",
            text: "ทานยาแล้ว"
          },
          color: "#27ACB2"
        },
        {
          type: "button",
          style: "link",
          action: {
            type: "message",
            label: "🩺 บันทึกความดัน",
            text: "จะวัดความดัน"
          }
        }
      ],
      spacing: "sm",
      paddingAll: "12px"
    }
  }
};

// Return for LINE Reply
return [{
  json: {
    replyToken: $('Parse Event').item.json.replyToken,
    messages: [flexCard]
  }
}];
```

---

## 🎨 Step 7: สร้าง Views (ใน Airtable)

### View 1: "Today's Data"
1. คลิก "Grid view" dropdown
2. เลือก "Create new view"
3. ชื่อ: "Today's Data"
4. Add filter:
   - Where `timestamp` → is → today

### View 2: "Medications Only"
1. Create new view
2. ชื่อ: "Medications"
3. Add filter:
   - Where `intent` → is → MEDICATION

### View 3: "Emergency Alerts"
1. Create new view
2. ชื่อ: "Emergency"
3. Add filter:
   - Where `intent` → is → EMERGENCY
4. Sort by `timestamp` → newest first

---

## 🔄 Step 8: Complete n8n Workflow

```json
{
  "name": "Health Buddy - Airtable Free",
  "nodes": [
    {
      "name": "LINE Webhook",
      "type": "n8n-nodes-base.webhook"
    },
    {
      "name": "Parse Event",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Parse LINE event\nconst event = $input.item.json.body?.events?.[0];\n// Detect intent...\nreturn [{json: processedData}];"
      }
    },
    {
      "name": "Write to Airtable",
      "type": "n8n-nodes-base.airtable",
      "parameters": {
        "operation": "create",
        "base": "appXXXXXXXXXXXXXX",
        "table": "Messages"
      }
    },
    {
      "name": "Check if Report Request",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "conditions": [{
            "leftValue": "={{ $json.text }}",
            "rightValue": "สรุป",
            "operation": "contains"
          }]
        }
      }
    },
    {
      "name": "Read from Airtable",
      "type": "n8n-nodes-base.airtable",
      "parameters": {
        "operation": "list",
        "base": "appXXXXXXXXXXXXXX",
        "table": "Messages",
        "returnAll": true,
        "filterByFormula": "IS_SAME(timestamp, TODAY(), 'day')"
      }
    },
    {
      "name": "Generate Flex Card",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Code from Step 6"
      }
    },
    {
      "name": "LINE Reply",
      "type": "n8n-nodes-base.httpRequest"
    }
  ]
}
```

---

## 📱 Step 9: Test Commands

ทดสอบใน LINE:

1. **บันทึกยา**: "ทานยาแล้ว"
   - ต้องเห็น record ใน Messages table
   - intent = MEDICATION

2. **บันทึกความดัน**: "ความดัน 120/80"
   - ต้องเห็น record ใน Messages & Vitals

3. **ขอสรุป**: "สรุปวันนี้"
   - ต้องได้ Flex Card กลับมา

---

## 📈 Step 10: Monitor Usage

### Check Records Count
1. ดูที่ Airtable footer
2. จะเห็น "X records" (max 1,200 for free)

### Usage Estimate
```
Per Day (1 group):
- Messages: ~30 records
- Medications: ~6 records  
- Vitals: ~4 records
= 40 records/day

Free Limit: 1,200 records
= 30 days usage

Solution: Archive old data monthly
```

---

## 💡 Tips for Free Plan

### 1. **Minimize Records**
```javascript
// Store summary only, not every message
if (isImportant(data)) {
  writeToAirtable(data);
}
```

### 2. **Use Views Instead of Tables**
```
แทนที่จะสร้าง:
- Table: Group_A
- Table: Group_B

ใช้:
- Table: Messages
  - View: Group_A (filter)
  - View: Group_B (filter)
```

### 3. **Archive Monthly**
```javascript
// Move old data to Google Sheets
if (daysOld > 30) {
  await copyToSheets(record);
  await deleteFromAirtable(record);
}
```

### 4. **Batch Operations**
```javascript
// Write multiple records at once
const records = messages.map(m => ({fields: {...}}));
await airtable.batchCreate("Messages", records);
```

---

## 🎯 Next Steps

### When to Upgrade?
- Records > 1,000 (เหลือน้อย)
- Need > 2 groups
- Want automations
- Need more storage

### Upgrade Path:
1. **Export data** (CSV)
2. **Upgrade to Team** ($20/mo)
3. **Import data back**
4. **Get 50,000 records!**

---

## 🔗 Resources

- **Airtable API Docs**: https://airtable.com/developers/web/api/introduction
- **n8n Airtable Node**: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.airtable/
- **Formula Reference**: https://support.airtable.com/docs/formula-field-reference

---

## ⚠️ Troubleshooting

### "Invalid API Key"
- Check token starts with `pat`
- Check base access permissions

### "Table not found"
- Check table name (case sensitive)
- Check Base ID correct

### "Rate limited"
- Free plan: 5 requests/second
- Add delay between calls

---

*เริ่มจาก Free ก่อน ถ้าดีค่อย upgrade! 🚀*