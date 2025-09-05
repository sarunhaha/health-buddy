# 📱 LINE Official Account Setup Guide

## Step 1: สร้าง LINE Official Account

### 1.1 สมัคร LINE OA
1. ไปที่ https://www.linebiz.com/th/
2. คลิก "สร้างบัญชี" 
3. เลือก "LINE Official Account"
4. Login ด้วย LINE account ส่วนตัว

### 1.2 ตั้งค่าพื้นฐาน
```
Account Name: Health Buddy (หรือชื่อที่ต้องการ)
Category: Medical/Healthcare
Description: ผู้ช่วยดูแลสุขภาพผู้สูงอายุ
```

### 1.3 เลือก Plan
- เริ่มต้นใช้ **Free Plan** (ส่งได้ 500 ข้อความ/เดือน)
- MVP เพียงพอสำหรับทดสอบ 10-20 users

---

## Step 2: Enable Messaging API

### 2.1 เข้า LINE Developers Console
1. ไปที่ https://developers.line.biz/console/
2. Login ด้วย account เดียวกับ LINE OA
3. คลิก "Create a new provider"
4. ตั้งชื่อ Provider (เช่น "HealthBuddy")

### 2.2 Create Messaging API Channel
```
Channel type: Messaging API
Provider: เลือก provider ที่สร้าง
Channel name: HealthBuddy Bot
Channel description: Health monitoring bot for elderly
Category: Medical
Subcategory: Hospital/Clinic
```

### 2.3 Link กับ LINE OA
1. ไปที่ tab "Messaging API"
2. คลิก "Link" ภายใต้ LINE Official Account
3. เลือก OA ที่สร้างในขั้นตอนที่ 1

---

## Step 3: Get Credentials

### 3.1 Channel Secret
```
Location: Basic settings tab
Copy: Channel secret
Save to: .env as LINE_CHANNEL_SECRET
```

### 3.2 Channel Access Token
```
Location: Messaging API tab
Click: Issue ปุ่ม "Issue" 
Expiration: 0 (ไม่หมดอายุ)
Copy: Long-lived token
Save to: .env as LINE_CHANNEL_ACCESS_TOKEN
```

### 3.3 Webhook URL
```
Format: https://your-domain.com/webhook
หรือใช้ ngrok สำหรับ local dev:
ngrok http 3000
→ https://abc123.ngrok.io/webhook
```

### 3.4 Enable Webhook
1. ใส่ Webhook URL
2. Toggle "Use webhook" เป็น ON
3. คลิก "Verify" เพื่อทดสอบ
4. Disable "Auto-reply messages"
5. Disable "Greeting messages" (จะใช้ custom)

---

## Step 4: Setup LIFF (LINE Frontend Framework)

### 4.1 Create LIFF App
```
Tab: LIFF
Click: Add
LIFF app name: Health Buddy Dashboard
Size: Full (100%)
Endpoint URL: https://your-domain.com/liff
หรือ local: https://abc123.ngrok.io/liff
Scope: ✓ profile, ✓ openid
```

### 4.2 Get LIFF ID
```
Copy: LIFF ID (liff-xxxxx)
Save to: .env as LIFF_ID
```

---

## Step 5: Configure Rich Menu (Optional แต่ดี)

### 5.1 สร้าง Rich Menu
ใช้ LINE Official Account Manager:
1. ไปที่ https://manager.line.biz/
2. เลือก Home > Rich menus
3. Create new rich menu

### 5.2 Design Layout (2x2 grid แนะนำ)
```
┌─────────┬─────────┐
│  💊     │  📊     │
│ กินยา   │ ดูกราฟ  │
├─────────┼─────────┤
│  🩺     │  📞     │
│ วัดความดัน│ ติดต่อ  │
└─────────┴─────────┘
```

### 5.3 Set Actions
- กินยา → Text message: "ทานยาแล้ว"
- ดูกราฟ → Open LIFF URL
- วัดความดัน → Text message: "วัดความดัน"
- ติดต่อ → Text message: "ขอความช่วยเหลือ"

---

## Step 6: Test Setup

### 6.1 Add Bot as Friend
1. Scan QR Code จาก Messaging API tab
2. หรือค้นหา @healthbuddy (ถ้าตั้ง ID)

### 6.2 Test Webhook
```bash
# Start server
npm run dev

# Test webhook endpoint
curl -X POST http://localhost:3000/api/health
```

