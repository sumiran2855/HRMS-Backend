# Logout Implementation - Testing Guide

## Test Scenarios

### Scenario 1: Login and Logout
```bash
# 1. Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
Response: { accessToken: "jwt_token", refreshToken: "refresh_token" }

# 2. Use the token (should work)
POST /auth/validate-token
Authorization: Bearer {accessToken}
Response: 200 OK { valid: true, payload: {...} }

# 3. Logout
POST /auth/logout
Authorization: Bearer {accessToken}
Response: 200 OK { message: "Logout successful" }

# 4. Try to use the same token (should fail)
POST /auth/validate-token
Authorization: Bearer {accessToken}
Response: 401 UNAUTHORIZED { message: "Token has been revoked. Please login again." }
```

### Scenario 2: Current User After Logout
```bash
# 1. Login
POST /auth/login
→ Get accessToken

# 2. Get current user (should work)
POST /auth/current-user
Authorization: Bearer {accessToken}
Response: 200 OK { id, email, username, fullName, isActive }

# 3. Logout
POST /auth/logout
Authorization: Bearer {accessToken}
Response: 200 OK

# 4. Try to get current user (should fail)
POST /auth/current-user
Authorization: Bearer {accessToken}
Response: 401 UNAUTHORIZED { message: "Token has been revoked. Please login again." }
```

### Scenario 3: Multiple Tokens
```bash
# 1. Login first time
POST /auth/login
→ Get accessToken1

# 2. Login second time (same user, different session)
POST /auth/login
→ Get accessToken2

# 3. Both tokens work initially
POST /auth/validate-token
Authorization: Bearer {accessToken1}
→ 200 OK

POST /auth/validate-token
Authorization: Bearer {accessToken2}
→ 200 OK

# 4. Logout with accessToken1
POST /auth/logout
Authorization: Bearer {accessToken1}
→ 200 OK

# 5. accessToken1 is revoked
POST /auth/validate-token
Authorization: Bearer {accessToken1}
→ 401 UNAUTHORIZED

# 6. accessToken2 still works (different token)
POST /auth/validate-token
Authorization: Bearer {accessToken2}
→ 200 OK
```

## Database Verification

### Check Blacklisted Tokens
```bash
# Connect to MongoDB
mongo "mongodb://localhost:27017/hrms_auth"

# Check blacklist collection
db.token_blacklist.find()

# Output example:
{
  "_id": ObjectId(...),
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "user_id_123",
  "expiresAt": ISODate("2026-01-19T12:30:00Z"),
  "createdAt": ISODate("2026-01-19T11:30:00Z")
}
```

### TTL Index Verification
```bash
db.token_blacklist.getIndexes()

# Should include:
{
  "v": 2,
  "key": { "expiresAt": 1 },
  "expireAfterSeconds": 0
}
```

## Error Cases

### Missing Token in Logout
```bash
POST /auth/logout
(no Authorization header)
Response: 400 BAD_REQUEST { message: "Token is required" }
```

### Invalid Token
```bash
POST /auth/logout
Authorization: Bearer invalid_token
Response: 401 UNAUTHORIZED { message: "Invalid token" }
```

### Already Blacklisted Token
```bash
# First logout
POST /auth/logout
Authorization: Bearer {token}
→ 200 OK (token added to blacklist)

# Second logout attempt with same token
POST /auth/logout
Authorization: Bearer {token}
→ 401 UNAUTHORIZED { message: "Token has been revoked. Please login again." }
```

## Integration Testing

### With Postman
1. Create collection "Auth Tests"
2. Login to get tokens
3. Use tokens in subsequent requests
4. Verify logout revokes token
5. Verify subsequent requests fail

### Environment Variables
```
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1h
MONGODB_URI=mongodb://localhost:27017/hrms_auth
```

## Performance Testing

### Load Test - Logout Requests
```
- 100 concurrent logout requests
- Expected: All succeed with 200 OK
- Token blacklist queries should be indexed
```

### Load Test - After Logout
```
- 100 concurrent requests with blacklisted tokens
- Expected: All fail with 401 UNAUTHORIZED
- Blacklist check should complete < 10ms
```

## Notes
- Tokens are automatically cleaned up after expiration (TTL index)
- Token blacklist check is fail-open (errors allow request through)
- Each token is unique and can be tracked individually
- Blacklisting is per-token, not per-user (multiple sessions supported)
