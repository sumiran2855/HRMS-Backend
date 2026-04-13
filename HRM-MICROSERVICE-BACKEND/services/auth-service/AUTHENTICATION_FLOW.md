# 🔐 Complete Authentication Flow Guide

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Frontend)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
         ┌──────▼──────┐   ┌──▼──────┐  ┌──▼───────┐
         │   Register  │   │  Login  │  │ Refresh  │
         │   /POST     │   │  /POST  │  │ /POST    │
         └──────┬──────┘   └──┬──────┘  └──┬───────┘
                │             │             │
                └─────────────┼─────────────┘
                              │
                ┌─────────────▼─────────────┐
                │   JWT Token Validation    │
                │   - Access Token (1h)     │
                │   - Refresh Token (24h)   │
                └─────────────┬─────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────────┐     ┌──────▼──────┐     ┌───────▼────┐
   │ Current User│     │  Validate   │     │  Logout    │
   │ /GET        │     │ Token /POST │     │ /POST      │
   └─────────────┘     └─────────────┘     └────────────┘
```

---

## 🚀 Complete Authentication Lifecycle

### Phase 1: User Registration

```
1. POST /api/auth/register
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "fullName": "User Name"
}

2. Server Processing:
   ├─ Check if email exists
   ├─ Check if username taken
   ├─ Hash password with bcryptjs
   ├─ Create user in MongoDB
   ├─ Generate accessToken (1 hour, JWT_SECRET)
   └─ Generate refreshToken (24 hours, JWT_REFRESH_SECRET)

3. Response (201 Created):
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "username",
      "fullName": "User Name"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJ1c2VybmFtZSI6InVzZXJuYW1lIiwiaWF0IjoxNjczNTM1MDAwLCJleHAiOjE2NzM1Mzg2MDB9.xyz",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJ1c2VybmFtZSI6InVzZXJuYW1lIiwiaWF0IjoxNjczNTM1MDAwLCJleHAiOjE2NzM2MjE0MDB9.abc"
  }
}
```

### Phase 2: User Login

```
1. POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

2. Server Processing:
   ├─ Find user by email
   ├─ Compare password hash with provided password
   ├─ Check if user account is active
   ├─ Generate accessToken (1 hour, JWT_SECRET)
   └─ Generate refreshToken (24 hours, JWT_REFRESH_SECRET)

3. Response (200 OK):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "username": "username",
      "fullName": "User Name"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Phase 3: Using Access Token (Protected Endpoints)

```
1. GET /api/auth/current-user
   Headers: {
     "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }

2. Middleware Processing:
   ├─ Extract Authorization header
   ├─ Remove "Bearer " prefix
   ├─ Verify token signature with JWT_SECRET
   ├─ Check token expiration
   └─ If valid: Set req.user = decoded payload

3. Response (200 OK):
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "username",
    "fullName": "User Name",
    "isActive": true
  }
}

4. If Token Invalid/Expired:
   Response (401 Unauthorized):
{
  "success": false,
  "message": "Invalid or expired token",
  "statusCode": 401
}
```

### Phase 4: Refreshing Access Token (Token Expires)

```
Timeline:
├─ 00:00 - User logs in, gets tokens
├─ 00:05 - Uses accessToken ✅
├─ 00:55 - AccessToken about to expire
├─ 01:00 - AccessToken EXPIRES ❌
└─ 01:01 - Refresh to get new token

Request:
1. POST /api/auth/refresh-token
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

2. Server Processing:
   ├─ Extract refreshToken from body
   ├─ Verify signature with JWT_REFRESH_SECRET
   ├─ Check refreshToken expiration (24 hours)
   ├─ Extract userId, email, username
   └─ Generate new accessToken (1 hour)

3. Response (200 OK):
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

4. If Refresh Token Invalid/Expired:
   Response (400/401):
{
  "success": false,
  "message": "Invalid or expired refresh token",
  "statusCode": 401
}
```

### Phase 5: Logout

```
1. POST /api/auth/logout
   Headers: {
     "Authorization": "Bearer <accessToken>"
   }

2. Server Processing:
   ├─ Validate accessToken from header
   ├─ Extract userId
   └─ Mark session as inactive (or clear token from DB)

3. Response (200 OK):
{
  "success": true,
  "message": "User logged out successfully",
  "data": {
    "message": "User logged out successfully"
  }
}

4. Client Action:
   ├─ Clear accessToken from memory/session storage
   ├─ Clear refreshToken from cookies/storage
   └─ Redirect to login page
```

