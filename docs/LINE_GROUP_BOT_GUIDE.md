# 🏠 LINE Group Bot Setup Guide - บอทในกลุ่มครอบครัว

## 📌 Concept: บอทในกลุ่ม vs บอทส่วนตัว

### ข้อดีของบอทในกลุ่ม
✅ **ทุกคนเห็นพร้อมกัน** - ลูกหลานเห็น real-time เมื่อผู้สูงอายุตอบ
✅ **สร้างการมีส่วนร่วม** - ทุกคนช่วยกันเตือน/ให้กำลังใจ
✅ **โปร่งใส** - ไม่มีใครกังวลว่าแม่/พ่อคุยอะไรกับบอท
✅ **ง่าย** - ไม่ต้องสลับหน้าจอไปมา

### ข้อเสียของบอทในกลุ่ม
❌ **Privacy** - ข้อมูลสุขภาพเห็นหมด
❌ **Spam** - การแจ้งเตือนอาจรบกวนคนอื่น
❌ **ความซับซ้อน** - ต้องแยก context ของแต่ละคน

---

## Step 1: Enable Group & Multi-person Chat

### 1.1 LINE Developers Console Settings
```
1. ไปที่ Messaging API tab
2. หัวข้อ "Features"
3. เปิด Settings:
   ✅ Allow bot to join group chats
   ✅ Allow bot to join multi-person chats
```

### 1.2 LINE OA Manager Settings
```
1. ไปที่ https://manager.line.biz/
2. Settings > Response settings
3. ปิด:
   ❌ Greeting message (ใช้ custom)
   ❌ Auto-response (ใช้ webhook)
4. เปิด:
   ✅ Webhooks
```

---

## Step 2: Group Event Types ที่ต้อง Handle

### 2.1 เมื่อบอทถูกเชิญเข้ากลุ่ม
```javascript
// Event type: 'join'
{
  type: 'join',
  source: {
    type: 'group',
    groupId: 'C1234567890abcdef'  // Save this!
  }
}

// Response: ส่วนทักทาย
async handleJoinGroup(event) {
  const groupId = event.source.groupId;
  
  await client.pushMessage(groupId, {
    type: 'text',
    text: `สวัสดีครับ/ค่ะ! 👋
    
ผม/ดิฉันคือ Health Buddy ผู้ช่วยดูแลสุขภาพ
จะคอยเตือนทานยา วัดความดัน และส่งรายงานให้ทุกคนในกลุ่มนะครับ/ค่ะ

🔧 การตั้งค่าเริ่มต้น:
1. พิมพ์ "ลงทะเบียน" เพื่อเริ่มต้น
2. เลือกผู้สูงอายุที่ต้องการดูแล
3. ตั้งเวลาเตือนยา

พิมพ์ "ช่วยเหลือ" ดูคำสั่งทั้งหมด`
  });
  
  // Save group to database
  await saveGroup(groupId);
}
```

### 2.2 Message ในกลุ่ม
```javascript
// Event type: 'message' with source.type = 'group'
{
  type: 'message',
  source: {
    type: 'group',
    groupId: 'Cxxxxx',
    userId: 'Uxxxxx'  // คนที่พิมพ์
  },
  message: {
    type: 'text',
    text: 'ทานยาแล้ว'
  }
}
```

---

## Step 3: การแยกแยะ Context ในกลุ่ม

### 3.1 ใช้ Mention (@) สำหรับระบุตัวตน
```javascript
// ผู้ใช้พิมพ์: "@คุณแม่ ทานยาแล้ว"
async handleGroupMessage(event) {
  const text = event.message.text;
  const userId = event.source.userId;
  const groupId = event.source.groupId;
  
  // Check if message mentions someone
  if (text.includes('@')) {
    const mentioned = extractMention(text); // @คุณแม่
    const action = extractAction(text);     // ทานยาแล้ว
    
    await logMedicationForPerson(mentioned, action);
    await replyMessage(event.replyToken, 
      `บันทึกแล้วค่ะ: ${mentioned} ${action} ✅`
    );
  }
}
```

### 3.2 ใช้ Quick Reply แบบมี Data
```javascript
// เตือนยาพร้อมระบุตัวตน
const reminderWithIdentity = {
  type: 'text',
  text: '🔔 ถึงเวลาทานยาเช้าแล้วค่ะ',
  quickReply: {
    items: [
      {
        type: 'action',
        action: {
          type: 'postback',
          label: 'คุณแม่ทานแล้ว',
          data: 'action=med_taken&user=mom&time=morning',
          displayText: 'คุณแม่ทานยาเช้าแล้ว'
        }
      },
      {
        type: 'action',
        action: {
          type: 'postback',
          label: 'คุณพ่อทานแล้ว',
          data: 'action=med_taken&user=dad&time=morning',
          displayText: 'คุณพ่อทานยาเช้าแล้ว'
        }
      }
    ]
  }
};
```

---

## Step 4: Database Schema สำหรับ Group

