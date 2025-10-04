# Airtable Database Schema

## ⚠️ IMPORTANT: READ THIS FILE EVERY SESSION
**ต้องอ่านไฟล์นี้ทุกครั้งก่อนทำงานกับ Airtable!**

## Base Information
- **Base ID**: app3u0M9H6SsZ0J6s (Updated!)
- **Base Name**: Health Buddy Duulair
- **API Docs**: https://airtable.com/app3u0M9H6SsZ0J6s/api/docs

## Tables

### 1. patient_profile
**Table ID**: `tblIJdbBY1D0l5AK7`
**Purpose**: เก็บข้อมูลผู้ป่วย

**Fields** (ใช้ Field Name หรือ Field ID ก็ได้):
| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| `patientId` | `fldgfAL5ZWDSN7T0M` | Number | ID ผู้ป่วย (positive integer) |
| `userId` | `fldYvOj0cp2aIN4lW` | Long text | LINE User ID (e.g., "U1111111111111111") |
| `patientName` | `flduJSvgLJ4iun4yG` | Text | ชื่อจริงผู้ป่วย |
| `displayName` | `fldOceXJ6pBSH1OLl` | Text | ชื่อเล่น/ชื่อที่ใช้เรียก |
| `gender` | `fldL6njkAHmEekCSK` | Single select | เพศ ["female", "male"] |
| `dateOfBirth` | `fldxxSAcdOPVrQ1s6` | Date | วันเกิด (ISO 8601 format) |
| `chronicDiseases` | `fldmZoL3Wdk70Fxv8` | Multiple select | โรคประจำตัว ["เบาหวาน", "ความดัน", "โรคหัวใจ"] |
| `medications` | `fld5U0rNgTR3Mcrdw` | Long text | ยาที่ทาน (JSON array format) |
| `allergies` | `fldjHPq21ePdExQ7H` | Long text | ประวัติแพ้ |
| `doctorName` | `fld6nlqjrkXrAeJtI` | Long text | ชื่อแพทย์ประจำตัว |
| `hospital` | `fldK0BIdm6lg4lrrw` | Long text | โรงพยาบาลที่รักษา |
| `nextAppointment` | `fld721UlrKcRbOocX` | Date | นัดครั้งถัดไป (ISO 8601 format) |
| `preferredActivities` | `fld74NRaF6WAl0Xda` | Multiple select | กิจกรรมที่ชอบ ["เดิน", "ร้องเพลง", "รดน้ำต้นไม้", "อ่านหนังสือ", "เดินเบาๆ"] |
| `exerciseLevel` | `fldstNSeqqu0HmZgD` | Long text | ระดับการออกกำลัง ("low", "medium", "high") |
| `caregivers` | `fld1iFRDYXPh4kzVX` | Long text | ผู้ดูแล (JSON array format) |
| `connectionCode` | `fldTfKyNaLahHlerK` | Long text | รหัสเชื่อมต่อ (e.g., "MT4921") |
| `groupId` | `fldjwWUSWBWlfkiEV` | Long text | LINE Group ID |
| `personaKey` | `fldKPtKlFLegKZedQ` | Long text | AI persona ("female_basic", "male_basic") |
| `tonePreference` | `fld30Fo2ZL2EuXejd` | Single select | น้ำเสียง ["formal"] |
| `noReplyHours` | `fldoxbwBqU5VEr7wN` | Number | ชั่วโมงที่ไม่ตอบถือว่าผิดปกติ |
| `alertPreference` | `fldomAm3IFfgOUegj` | Long text | การแจ้งเตือน ("primaryOnly", "allFamily") |
| `active` | `fldyik3dWRYvkwo92` | Checkbox | สถานะ active (boolean) |
| `conversation_log` | `fldqAB7BX5RpbhZYv` | Link to another record | เชื่อมกับ conversation_log table |

**Example medications format**:
```json
[
  {"drug":"Amlodipine","time":"08:00"},
  {"drug":"Metformin","time":"19:00"}
]
```

**Example caregivers format**:
```json
[
  {"role":"primary","name":"ลูกเอ","lineId":"U2222222222222222"},
  {"role":"secondary","name":"หลานบี","lineId":"U3333333333333333"}
]
```

### 2. persona_library
**Table ID**: `tblobt43DqolfUrIr`
**Purpose**: เก็บ AI personas สำหรับบอท

