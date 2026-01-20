# Attendance Service - Quick Reference Guide

## Status Handling Summary

### When Creating Attendance with Status = "leave"

**Request:**
```json
{
  "employeeId": "emp_123",
  "organizationId": "org_456",
  "date": "2026-01-20",
  "status": "leave",
  "leaveType": "sick"
}
```

**What Happens (Automatic Processing):**
✅ `checkInTime` → null (automatically cleared)  
✅ `checkOutTime` → null (automatically cleared)  
✅ `workHours` → 0 (automatically set)  
✅ `overtime` → 0 (automatically set)  

**Response:**
```json
{
  "_id": "att_123",
  "employeeId": "emp_123",
  "organizationId": "org_456",
  "date": "2026-01-20",
  "status": "leave",
  "leaveType": "sick",
  "checkInTime": null,
  "checkOutTime": null,
  "workHours": 0,
  "overtime": 0,
  "isApproved": false,
  "createdAt": "2026-01-19T10:00:00Z"
}
```

---

## All Status Types Processing

### 1. LEAVE
```
Input:  { status: "leave", leaveType: "sick" }
Output: checkInTime=null, checkOutTime=null, workHours=0, overtime=0
Uses:   Sick leave, casual leave, earned leave, maternity, unpaid leave
```

### 2. ABSENT
```
Input:  { status: "absent" }
Output: checkInTime=null, checkOutTime=null, workHours=0, overtime=0
Uses:   Employee not present without approved leave
```

### 3. PRESENT
```
Input:  { 
  status: "present",
  checkInTime: "09:00",
  checkOutTime: "18:00"
}
Output: 
  workHours=9, overtime=1 (if >8 hours)
Uses:   Normal working day
```

### 4. LATE
```
Input:  { 
  status: "late",
  checkInTime: "10:00",  // After 9:30 AM
  checkOutTime: "18:00"
}
Output: 
  workHours=8, overtime=0
Uses:   Late arrivals but still working
```

### 5. HALF-DAY
```
Input:  { 
  status: "half-day",
  checkInTime: "09:00",
  checkOutTime: "13:30"
}
Output: 
  workHours=4 (max capped), overtime=0
Uses:   Half day work (morning or afternoon)
```

---

## Complete Request Examples

### Example 1: Create Leave Record
```bash
POST /api/attendance/create
Content-Type: application/json

{
  "employeeId": "emp_001",
  "organizationId": "org_100",
  "date": "2026-01-20",
  "status": "leave",
  "leaveType": "casual",
  "remarks": "Personal work"
}
```

### Example 2: Create Present with Overtime
```bash
POST /api/attendance/create
Content-Type: application/json

{
  "employeeId": "emp_001",
  "organizationId": "org_100",
  "date": "2026-01-20",
  "status": "present",
  "checkInTime": "2026-01-20T08:30:00Z",
  "checkOutTime": "2026-01-20T19:00:00Z"
}
```

### Example 3: Update to Leave
```bash
PATCH /api/attendance/att_123
Content-Type: application/json

{
  "status": "leave",
  "leaveType": "sick"
}
```

### Example 4: Bulk Create Mixed Status
```bash
POST /api/attendance/bulk-upsert
Content-Type: application/json

{
  "organizationId": "org_100",
  "attendances": [
    {
      "employeeId": "emp_001",
      "date": "2026-01-20",
      "status": "present",
      "checkInTime": "2026-01-20T09:00:00Z",
      "checkOutTime": "2026-01-20T18:00:00Z"
    },
    {
      "employeeId": "emp_002",
      "date": "2026-01-20",
      "status": "leave",
      "leaveType": "sick"
    },
    {
      "employeeId": "emp_003",
      "date": "2026-01-20",
      "status": "half-day",
      "checkInTime": "2026-01-20T09:00:00Z",
      "checkOutTime": "2026-01-20T13:00:00Z"
    },
    {
      "employeeId": "emp_004",
      "date": "2026-01-20",
      "status": "absent"
    }
  ]
}
```

---

## Key Features

| Feature | Implementation |
|---------|-----------------|
| **Auto Clear Times on Leave** | ✅ Yes - checkIn/Out set to null |
| **Auto Set Hours to 0** | ✅ Yes - workHours=0, overtime=0 |
| **Calculate Overtime** | ✅ Only for present/late if >8 hours |
| **Half-day Cap** | ✅ Max 4 hours regardless of input |
| **Audit Logging** | ✅ All status changes logged |
| **Bulk Processing** | ✅ Each record processed individually |
| **Consistency** | ✅ Create/Update/Bulk use same logic |

---

## Attendance Summary Report

After implementation, attendance summary correctly shows:

```json
{
  "totalPresent": 15,
  "totalAbsent": 2,
  "totalLeave": 5,          // ← Correctly counted
  "totalLate": 1,
  "totalHalfDay": 2,
  "workingHours": 124,      // ← Leave hours = 0
  "overtimeHours": 8.5      // ← Only from present/late
}
```

---

## Important Notes

1. **For LEAVE status**: You can optionally provide `leaveType` to specify the leave reason
   - sick
   - casual
   - earned
   - unpaid
   - maternity
   - other

2. **For PRESENT/LATE**: Both `checkInTime` and `checkOutTime` are required

3. **For HALF-DAY**: Times are optional, but if provided, work hours will be calculated and capped at 4 hours

4. **For ABSENT**: No times or calculations needed

5. **Overtime Calculation**: Only applies when status is "present" or "late" AND workHours > 8

---

## Common Issues & Solutions

### Issue: Leave record has checkInTime in response
**Cause**: Old code version or manual database entry  
**Solution**: Create new record with status="leave" - it will auto-clear

### Issue: Overtime calculated for leave
**Cause**: Old code version  
**Solution**: Update to latest version - overtime auto-set to 0 for leaves

### Issue: Cannot update absent to leave
**Cause**: Not an issue - update works fine  
**Solution**: Just PATCH with new status, all fields auto-processed

---

## Testing Checklist

- [ ] Create leave record - verify times are null
- [ ] Create present record - verify hours calculated
- [ ] Create half-day - verify max 4 hours
- [ ] Update to leave - verify times cleared
- [ ] Bulk insert mixed types - verify each processed correctly
- [ ] Check attendance summary - leave hours should be 0
- [ ] Check overtime summary - only work-related hours included