### 6.3 Send Test Message
```javascript
// test-line.js
const { Client } = require('@line/bot-sdk');

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
});

// Get your user ID first by sending any message to bot
// It will appear in webhook logs

const userId = 'U1234567890abcdef'; // Your LINE user ID

client.pushMessage(userId, {
  type: 'text',
  text: 'ทดสอบ: ถึงเวลาทานยาแล้วค่ะ 💊'
})
.then(() => console.log('Message sent!'))
.catch((err) => console.error(err));
```

---

## Step 7: Environment Variables

### Update .env file:
```bash
# LINE Configuration
LINE_CHANNEL_ACCESS_TOKEN=your_actual_token_here
LINE_CHANNEL_SECRET=your_actual_secret_here
LIFF_ID=your_liff_id_here

# Webhook (for local dev with ngrok)
BASE_URL=https://abc123.ngrok.io
```

---

## Step 8: Quick Reply Setup

### 8.1 Basic Quick Reply Template
```javascript
const quickReply = {
  items: [
    {
      type: 'action',
      action: {
        type: 'message',
        label: '✅ ทานแล้ว',
        text: 'ทานยาแล้ว'
      }
    },
    {
      type: 'action',
      action: {
        type: 'message',
        label: '⏰ ไว้ก่อน',
        text: 'ขอเลื่อนไปทานทีหลัง'
      }
    },
    {
      type: 'action',
      action: {
        type: 'camera',
        label: '📷 ถ่ายรูป'
      }
    }
  ]
};
```

---

## Step 9: Flex Message Template (Daily Report)

### 9.1 Simple Report Card
```javascript
const flexMessage = {
  type: 'flex',
  altText: 'รายงานประจำวัน',
  contents: {
    type: 'bubble',
    header: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: '📊 รายงานประจำวัน',
          weight: 'bold',
          size: 'lg'
        },
        {
          type: 'text',
          text: new Date().toLocaleDateString('th-TH'),
          size: 'sm',
          color: '#999999'
        }
      ]
    },
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: 'ยา:',
              weight: 'bold',
              flex: 1
            },
            {
              type: 'text',
              text: '✅ ครบ 2/2 มื้อ',
              flex: 3
            }
          ]
        },
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: 'ความดัน:',
              weight: 'bold',
              flex: 1
            },
            {
              type: 'text',
              text: '120/80 (ปกติ)',
              flex: 3
            }
          ]
        },
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: 'อารมณ์:',
              weight: 'bold',
              flex: 1
            },
            {
              type: 'text',
              text: '😊 ดี',
              flex: 3
            }
          ]
        }
      ]
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: '💡 แนะนำ: คุณแม่ทานยาครบ เยี่ยมมาก!',
          wrap: true,
          size: 'sm',
          color: '#666666'
        }
      ]
    }
  }
};
```

---

## Step 10: Common Issues & Solutions

### Issue 1: Webhook ไม่ทำงาน
```bash
# Check webhook URL
curl -X POST https://your-webhook-url/webhook \
  -H 'Content-Type: application/json' \
  -d '{"events":[]}'
```

### Issue 2: Signature validation failed
```javascript
// ตรวจสอบ middleware
app.use('/webhook', 
  middleware(lineConfig), // ต้องมา ก่อน body parser
  webhookRouter
);
```

### Issue 3: Push message ไม่ได้
- ตรวจสอบว่า user add bot เป็นเพื่อนแล้ว
- ตรวจสอบ token expiration
- ดู rate limit (Free plan = 500/month)

### Issue 4: LIFF ไม่เปิด
- ตรวจสอบ HTTPS (required)
- Set correct LIFF size
- Check endpoint URL

---

## 🎯 Next Steps After Setup

1. **Test Basic Flow**
   - Send message → Receive webhook
   - Reply with Quick Reply
   - Test image upload

2. **Implement MVP Features**
   - Morning reminder (08:00)
   - Medication logging
   - Daily report (22:00)

3. **Add Users**
   - Create onboarding message
   - Setup user in database
   - Link with caregivers

---

## 📚 Useful Resources

- [LINE Developers Docs](https://developers.line.biz/en/docs/)
- [Messaging API Reference](https://developers.line.biz/en/reference/messaging-api/)
- [Flex Message Simulator](https://developers.line.biz/flex-simulator/)
- [LIFF Documentation](https://developers.line.biz/en/docs/liff/)
- [Rich Menu Manager](https://manager.line.biz/)

---

## 🔐 Security Notes

1. **Never commit credentials**
   - Use .env file
   - Add .env to .gitignore

2. **Validate signatures**
   - Always use LINE SDK middleware
   - Verify webhook source

3. **Rate limiting**
   - Implement per-user limits
   - Cache responses

4. **Data privacy**
   - Encrypt health data
   - Follow PDPA guidelines

---

*Created: 2025-01-03*
*For: Health Buddy MVP*