**Fields** (ใช้ Field Name หรือ Field ID ก็ได้):
| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| `personaKey` | `fld0N74gs8ysxstGo` | Long text | รหัส persona (e.g., "female_basic", "male_basic") |
| `displayName` | `fldm7CEUpZKwubfwS` | Long text | ชื่อที่แสดง (e.g., "พยาบาลหญิง") |
| `pronoun` | `fld90TwggbQBjLmrv` | Long text | คำลงท้าย ("ค่ะ", "ครับ", "จ้า") |
| `styleGuide` | `fldNWBiM2OOvKqPVa` | Long text | แนวทางการตอบ |
| `examplePhrases` | `fld6MRRlDpTHBhcCg` | Long text | ตัวอย่างประโยค |
| `elder_profile` | `fldZtcPaZkxGh88Nj` | Text | ID โปรไฟล์ผู้สูงอายุ |

**Persona Options**:
- `female_basic` - พยาบาลหญิง
- `male_basic` - พยาบาลชาย
- `doctor_kind` - คุณหมอใจดี
- `coach_strict` - โค้ชเข้มงวด
- `friend_chill` - เพื่อนซี้สายชิล

### 3. activity_log
**Table ID**: `tblpIFnGmNyVHHMER`
**Purpose**: บันทึกกิจกรรมประจำวัน

**Fields** (ใช้ Field Name หรือ Field ID ก็ได้):
| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| `logId` | `fldPrUR1ghp9EqWjQ` | Number | ID ของ log |
| `patientId` | `fldBEStpwfc2zPDor` | Number | ID ผู้ป่วย |
| `patientName` | `fldrZ660f3RI5qR5a` | Single select | ชื่อผู้ป่วย ["สมศรี", "ประสิทธิ์"] |
| `taskType` | `fldB17ftH7hHfWPIj` | Single select | ประเภท ["medication", "water", "walk", "vitals", "alert"] |
| `value` | `fldmOeMoOgSbAr3K4` | Long text | ค่าที่บันทึก |
| `timestamp` | `fldVMc6RsF6i3bLpG` | Date and time | เวลาที่บันทึก (ISO 8601) |
| `source` | `fldgZN36PNNaOAtkU` | Single select | แหล่งข้อมูล ["text", "button", "image", "system"] |
| `note` | `fldKcCg4XCzroAvEb` | Long text | หมายเหตุ |

### 4. daily_report
**Table ID**: `tbltk2woaegZGCpK2`
**Purpose**: เก็บรายงานประจำวัน

**Fields** (ใช้ Field Name หรือ Field ID ก็ได้):
| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| `reportId` | `fldBKHg81MfqLTFAH` | Number | ID ของรายงาน |
| `patientId` | `fldken0Ld9RulU6Kd` | Number | ID ผู้ป่วย |
| `patientName` | `fld1yIPZqYJcbck64` | Single select | ชื่อผู้ป่วย ["สมศรี", "ประสิทธิ์"] |
| `date` | `fldx0SPMqAT5XOVGQ` | Date | วันที่ของรายงาน (ISO 8601) |
| `completionRate` | `fldC5F9bCEnSuFJ9L` | Number | % ความสำเร็จ |
| `medal` | `fldHmFofxS1Bsb0a0` | Long text | เหรียญรางวัล ("🥇 ทอง", "🥈 เงิน", "🥉 ทองแดง") |
| `tasksCompleted` | `fldfXGofqe1l13i2T` | Number | จำนวนงานที่ทำสำเร็จ |
| `tasksTotal` | `fldTuEfxo2Wd8fDtl` | Number | จำนวนงานทั้งหมด |
| `alerts` | `fldZY9ks1s5uxx8ys` | Long text | การแจ้งเตือนพิเศษ |
| `notes` | `fldm2gsudFYzciwyK` | Long text | หมายเหตุ |

### 5. conversation_log
**Table ID**: `tblpQeph1tVbhyhbW`
**Purpose**: เก็บประวัติการสนทนา

**Fields** (ใช้ Field Name หรือ Field ID ก็ได้):
| Field Name | Field ID | Type | Description |
|------------|----------|------|-------------|
| `conversationId` | `fldG7xZwY2dRp3hZD` | Auto Number | ID อัตโนมัติ |
| `patientId` | `fldBL8Mss09antLl2` | Link to another record | เชื่อมกับ patient_profile table |
| `senderRole` | `fldLdwTBBJeUyavB0` | Single select | บทบาท ["patient", "caregiver", "bot"] |
| `senderName` | `fldgexEONCfthmMuI` | Text | ชื่อผู้ส่ง |
| `messageType` | `fld3lJJ6sD2yCJAYR` | Single select | ประเภท ["text", "image", "sticker", "button", "audio", "video", "location"] |
| `messageContent` | `fldNLc7ijmqizpnVh` | Long text | เนื้อหาข้อความ |
| `aiProcessed` | `fldgNPKpnLDaruzLu` | Long text | ผลการประมวลผลด้วย AI |
| `timestamp` | `fldywrSoet7NzLelp` | Date and time | เวลาที่ส่ง (ISO 8601) |
| `note` | `fldlHKOEZ6f9H4Y0s` | Long text (rich text) | หมายเหตุ (รองรับ Markdown) |