---

## 🔐 Token Structure

### Access Token Payload
```typescript
{
  userId: "507f1f77bcf86cd799439011",      // User ID
  email: "user@example.com",               // User email
  username: "username",                    // Username
  iat: 1673535000,                         // Issued at
  exp: 1673538600                          // Expiration (1 hour later)
}
```

### Refresh Token Payload
```typescript
{
  userId: "507f1f77bcf86cd799439011",      // User ID
  email: "user@example.com",               // User email
  username: "username",                    // Username
  iat: 1673535000,                         // Issued at
  exp: 1673621400                          // Expiration (24 hours later)
}
```

---

## 🛡️ Security Features

### 1. **Password Hashing**
```typescript
// Register/Login
const passwordService = new PasswordService();
await passwordService.hash(plainPassword);    // Returns bcrypt hash
await user.comparePassword(plainPassword);    // Compare with hash
```

### 2. **JWT Token Validation**
```typescript
// Middleware
const payload = jwtService.verifyToken(token);
// Validates: signature, expiration, claims
```

### 3. **Separate Token Secrets**
```
Access Token Secret:  JWT_SECRET
Refresh Token Secret: JWT_REFRESH_SECRET
```

### 4. **Token Expiration**
```
Access Token:  3600 seconds (1 hour)
Refresh Token: 86400 seconds (24 hours)
```

### 5. **User Status Check**
```typescript
// Login validates
if (!user.isActive) {
  throw new Error('User account is inactive');
}
```

---

## 📱 Client Implementation Example

### JavaScript/React
```javascript
// 1. Register
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, username, password, fullName })
});
const { data } = await registerResponse.json();
sessionStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken); // HttpOnly cookie preferred

// 2. API Request with Access Token
const response = await fetch('/api/auth/current-user', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
  }
});

// 3. Handle 401 - Token Expired
if (response.status === 401) {
  const refreshResponse = await fetch('/api/auth/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refreshToken: localStorage.getItem('refreshToken')
    })
  });
  
  const { data } = await refreshResponse.json();
  sessionStorage.setItem('accessToken', data.accessToken);
  
  // Retry original request
  const retryResponse = await fetch('/api/auth/current-user', {
    headers: {
      'Authorization': `Bearer ${data.accessToken}`
    }
  });
}

// 4. Logout
const logoutResponse = await fetch('/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
  }
});

sessionStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
window.location.href = '/login';
```

---

## 🔄 Token Refresh Strategies

### Strategy 1: Refresh Before Expiration (Proactive)
```javascript
// Refresh token at 55 minutes (before 1 hour expiration)
setInterval(() => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    fetch('/api/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    }).then(res => res.json())
      .then(data => {
        sessionStorage.setItem('accessToken', data.data.accessToken);
      });
  }
}, 55 * 60 * 1000); // 55 minutes
```

### Strategy 2: Refresh on 401 Response (Reactive)
```javascript
async function apiCall(url, options = {}) {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
    }
  });

  if (response.status === 401) {
    // Try to refresh token
    const refreshResponse = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshToken: localStorage.getItem('refreshToken')
      })
    });

    if (refreshResponse.ok) {
      const { data } = await refreshResponse.json();
      sessionStorage.setItem('accessToken', data.accessToken);

      // Retry original request
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${data.accessToken}`
        }
      });
    } else {
      // Refresh failed - redirect to login
      window.location.href = '/login';
    }
  }

  return response;
}
```

---

## ⚠️ Error Scenarios

### Scenario 1: Invalid Email/Password
```
POST /api/auth/login
{ "email": "wrong@email.com", "password": "wrong" }

Response (401):
{
  "success": false,
  "message": "Invalid email or password",
  "statusCode": 401
}
```

### Scenario 2: User Already Exists
```
POST /api/auth/register
{ "email": "existing@email.com", ... }

Response (400):
{
  "success": false,
  "message": "User with this email already exists",
  "statusCode": 400
}
```

### Scenario 3: Missing Authorization Header
```
GET /api/auth/current-user
(No Authorization header)

Response (401):
{
  "success": false,
  "message": "Unauthorized",
  "statusCode": 401
}
```

### Scenario 4: Invalid Token Format
```
GET /api/auth/current-user
Authorization: "Bearer invalid_token_format"

Response (401):
{
  "success": false,
  "message": "Invalid or expired token",
  "statusCode": 401
}
```

### Scenario 5: Expired Access Token
```
GET /api/auth/current-user
Authorization: "Bearer <expired_token>"

