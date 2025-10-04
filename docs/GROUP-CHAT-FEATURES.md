# 🏥 Health Buddy - Group Chat Features

## 📋 การทำงานในกลุ่ม

### 1. **Bot จะตอบเมื่อ:**
- ✅ ถูก mention (@Health Buddy)
- ✅ มี keywords สำคัญ (ช่วย, ฉุกเฉิน, พลอย, โอ๊ต)
- ✅ มีคำเกี่ยวกับยา/ความดัน
- ❌ ไม่ตอบการสนทนาทั่วไป (ไม่รบกวนกลุ่ม)

### 2. **Commands ในกลุ่ม**

#### Emergency (ตอบทันที)
```
ช่วยด้วย!
มีคนล้ม
หายใจไม่ออก
```

#### สำหรับคนเฉพาะ
```
@Health Buddy พ่อทานยาแล้ว
@Health Buddy แม่วัดความดัน 140/85
```

#### ขอสรุปรายวัน
```
@Health Buddy สรุปวันนี้ของคุณแม่
@Health Buddy รายงานสุขภาพพ่อ
```

### 3. **Group-Specific Features**

#### A. Family Dashboard
```javascript
// Handler สำหรับขอดูสรุปในกลุ่ม
if (text.includes('สรุป') || text.includes('รายงาน')) {
  // ดึงชื่อที่ mention
  const targetName = extractNameFromText(text);
  
  // สร้าง Flex Message สรุป
  return createFamilyReport(targetName, groupId);
}
```

#### B. Multi-User Tracking
```javascript
// เก็บข้อมูลแยกตาม userId ในกลุ่มเดียวกัน
const groupMembers = {
  groupId: "Cxxxxxx",
  members: {
    "Uxxxx1": {name: "คุณพ่อ", lastMed: "08:00"},
    "Uxxxx2": {name: "คุณแม่", lastBP: "120/80"}
  }
}
```

#### C. Role-Based Responses
```javascript
// ตรวจสอบว่าใครพิมพ์ (ผู้สูงอายุ vs ลูกหลาน)
if (userId === elderlyUserId) {
  // ตอบแบบดูแลผู้สูงอายุ
  response = "เก่งมากค่ะคุณแม่ ที่ทานยาตรงเวลา 💊";
} else {
  // ตอบแบบรายงานให้ลูกหลาน
  response = "บันทึกแล้วค่ะ คุณแม่ทานยาเวลา 08:00 น.";
}
```

### 4. **Quick Reply ในกลุ่ม**
```javascript
quickReply: {
  items: [
    {
      type: 'action',
      action: {
        type: 'message',
        label: '📊 สรุปวันนี้',
        text: '@Health Buddy สรุปวันนี้'
      }
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '💊 พ่อทานยาแล้ว',
        text: '@Health Buddy พ่อทานยาแล้ว'
      }
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '🩺 แม่วัดความดัน',
        text: '@Health Buddy แม่วัดความดัน'
      }
    }
  ]
}
```

### 5. **Scheduled Reports ในกลุ่ม**

#### Daily Summary (22:00)
```
📊 สรุปประจำวัน - ครอบครัวคุณสมชาย

👴 คุณพ่อ:
✅ ทานยา: 3/3 มื้อ
📈 ความดัน: 125/82 (ปกติ)
😊 อารมณ์: ดี

👵 คุณแม่:
✅ ทานยา: 2/3 มื้อ (ลืมเย็น)
📈 ความดัน: 140/90 (สูงเล็กน้อย)
😔 อารมณ์: เหงา

⚠️ แนะนำ:
- เตือนคุณแม่ทานยาเย็น
- ควรวัดความดันซ้ำพรุ่งนี้
```

### 6. **Privacy ในกลุ่ม**
- ❌ ไม่แสดงข้อมูลละเอียดอ่อน (โรคประจำตัว, ยา)
- ✅ แสดงเฉพาะสถานะทั่วไป (ทานยาแล้ว/ยัง)
- 🔒 ข้อมูลละเอียดส่ง DM แทน

### 7. **Database Schema สำหรับกลุ่ม**
```sql
-- Group settings
CREATE TABLE group_settings (
  group_id TEXT PRIMARY KEY,
  group_name TEXT,
  family_name TEXT,
  report_time TEXT DEFAULT '22:00',
  active BOOLEAN DEFAULT true
);

-- Group members
CREATE TABLE group_members (
  group_id TEXT,
  user_id TEXT,
  display_name TEXT,
  role TEXT, -- 'elderly', 'caregiver'
  nickname TEXT, -- 'พ่อ', 'แม่', 'ลูก'
  PRIMARY KEY (group_id, user_id)
);

-- Group medication logs
CREATE TABLE group_medication_logs (
  id SERIAL PRIMARY KEY,
  group_id TEXT,
  user_id TEXT,
  nickname TEXT,
  taken_at TIMESTAMP,
  logged_by TEXT -- ใครเป็นคน log
);
```

## 🚀 Implementation Steps

### Step 1: Update Parse Event
ใช้ code จาก `parse-event-group.js`

### Step 2: Add Group Handlers
```javascript
// Group Summary Handler
const groupSummaryHandler = {
  name: "Group Summary",
  code: `
    const groupId = $json.groupId;
    const members = await getGroupMembers(groupId);
    const summary = await generateGroupSummary(members);
    
    return [{
      json: {
        replyToken,
        messages: [createFlexMessage(summary)]
      }
    }];
  `
};
```

### Step 3: Setup Scheduled Group Reports
```javascript
// Cron node สำหรับส่งรายงานกลุ่ม
const dailyGroupReport = {
  schedule: "0 22 * * *", // 22:00 ทุกวัน
  handler: async () => {
    const activeGroups = await getActiveGroups();
    
    for (const group of activeGroups) {
      const report = await generateDailyReport(group.id);
      await pushMessageToGroup(group.id, report);
    }
  }
};
```

## 📝 Testing Checklist

- [ ] Bot เข้ากลุ่มได้
- [ ] ตอบเมื่อถูก mention
- [ ] ไม่ตอบการสนทนาทั่วไป
- [ ] Emergency ทำงานในกลุ่ม
- [ ] บันทึกข้อมูลแยก user ในกลุ่ม
- [ ] ส่งรายงานประจำวัน 22:00
- [ ] Quick Reply ทำงานถูกต้อง
- [ ] Privacy ข้อมูลปลอดภัย

## 🔧 Configuration

### LINE Developers Console (ตามเอกสารอย่างเป็นทางการ)
1. ไปที่ LINE Developers Console
2. เลือก Channel ของคุณ
3. ไปที่แท็บ **Messaging API**
4. เปิด **"Allow bot to join group chats"** (ปกติจะปิดอยู่)
5. Note: มี LINE Official Account ได้แค่ 1 ตัวต่อกลุ่ม

### n8n Workflow
1. Import `health-buddy-group.json`
2. Update Parse Event node
3. Add Group Handler nodes
4. Setup Cron for group reports

## 💡 Tips

1. **Mention Format**: LINE ส่ง mention มาเป็น `@displayName` ต้อง clean ออก
2. **Group vs Room**: Group มี groupId, Room มี roomId - handle ทั้ง 2
3. **Push Message**: ใช้สำหรับส่งรายงาน (ไม่ต้องรอ reply token)
4. **Rate Limit**: ระวัง quota การส่งข้อความในกลุ่ม

---
*Group Chat Features for Health Buddy Bot*