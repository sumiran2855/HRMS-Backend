# HRMS RBAC & Security Testing Guide

## 🔐 Role-Based Access Control (RBAC)

### Roles Available:
1. **SUPERADMIN** - Full system access
2. **ADMIN** - Full organizational access
3. **HR** - Employee and attendance management
4. **MANAGER** - Team oversight access
5. **EMPLOYEE** - Limited self-access

---

## 📋 Testing Steps

### Step 1: Register User

```bash
POST http://localhost:3001/auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin@123",
  "name": "Admin User"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "user-123",
    "email": "admin@example.com",
    "role": "employee"
  }
}
```

---

### Step 2: Login (Get JWT Token)

```bash
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "user-123",
      "email": "admin@example.com",
      "organizationId": "org-123",
      "role": "admin",
      "permissions": ["create:employee", "read:employee", "update:employee", ...]
    }
  }
}
```

---

### Step 3: Use Token for Protected Routes

#### Example 1: Create Employee (Requires create:employee permission)

```bash
POST http://localhost:3002/api/employees
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "organizationId": "org-123",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "department": "IT",
  "position": "Developer"
}
```

**Success (Admin/HR can create):**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employeeId": "emp-123",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Failure (Employee cannot create):**
```json
{
  "success": false,
  "message": "Missing required permissions",
  "statusCode": 403
}
```

---

#### Example 2: Create Attendance (Requires create:attendance permission)

```bash
POST http://localhost:3003/api/attendance
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "organizationId": "org-123",
  "employeeId": "emp-123",
  "date": "2026-01-15",
  "status": "Present",
  "checkInTime": "09:00:00",
  "checkOutTime": "17:00:00"
}
```

---

#### Example 3: Approve Attendance (Requires approve:attendance permission)

```bash
PATCH http://localhost:3003/api/attendance/att-123/approve
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "approvedBy": "user-123"
}
```

**Only HR/Admin can approve.**

---

## 🚫 Permission Matrix

| Permission | SUPERADMIN | ADMIN | HR | MANAGER | EMPLOYEE |
|-----------|-----------|-------|-------|---------|----------|
| create:employee | ✅ | ✅ | ✅ | ❌ | ❌ |
| read:employee | ✅ | ✅ | ✅ | ✅ | ✅ |
| update:employee | ✅ | ✅ | ✅ | ❌ | ❌ |
| delete:employee | ✅ | ✅ | ❌ | ❌ | ❌ |
| create:attendance | ✅ | ✅ | ✅ | ❌ | ✅ |
| read:attendance | ✅ | ✅ | ✅ | ✅ | ✅ |
| update:attendance | ✅ | ✅ | ✅ | ❌ | ❌ |
| approve:attendance | ✅ | ✅ | ✅ | ❌ | ❌ |
| manage:roles | ✅ | ✅ | ❌ | ❌ | ❌ |
| view:reports | ✅ | ✅ | ✅ | ✅ | ❌ |

---

## 🔄 Token Refresh

When access token expires, use refresh token:

```bash
POST http://localhost:3001/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## ❌ Error Responses

### No Token
```json
{
  "success": false,
  "message": "No token provided",
  "statusCode": 401
}
```

### Invalid Token
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "statusCode": 401
}
```

### Insufficient Permissions
```json
{
  "success": false,
  "message": "Missing required permissions",
  "statusCode": 403
}
```

### Wrong Role
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "statusCode": 403
}
```

---

## 📚 Token Structure (Decoded)

```json
{
  "userId": "user-123",
  "email": "admin@example.com",
  "organizationId": "org-123",
  "role": "admin",
  "permissions": [
    "create:employee",
    "read:employee",
    "update:employee",
    "create:attendance",
    "read:attendance",
    "update:attendance",
    "approve:attendance",
    "view:reports",
    "export:data"
  ],
  "iat": 1673856000,
  "exp": 1673859600,
  "sub": "user-123"
}
```

---

## 🧪 Quick Test Script (cURL)

```bash
#!/bin/bash

# Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123","name":"Test User"}'

# Login
TOKEN=$(curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}' \
  | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# Create Employee (with token)
curl -X POST http://localhost:3002/api/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"organizationId":"org-123","firstName":"John","lastName":"Doe","email":"john@example.com","department":"IT","position":"Developer"}'

# Create Attendance (with token)
curl -X POST http://localhost:3003/api/attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"organizationId":"org-123","employeeId":"emp-123","date":"2026-01-15","status":"Present"}'
```

---

## ✅ Checklist

- [ ] Register new user
- [ ] Login and get JWT token
- [ ] Create employee with admin token
- [ ] Try to create employee with employee token (should fail)
- [ ] Create attendance with token
- [ ] Approve attendance with token
- [ ] Try to delete employee without permission (should fail)
- [ ] Verify token expiration works
- [ ] Test refresh token
- [ ] Check permission matrix accuracy
