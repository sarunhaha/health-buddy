# 🔌 Integration Guide - MVP to Duulair System

## 📦 Current Setup (MVP)
```
Vercel Webhook → n8n Cloud → Supabase
                     ↓
                LINE Reply
```

## 🆕 New Setup (Duulair with Airtable)
```
Option A: Parallel Testing
Vercel → n8n → Both Supabase + Airtable

Option B: Full Migration  
Vercel → n8n → Airtable Only
```

---

## 🚀 Quick Integration Steps

### Step 1: Import Workflows to n8n
1. Login to https://poppsiwaj.app.n8n.cloud
2. Import these workflows:
   - `1-main-webhook.json` - Main handler
   - `2-onboarding-registration.json` - Registration
   - `3-daily-report-generator.json` - Reports
   - `4-alert-monitor.json` - Alerts
   - `5-medication-reminder.json` - Reminders

### Step 2: Configure Credentials
```javascript
// 1. Airtable API
Name: "Airtable API"
Type: API Token
Token: [Your Airtable Personal Access Token]

// 2. LINE API (reuse existing)
Name: "LINE API"
Type: Header Auth
Header: Authorization
Value: Bearer [Your LINE Channel Access Token]
```

### Step 3: Update Webhook URL
```javascript
// In Vercel environment variables
N8N_WEBHOOK_URL=https://poppsiwaj.app.n8n.cloud/webhook/[workflow-1-path]
```

---

## 🔄 Migration Strategies

### Strategy A: Parallel Testing (Recommended)
Keep MVP running while testing new workflows:

```javascript
// Modify Vercel webhook to forward to both
export default async function handler(req, res) {
  // Forward to MVP workflow
  await fetch(process.env.N8N_MVP_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  });
  
  // Forward to new Airtable workflow
  await fetch(process.env.N8N_AIRTABLE_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  });
  
  return res.status(200).json({ status: 'ok' });
}
```

### Strategy B: Gradual Migration
Migrate one feature at a time:

1. **Phase 1**: Test registration only
   - Keep MVP for chat/logging
   - Use workflow 2 for new registrations

2. **Phase 2**: Add daily reports
   - Activate workflow 3
   - Compare with MVP reports

3. **Phase 3**: Full migration
   - Switch all traffic to new workflows
   - Deactivate MVP workflows

---

## 🧪 Testing with Existing LINE Bot

### 1. Create Test Commands
Add special commands for testing:

```javascript
// In workflow 1 - main webhook
if (text.startsWith('#test')) {
  // Route to test handlers
  if (text === '#test register') {
    // Trigger registration flow
  } else if (text === '#test report') {
    // Generate test report
  } else if (text === '#test alert') {
    // Trigger test alert
  }
}
```

### 2. Test Data Sync
Sync existing Supabase data to Airtable:

```sql
-- Export from Supabase
SELECT user_id, display_name, medical_conditions, medications
FROM users
WHERE active = true;

-- Import to Airtable patient_profile
```

### 3. Dual Logging
Log to both databases during transition:

```javascript
// In n8n Code node
// Log to Supabase
await supabase.from('medication_logs').insert({...});

// Also log to Airtable
await airtable.create('activity_log', {...});
```

---

## 🎯 Test Scenarios for MVP Integration

### Scenario 1: New User Journey
```
1. User adds LINE OA
2. Send "สวัสดี"
3. Bot responds with onboarding
4. User provides info
5. Check both databases have data
```

### Scenario 2: Existing User Migration
```
1. Export user from Supabase
2. Import to Airtable
3. Test with same LINE ID
4. Verify continuity
```

### Scenario 3: Feature Comparison
```
MVP Feature → Duulair Feature
- medication_logs → activity_log (type: medication)
- vitals_logs → activity_log (type: vitals)
- daily summaries → daily_report
- alerts → activity_log (type: alert)
```

---

## 📊 Monitoring During Migration

### Key Metrics to Track
- Response time (MVP vs New)
- Error rates
- User engagement
- Data consistency

### Logging Points
```javascript
// Add logging at key points
console.log('[MIGRATION] User:', userId);
console.log('[MIGRATION] Feature:', feature);
console.log('[MIGRATION] Database:', database);
console.log('[MIGRATION] Result:', result);
```

---

## 🔧 Rollback Plan

If issues arise:
1. Update Vercel webhook URL back to MVP
2. Deactivate new workflows
3. Investigate issues in test environment
4. Fix and retry

```bash
# Quick rollback
vercel env pull
# Edit N8N_WEBHOOK_URL back to MVP
vercel env push
vercel --prod
```

---

## ✅ Migration Checklist

### Pre-Migration
- [ ] Backup Supabase data
- [ ] Setup Airtable tables
- [ ] Import all workflows
- [ ] Configure credentials
- [ ] Create test data

### During Migration
- [ ] Monitor error logs
- [ ] Track user feedback
- [ ] Compare outputs
- [ ] Verify data consistency

### Post-Migration
- [ ] Deactivate old workflows
- [ ] Clean up test data
- [ ] Update documentation
- [ ] Archive MVP code

---

## 🆘 Troubleshooting

### Issue: Duplicate Messages
**Cause**: Both systems responding
**Fix**: Add deduplication logic or disable one

### Issue: Missing Data
**Cause**: Field mapping mismatch
**Fix**: Check field names in AIRTABLE-SCHEMA.md

### Issue: Slow Response
**Cause**: Double processing
**Fix**: Use async/parallel processing

### Issue: Wrong Persona
**Cause**: personaKey not found
**Fix**: Ensure persona_library has all keys

---

## 📝 Notes
- Keep MVP running until fully tested
- Test with small user group first
- Document all customizations
- Monitor for 24-48 hours after migration

---

*Last Updated: 2025-01-27*