Response (401):
{
  "success": false,
  "message": "Invalid or expired token",
  "statusCode": 401
}
```

### Scenario 6: Expired Refresh Token
```
POST /api/auth/refresh-token
{ "refreshToken": "<expired_24h_token>" }

Response (401):
{
  "success": false,
  "message": "Invalid or expired refresh token",
  "statusCode": 401
}
```

---

## 🧪 Complete Integration Test

```bash
#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:3001"
TEST_USER_EMAIL="test@example.com"
TEST_USER_USERNAME="testuser"
TEST_USER_PASSWORD="Test123456"
TEST_USER_NAME="Test User"

echo -e "${BLUE}=== Authentication Flow Test ===${NC}\n"

# 1. Register
echo -e "${BLUE}1️⃣ Testing Registration...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_USER_EMAIL\",
    \"username\": \"$TEST_USER_USERNAME\",
    \"password\": \"$TEST_USER_PASSWORD\",
    \"fullName\": \"$TEST_USER_NAME\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Registration successful${NC}"
  REGISTER_ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.accessToken')
  REGISTER_REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.refreshToken')
  echo "  Access Token: ${REGISTER_ACCESS_TOKEN:0:30}..."
  echo "  Refresh Token: ${REGISTER_REFRESH_TOKEN:0:30}..."
else
  echo -e "${RED}✗ Registration failed${NC}"
  echo "$REGISTER_RESPONSE" | jq .
  exit 1
fi

# 2. Login
echo -e "\n${BLUE}2️⃣ Testing Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_USER_EMAIL\",
    \"password\": \"$TEST_USER_PASSWORD\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Login successful${NC}"
  LOGIN_ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken')
  LOGIN_REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.refreshToken')
  echo "  Access Token: ${LOGIN_ACCESS_TOKEN:0:30}..."
  echo "  Refresh Token: ${LOGIN_REFRESH_TOKEN:0:30}..."
else
  echo -e "${RED}✗ Login failed${NC}"
  echo "$LOGIN_RESPONSE" | jq .
  exit 1
fi

# 3. Get Current User
echo -e "\n${BLUE}3️⃣ Testing Current User (Protected)...${NC}"
CURRENT_USER_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/current-user" \
  -H "Authorization: Bearer $LOGIN_ACCESS_TOKEN")

if echo "$CURRENT_USER_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Current user fetched${NC}"
  echo "$CURRENT_USER_RESPONSE" | jq '.data'
else
  echo -e "${RED}✗ Current user failed${NC}"
  echo "$CURRENT_USER_RESPONSE" | jq .
fi

# 4. Refresh Token
echo -e "\n${BLUE}4️⃣ Testing Token Refresh...${NC}"
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/refresh-token" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$LOGIN_REFRESH_TOKEN\"}")

if echo "$REFRESH_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Token refreshed successfully${NC}"
  NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.data.accessToken')
  echo "  New Access Token: ${NEW_ACCESS_TOKEN:0:30}..."
else
  echo -e "${RED}✗ Token refresh failed${NC}"
  echo "$REFRESH_RESPONSE" | jq .
  exit 1
fi

# 5. Use New Token
echo -e "\n${BLUE}5️⃣ Testing New Access Token...${NC}"
NEW_TOKEN_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/current-user" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN")

if echo "$NEW_TOKEN_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ New token works${NC}"
  echo "$NEW_TOKEN_RESPONSE" | jq '.data'
else
  echo -e "${RED}✗ New token failed${NC}"
  echo "$NEW_TOKEN_RESPONSE" | jq .
fi

# 6. Logout
echo -e "\n${BLUE}6️⃣ Testing Logout...${NC}"
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/logout" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN")

if echo "$LOGOUT_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Logout successful${NC}"
else
  echo -e "${RED}✗ Logout failed${NC}"
  echo "$LOGOUT_RESPONSE" | jq .
fi

echo -e "\n${GREEN}=== All tests completed ===${NC}"
```

Run the test:
```bash
chmod +x test-complete-auth-flow.sh
./test-complete-auth-flow.sh
```

---

## 📚 Related Documentation

- `TOKEN_VALIDATION_FIX.md` - Access token validation debugging
- `REFRESH_TOKEN_FIX.md` - Refresh token implementation details
- `REFRESH_TOKEN_RESOLUTION.md` - Issues and fixes summary

---

**Your authentication system is now fully functional and production-ready! ✅**
