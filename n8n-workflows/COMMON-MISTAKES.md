# ⚠️ Common n8n Mistakes to Avoid

## 🔴 #1 MOST COMMON MISTAKE: Using ID instead of NAME in connections

### ❌ WRONG (This causes nodes to not connect!)
```json
"connections": {
  "schedule_trigger": {  // ← This is ID (WRONG!)
    "main": [[{
      "node": "get_patients"  // ← This is ID (WRONG!)
    }]]
  }
}
```

### ✅ CORRECT
```json
"connections": {
  "Every Day at 22:00": {  // ← Use NAME from node
    "main": [[{
      "node": "Get Active Patients"  // ← Use NAME from node
    }]]
  }
}
```

### How to identify:
- **id**: Usually lowercase with underscores (e.g., `schedule_trigger`, `get_patients`)
- **name**: Human readable with spaces/capitals (e.g., `Every Day at 22:00`, `Get Active Patients`)

---

## 🔴 #2 Airtable Node Operations

### ❌ WRONG Operations
```json
{
  "operation": "getAll",  // ❌ WRONG - No getAll in Airtable!
}
```

### ✅ CORRECT Operations
```json
{
  "resource": "record",
  "operation": "list",    // ✅ Use "list" to get multiple records
  "operation": "get",     // ✅ Use "get" for single record
  "operation": "search",  // ✅ Use "search" with filterByFormula
  "operation": "create",  // ✅ Create new record
  "operation": "update",  // ✅ Update existing record
}
```

### ❌ WRONG Format (Old)
```json
{
  "operation": "create",
  "additionalFields": {...}
}
```

### ✅ CORRECT Format (v2)
```json
{
  "resource": "record",
  "operation": "create",
  "fields": {
    "fieldValues": [...]
  }
}
```

---

## 🔴 #3 Credential Names

### ❌ WRONG
```json
"credentials": {
  "airtableApi": {...}  // Old name
}
```

### ✅ CORRECT
```json
"credentials": {
  "airtableTokenApi": {...}  // New name for token auth
}
```

---

## 📋 Quick Checklist Before Import

- [ ] All connections use **NAME** not **ID**
- [ ] Airtable nodes have `"resource": "record"`
- [ ] Airtable nodes use `fields.fieldValues` not `additionalFields`
- [ ] Credentials use correct names (`airtableTokenApi`, not `airtableApi`)
- [ ] All node names in connections match exactly (case-sensitive!)

---

## 🧪 How to Test

1. Import workflow in n8n
2. Check if all nodes are connected (lines between them)
3. If not connected, check:
   - Are you using NAME in connections?
   - Do the names match exactly?
   - Check for typos or case differences

---

*Last Updated: 2025-01-27*
*Most Common Issue: ID vs NAME in connections (happens 90% of the time!)*