## Table Summary
- **5 Tables ทั้งหมด**:
  1. `patient_profile` (tblIJdbBY1D0l5AK7) - ข้อมูลผู้ป่วย
  2. `persona_library` (tblobt43DqolfUrIr) - AI personas
  3. `activity_log` (tblpIFnGmNyVHHMER) - บันทึกกิจกรรม
  4. `daily_report` (tbltk2woaegZGCpK2) - รายงานประจำวัน
  5. `conversation_log` (tblpQeph1tVbhyhbW) - ประวัติสนทนา

## Notes
- ทุก table มี Created time และ Last modified time อัตโนมัติ
- Record IDs จะเป็น format: recXXXXXXXXXXXXXX
- ใช้ filterByFormula สำหรับ search
- ใช้ Link records สำหรับ relationship

## n8n Airtable Node Operations (Updated 2025-01-27)
**⚠️ Based on actual n8n UI, not outdated docs:**

### Base Actions:
- `getMany` - Get many bases
- `getSchema` - Get base schema

### Record Actions:
- `create` - Create a record
- `upsert` - Create or update a record (update if exists, create if not)
- `delete` - Delete a record
- `get` - Get a single record by ID
- `search` - Search records using filterByFormula
- `update` - Update an existing record

### Example n8n Node Configurations:

#### Create Record:
```json
{
  "resource": "record",
  "operation": "create",
  "base": {"__rl": true, "mode": "id", "value": "app3u0M9H6SsZ0J6s"},
  "table": {"__rl": true, "mode": "id", "value": "tblIJdbBY1D0l5AK7"}
}
```

#### Search Records:
```json
{
  "resource": "record",
  "operation": "search",
  "base": {"__rl": true, "mode": "id", "value": "app3u0M9H6SsZ0J6s"},
  "table": {"__rl": true, "mode": "id", "value": "tblIJdbBY1D0l5AK7"},
  "filterByFormula": "connectionCode = 'MT4921'"
}
```

## Common Formulas
```javascript
// Find by connection code
filterByFormula: "connectionCode = 'XXXX-9999'"
// หรือใช้ field ID
filterByFormula: "{fldTfKyNaLahHlerK} = 'XXXX-9999'"

// Find by groupId or caregiver  
filterByFormula: "OR(groupId = 'Cxxxxx', FIND('Uxxxxx', caregivers) > 0)"
// หรือใช้ field IDs
filterByFormula: "OR({fldjwWUSWBWlfkiEV} = 'Cxxxxx', FIND('Uxxxxx', {fld1iFRDYXPh4kzVX}) > 0)"

// Find today's activities
filterByFormula: "IS_SAME({timestamp}, TODAY(), 'day')"

// Find overdue alerts (18 hour rule)
filterByFormula: "DATETIME_DIFF(NOW(), {timestamp}, 'hours') > 18"

// Find patient by ID
filterByFormula: "patientId = 1"
// หรือใช้ field ID
filterByFormula: "{fldgfAL5ZWDSN7T0M} = 1"
```

## ⚠️ IMPORTANT NOTES
1. **Field Types ที่ต้องระวัง**:
   - `medications` และ `caregivers` เก็บเป็น JSON string ใน Long text
   - `patientId` ใน patient_profile เป็น Number (ไม่ใช่ auto record ID)
   - `conversationId` เป็น Auto Number
   - `patientId` ใน conversation_log เป็น Link to another record

2. **Single Select vs Multiple Select**:
   - `gender`, `tonePreference` = Single select
   - `chronicDiseases`, `preferredActivities` = Multiple select

3. **Typecast Parameter**:
   - ใช้ `typecast: true` เมื่อต้องการให้สร้าง choice ใหม่อัตโนมัติ
   - ถ้าไม่ใช้จะ error INVALID_MULTIPLE_CHOICE_OPTIONS

---
*อัปเดตข้อมูลจาก Airtable API docs เมื่อ 2025-09-27*
*ต้องอ่านไฟล์นี้ทุกครั้งก่อนทำงานกับ Airtable!*