### 4.1 Groups Table
```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY,
  line_group_id VARCHAR(255) UNIQUE,
  group_name VARCHAR(255),
  created_at TIMESTAMP,
  active BOOLEAN DEFAULT true
);
```

### 4.2 Group Members Table
```sql
CREATE TABLE group_members (
  id UUID PRIMARY KEY,
  group_id UUID REFERENCES groups(id),
  user_id UUID REFERENCES users(id),
  line_user_id VARCHAR(255),
  role VARCHAR(50), -- 'elderly', 'caregiver'
  nickname VARCHAR(100), -- 'คุณแม่', 'คุณพ่อ'
  primary_patient BOOLEAN DEFAULT false
);
```

### 4.3 Group Settings
```sql
CREATE TABLE group_settings (
  id UUID PRIMARY KEY,
  group_id UUID REFERENCES groups(id),
  reminder_times JSONB, -- ["08:00", "12:00", "18:00"]
  report_time TIME DEFAULT '22:00',
  alert_threshold INTEGER DEFAULT 18, -- hours
  notify_all BOOLEAN DEFAULT true
);
```

---

## Step 5: Smart Features สำหรับกลุ่ม

### 5.1 Morning Greeting กับทุกคน
```javascript
// Cron job: 07:00
async function morningGreeting(groupId) {
  const members = await getElderlyInGroup(groupId);
  
  let greeting = '☀️ อรุณสวัสดิ์ค่ะ\n\n';
  members.forEach(member => {
    greeting += `${member.nickname} - ยาเช้า ${member.morning_med_time}\n`;
  });
  
  await client.pushMessage(groupId, {
    type: 'text',
    text: greeting + '\nขอให้ทุกคนมีวันที่ดีนะคะ 💚'
  });
}
```

### 5.2 Daily Summary แบบรวม
```javascript
// 22:00 - ส่วน Summary ในกลุ่ม
async function sendGroupDailyReport(groupId) {
  const members = await getElderlyInGroup(groupId);
  const reports = await generateReportsForAll(members);
  
  // Flex Message with carousel
  const flexMessage = {
    type: 'flex',
    altText: 'สรุปประจำวัน',
    contents: {
      type: 'carousel',
      contents: reports.map(report => createReportBubble(report))
    }
  };
  
  await client.pushMessage(groupId, flexMessage);
}
```

### 5.3 Emergency Alert ในกลุ่ม
```javascript
async function sendGroupEmergencyAlert(groupId, patient, issue) {
  // Mention everyone
  const message = {
    type: 'text',
    text: `⚠️ ด่วน! ต้องการความช่วยเหลือ

${patient.nickname} ${issue}
- ไม่ตอบมา: ${patient.hours_no_response} ชม.
- ติดต่อล่าสุด: ${patient.last_contact}

กรุณาโทรตรวจสอบด่วน ☎️`,
    
    // เพิ่ม Quick Action
    quickReply: {
      items: [
        {
          type: 'action',
          action: {
            type: 'uri',
            label: '📞 โทรหา',
            uri: `tel:${patient.phone}`
          }
        },
        {
          type: 'action',
          action: {
            type: 'message',
            label: '✅ กำลังติดต่อ',
            text: 'กำลังติดต่อคุณแม่'
          }
        }
      ]
    }
  };
  
  await client.pushMessage(groupId, message);
}
```

---

## Step 6: Commands สำหรับกลุ่ม

### 6.1 Command List
```javascript
const GROUP_COMMANDS = {
  'ลงทะเบียน': handleRegistration,
  'เพิ่มผู้สูงอายุ': addElderly,
  'ตั้งเวลา': setReminders,
  'รายงาน': sendInstantReport,
  'สถานะ': checkStatus,
  'ช่วยเหลือ': showHelp,
  'ยกเลิกเตือน': pauseReminders
};

// Handle commands
if (text.startsWith('/') || GROUP_COMMANDS[text]) {
  const command = text.replace('/', '');
  await GROUP_COMMANDS[command](event);
}
```

### 6.2 Help Menu
```javascript
const helpMessage = `📖 คำสั่งทั้งหมด:

👤 จัดการสมาชิก:
• ลงทะเบียน - เริ่มใช้งาน
• เพิ่มผู้สูงอายุ - เพิ่มคนที่ต้องดูแล

⏰ การเตือน:
• ตั้งเวลา - ตั้งเวลาเตือนยา
• ยกเลิกเตือน - หยุดเตือนชั่วคราว

📊 รายงาน:
• รายงาน - ดูสรุปทันที
• สถานะ - เช็คว่าใครทำอะไรแล้วบ้าง

💊 บันทึกกิจกรรม:
• @ชื่อ ทานยาแล้ว
• @ชื่อ วัดความดัน 120/80
• @ชื่อ อารมณ์ดี

🆘 ฉุกเฉิน:
• ช่วยด่วน - แจ้งเตือนทุกคน
• โทรหมอ - ข้อมูลติดต่อฉุกเฉิน`;
```

---

## Step 7: Best Practices สำหรับ Group Bot

