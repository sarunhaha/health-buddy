# 📚 n8n Workflow Import Guide

## 1. Import Workflow to n8n Cloud

1. เข้าไปที่ https://poppsiwaj.app.n8n.cloud
2. คลิก **Workflows** ในเมนูด้านซ้าย
3. คลิกปุ่ม **Add workflow** > **Import from file**
4. เลือกไฟล์ `health-buddy-complete-mvp.json`
5. คลิก **Import**

## 2. Configure Credentials

### 2.1 LINE API Credential
1. ในหน้า workflow คลิก node **LINE Webhook** 
2. คลิก **Credentials** > **Create New**
3. เลือก **Header Auth**
4. ตั้งชื่อ: `LINE API`
5. กรอกข้อมูล:
   - Name: `Authorization`
   - Value: `Bearer k8+TUzC2tKBcKkVUSvQXqXHYtWQg9lBRtbNy4HnvjJ9N0kDo5DIdUeCRgq0s7n4BYe2vR3hgmuCOy+LUROyW9NJP6E3xB5eMU8jqKYB2wWQmQBCNhx3l2dXg1s0z5MXMokHlBhPRgz1xIDZa8Xg5HAdB04t89/1O/w1cDnyilFU=`
6. คลิก **Save**

### 2.2 OpenAI API Credential
1. คลิก node **AI Chat (พลอย)** หรือ **Analyze BP Image**
2. คลิก **Credentials** > **Create New**
3. เลือก **OpenAI API**
4. ตั้งชื่อ: `OpenAI`
5. กรอก API Key ของคุณ
6. คลิก **Save**

### 2.3 Supabase Credential (Optional - ถ้าใช้)
1. คลิก node ที่เชื่อมต่อ Supabase
2. คลิก **Credentials** > **Create New**
3. เลือก **Header Auth**
4. ตั้งชื่อ: `Supabase`
5. กรอกข้อมูล:
   - Name: `apikey`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeGtsbnp4ZnJ1cHd3a3dsd3d3YyIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MzM0MDI5NjksImV4cCI6MjA0ODk3ODk2OX0.Dhu9iJznp3XD_JnMPf7C2J5s5RnQg8nELdwQDEQPhJ0`
6. คลิก **Save**

## 3. Configure Webhook URL

1. ในหน้า workflow คลิกที่ **LINE Webhook** node
2. Copy URL ที่แสดงอยู่ (จะเป็นแบบ `https://poppsiwaj.app.n8n.cloud/webhook/xxx`)
3. เอา URL นี้ไปใส่ใน Vercel environment variable:
   - ไปที่ Vercel Dashboard > Settings > Environment Variables
   - เพิ่ม `N8N_WEBHOOK_URL` = `<URL ที่ copy มา>`
   - Redeploy

## 4. Activate Workflow

1. คลิกปุ่ม **Inactive** ด้านบนขวาเพื่อเปลี่ยนเป็น **Active**
2. Workflow พร้อมใช้งาน!

## 5. Test Workflow

### Test 1: ทดสอบการทานยา
ส่งข้อความใน LINE: "ทานยาแล้วค่ะ"
- ควรได้รับข้อความตอบกลับพร้อม Quick Reply

### Test 2: ทดสอบบันทึกความดัน
ส่งข้อความ: "ความดัน 120/80"
- ควรได้การประเมินและบันทึก

### Test 3: ทดสอบ AI Chat
ส่งข้อความทั่วไป: "สวัสดีค่ะ"
- พลอยควรตอบกลับ

### Test 4: ทดสอบวิเคราะห์รูป
ส่งรูปหน้าจอเครื่องวัดความดัน
- ควรได้การวิเคราะห์ค่าและคำแนะนำ

## 6. Monitor & Debug

1. ดู Executions ในหน้า workflow
2. คลิกที่ execution เพื่อดูรายละเอียด
3. ดู error logs ถ้ามีปัญหา

## 7. Optional: Schedule Daily Report

สำหรับรายงานประจำวัน 22:00:
1. เพิ่ม **Schedule Trigger** node
2. ตั้งเวลา 22:00 ทุกวัน
3. เชื่อมต่อกับ Daily Report Handler

## ⚠️ Important Notes

- ตรวจสอบให้แน่ใจว่า webhook URL ใน Vercel ชี้มาที่ n8n แทนที่จะประมวลผลเอง
- Credentials ทั้งหมดต้องตั้งค่าให้ถูกต้องก่อน activate
- ดู execution logs เป็นประจำเพื่อ monitor ระบบ