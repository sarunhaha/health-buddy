# 📚 Supabase + n8n Integration Setup Guide

## 1️⃣ Setup Supabase Credential in n8n

### Step 1: เข้า n8n cloud
1. ไปที่ https://poppsiwaj.app.n8n.cloud
2. Login เข้าสู่ระบบ

### Step 2: สร้าง Supabase Credential
1. คลิก **Credentials** ที่ sidebar ซ้าย
2. คลิก **Add credential** 
3. เลือก **Supabase**
4. ใส่ข้อมูล:
   ```
   Credential Name: Supabase Health Buddy
   Host: https://mqxklnzxfrupwwkwlwwc.supabase.co
   Service Role API Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeGtsbnp4ZnJ1cHd3a3dsd3djIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzA2NzEyNiwiZXhwIjoyMDcyNjQzMTI2fQ.mA9TZvpaCE3i_DEuy-G2kBj32HuQHjkjOjSgYzUe0MY
   ```
5. คลิก **Test connection** เพื่อทดสอบ
6. คลิก **Save** เพื่อบันทึก

## 2️⃣ Import Workflow

### Step 1: Import JSON
1. ใน n8n คลิก **Workflows** ที่ sidebar
2. คลิก **Import from File** หรือ **Import from URL**
3. เลือกไฟล์ `health-buddy-supabase-complete.json`
4. คลิก **Import**

### Step 2: Update Credentials ในแต่ละ node
1. เปิด workflow ที่ import เข้ามา
2. คลิกที่ Supabase nodes ทุกตัว:
   - **Get User** node
   - **Create User** node  
   - **Log Message** node
   - **Log Medication** node
   - **Log Vitals** node
   - **Get Summary** node
3. ในแต่ละ node:
   - คลิกที่ **Credential to connect with**
   - เลือก **Supabase Health Buddy** ที่สร้างไว้
   - คลิก **Save**

### Step 3: Update LINE Credential
1. คลิกที่ **LINE Reply** node
2. ตรวจสอบว่ามี LINE API credential แล้ว
3. ถ้ายังไม่มี ให้สร้างใหม่:
   ```
   Name: LINE Health Buddy
   Type: Header Auth
   Name: Authorization
   Value: Bearer k8+TUz8Zqy+6SNAcdz0CapXM29WKGkeo66239hWYnpufhnDMyxrkCjHFPuKmqfOQSUvWKhQZF2ezKBigi4j2VdKyh5egssSzwOw25bfkr2qeOToX0TnBrox1RU28IZwOE1SqbBoTDUU5dhWmbwM6DQdB04t89/1O/w1cDnyilFU=
   ```

## 3️⃣ Test Workflow

### Step 1: Activate Workflow
1. คลิกปุ่ม **Inactive** ที่มุมบนขวา เพื่อเปลี่ยนเป็น **Active**
2. Save workflow

### Step 2: Copy Webhook URL
1. คลิกที่ **LINE Webhook** node (node แรก)
2. Copy URL ที่แสดง (เช่น `https://poppsiwaj.app.n8n.cloud/webhook/xxx`)

### Step 3: Update Vercel Environment
1. ไปที่ Vercel Dashboard: https://vercel.com
2. เลือก project **health-buddy**
3. ไปที่ **Settings** → **Environment Variables**
4. Update `N8N_WEBHOOK_URL` ด้วย URL ที่ copy มา
5. คลิก **Save**
6. ไปที่ **Deployments** → คลิก **Redeploy** ที่ deployment ล่าสุด

## 4️⃣ Test Features

### Test 1: User Creation
ส่งข้อความใน LINE:
```
สวัสดีครับ
```
Expected: Bot ตอบกลับและสร้าง user ใน Supabase

### Test 2: Medication Logging
```
ทานยาแล้ว
```
Expected: บันทึกใน medication_logs table

### Test 3: Vitals Logging
```
ความดัน 120/80
```
Expected: บันทึกใน vitals_logs table

### Test 4: View Data in Supabase
1. ไปที่ https://supabase.com/dashboard
2. เลือก project **health-buddy**
3. ไปที่ **Table Editor**
4. ตรวจสอบข้อมูลใน:
   - `users` table
   - `conversation_logs` table
   - `medication_logs` table
   - `vitals_logs` table

## 5️⃣ Troubleshooting

### ถ้า workflow error
1. Check Execution History ใน n8n
2. ดู error message ในแต่ละ node
3. ตรวจสอบ:
   - Credential configuration ถูกต้อง?
   - Table names ตรงกับ database?
   - Data format ถูกต้อง?

### ถ้าไม่มีข้อมูลใน Supabase
1. Check RLS policies:
   ```sql
   -- ใน Supabase SQL Editor
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Service role has full access" ON users
     FOR ALL USING (auth.jwt()->>'role' = 'service_role');
   ```
2. ทำเหมือนกันกับทุก table

### ถ้า LINE ไม่ตอบกลับ
1. Check LINE Webhook node ใน n8n ว่า Active
2. Check Vercel logs ที่ Function logs
3. Check n8n Execution history

## 📌 Important Notes

1. **Service Key**: ใช้ service_role key เพื่อข้ามการตรวจสอบ RLS
2. **Webhook URL**: ต้อง update ใน Vercel ทุกครั้งที่ import workflow ใหม่
3. **Test Step by Step**: ทดสอบทีละ feature เพื่อหา bug ได้ง่าย
4. **Check Logs**: ดู execution history ใน n8n เพื่อ debug

## ✅ Checklist

- [ ] สร้าง Supabase credential ใน n8n
- [ ] Import workflow `health-buddy-supabase-complete.json`
- [ ] Update credentials ในทุก Supabase node
- [ ] Update LINE credential
- [ ] Activate workflow
- [ ] Copy webhook URL
- [ ] Update N8N_WEBHOOK_URL ใน Vercel
- [ ] Redeploy Vercel
- [ ] Test user creation
- [ ] Test medication logging
- [ ] Test vitals logging
- [ ] Check data in Supabase

---
*Last Updated: 2025-01-09*