### 7.1 ลด Spam
```javascript
// รวม notification เป็นข้อความเดียว
const batchNotifications = async (notifications) => {
  if (notifications.length === 1) {
    return notifications[0];
  }
  
  return {
    type: 'text',
    text: notifications.map((n, i) => `${i+1}. ${n}`).join('\n')
  };
};
```

### 7.2 Time-based Quiet Mode
```javascript
// ไม่ส่งข้อความในช่วง 22:00 - 07:00 (ยกเว้นฉุกเฉิน)
const shouldSendMessage = (priority = 'normal') => {
  const hour = new Date().getHours();
  
  if (priority === 'emergency') return true;
  if (hour >= 22 || hour < 7) return false;
  
  return true;
};
```

### 7.3 Personalized Mention
```javascript
// ระบุชื่อเฉพาะคนที่เกี่ยวข้อง
const mentionUser = (userId, message) => {
  return {
    type: 'text',
    text: message,
    mention: {
      mentionees: [{
        index: 0,
        length: message.indexOf(' '),
        userId: userId
      }]
    }
  };
};
```

---

## Step 8: Migration Strategy (ย้ายจาก 1-1 เป็น Group)

### Option 1: เริ่มใหม่เป็น Group เลย
```
1. สร้างกลุ่ม LINE ใหม่
2. เชิญผู้สูงอายุ + ลูกหลาน + Bot
3. Setup ใหม่หมดในกลุ่ม
```

### Option 2: Hybrid Mode
```
1. บอท 1-1 กับผู้สูงอายุ (privacy)
2. Forward summary ไปกลุ่ม (transparency)
3. Alert ส่งทั้ง 2 ช่องทาง
```

### Option 3: เลือกได้
```javascript
// Let family choose during setup
const setupMode = await askPreference();

if (setupMode === 'group') {
  // Guide to create group
} else {
  // Individual chat mode
}
```

---

## Step 9: Example Implementation

### 9.1 Main Group Handler
```javascript
// src/services/line/groupHandler.js
class GroupHandler {
  async handleGroupEvent(event) {
    const { type, source, message } = event;
    
    if (type === 'join') {
      return this.handleJoinGroup(event);
    }
    
    if (type === 'message') {
      // Check if bot was mentioned
      if (this.isBotMentioned(message)) {
        return this.handleBotCommand(event);
      }
      
      // Check if it's a patient response
      if (this.isPatientResponse(message, source.userId)) {
        return this.handlePatientResponse(event);
      }
    }
    
    if (type === 'memberJoined') {
      return this.handleNewMember(event);
    }
  }
  
  async handleJoinGroup(event) {
    const groupId = event.source.groupId;
    
    // Save to database
    await Group.create({
      lineGroupId: groupId,
      joinedAt: new Date()
    });
    
    // Send welcome
    await this.sendWelcomeMessage(groupId);
  }
  
  async handlePatientResponse(event) {
    const { userId, groupId } = event.source;
    const text = event.message.text;
    
    // Identify who responded
    const member = await GroupMember.findOne({
      lineUserId: userId,
      groupId: groupId
    });
    
    if (!member) {
      return this.askToRegister(event.replyToken);
    }
    
    // Process response based on content
    if (text.includes('ทานยาแล้ว')) {
      await this.logMedication(member, event);
    } else if (text.includes('ความดัน')) {
      await this.logVitals(member, text, event);
    }
    
    // Send confirmation
    await this.confirmAction(event.replyToken, member, text);
  }
}
```

---

## Step 10: Monitoring & Analytics

### 10.1 Group Activity Dashboard
```javascript
// Track metrics per group
const groupMetrics = {
  groupId: 'Cxxxxx',
  totalMembers: 5,
  elderlyCount: 2,
  todayResponses: 4,
  complianceRate: 80,
  lastActivity: new Date()
};
```

### 10.2 Alert if Group Inactive
```javascript
// Check daily
async function checkGroupActivity() {
  const inactiveGroups = await Group.findAll({
    where: {
      lastActivity: {
        [Op.lt]: moment().subtract(3, 'days')
      }
    }
  });
  
  for (const group of inactiveGroups) {
    await sendReactivationMessage(group.lineGroupId);
  }
}
```

---

## 📊 Pros & Cons Summary

### ใช้ Bot ในกลุ่ม เมื่อ:
✅ ครอบครัวใกล้ชิด ไม่กังวลเรื่อง privacy
✅ ต้องการให้ทุกคนมีส่วนร่วม
✅ ผู้สูงอายุสับสนง่าย (ใช้แค่แอปเดียว)

### ใช้ Bot แบบ 1-1 เมื่อ:
✅ ต้องการ privacy สูง
✅ มีผู้สูงอายุหลายคน ต้องการแยกข้อมูล
✅ ไม่อยาก spam กลุ่มครอบครัว

### Hybrid Mode (แนะนำ):
✅ Bot 1-1 กับผู้สูงอายุ
✅ Daily Report ส่งในกลุ่ม
✅ Emergency Alert ส่งทั้ง 2 ช่องทาง

---

*Last Updated: 2025-01-03*
*For: Health Buddy MVP - Group Mode*