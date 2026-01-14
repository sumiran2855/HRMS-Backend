# Inter-Service Communication with gRPC

This guide explains how to use gRPC for inter-service communication in the HRMS microservices architecture.

## Overview

The HRMS system uses gRPC for efficient inter-service communication between the Auth Service and Employee Service. gRPC provides:

- **High Performance**: Binary protocol over HTTP/2
- **Type Safety**: Protocol Buffers define service contracts
- **Low Latency**: Compared to REST/HTTP
- **Bidirectional Streaming**: Support for streaming communication

## Architecture

```
┌─────────────────────────────────────────────┐
│           Client Applications               │
└────────────────┬────────────────────────────┘
                 │
        ┌────────┴─────────┐
        │                  │
    HTTP API           HTTP API
        │                  │
┌───────▼─────────┐  ┌────▼─────────┐
│  Auth Service   │  │Employee Service
│   Port 3001     │  │   Port 3002
│   gRPC 5001     │  │   gRPC 5002
└────────┬────────┘  └────┬──────────┘
         │                │
         └────────┬───────┘
                  │
            gRPC Inter-service
            Communication
```

## Service Ports

### Auth Service
- **HTTP API**: `3001`
- **gRPC Server**: `5001`

### Employee Service
- **HTTP API**: `3002`
- **gRPC Server**: `5002`

## Proto Definitions

### Proto Files Location
`services/proto/`

### Auth Service Proto
File: `auth.proto`

```protobuf
service AuthService {
  rpc Register (RegisterRequest) returns (AuthResponse) {}
  rpc Login (LoginRequest) returns (AuthResponse) {}
  rpc ValidateToken (ValidateTokenRequest) returns (ValidateTokenResponse) {}
  rpc RefreshToken (RefreshTokenRequest) returns (AuthResponse) {}
  rpc GetCurrentUser (GetCurrentUserRequest) returns (UserResponse) {}
  rpc VerifyUserExists (VerifyUserExistsRequest) returns (VerifyUserExistsResponse) {}
}
```

### Employee Service Proto
File: `employee.proto`

```protobuf
service EmployeeService {
  rpc CreateEmployee (CreateEmployeeRequest) returns (EmployeeResponse) {}
  rpc GetEmployeeById (GetEmployeeByIdRequest) returns (EmployeeResponse) {}
  rpc GetAllEmployees (GetAllEmployeesRequest) returns (EmployeeListResponse) {}
  rpc UpdateEmployee (UpdateEmployeeRequest) returns (EmployeeResponse) {}
  rpc DeleteEmployee (DeleteEmployeeRequest) returns (DeleteEmployeeResponse) {}
  rpc GetEmployeeByEmail (GetEmployeeByEmailRequest) returns (EmployeeResponse) {}
}
```

## Implementation Details

### Employee Service

#### gRPC Server Implementation
File: `src/infrastructure/grpc/employee.grpc.ts`

The gRPC server is initialized in the service bootstrap process and handles all employee-related operations.

#### Auth Service Client
File: `src/infrastructure/grpc/auth.grpc.client.ts`

Used to communicate with Auth Service:
- Verify user existence
- Get current user details
- Validate authentication tokens

### Auth Service

#### gRPC Server Implementation
File: `src/infrastructure/grpc/auth.grpc.ts`

The gRPC server handles all authentication operations.

#### Employee Service Client
File: `src/infrastructure/grpc/employee.grpc.client.ts`

Used to communicate with Employee Service:
- Get employee by email
- Get employee by ID
- Get all employees with filters

## Configuration

### Environment Variables

Create `.env` files in each service:

**Auth Service (.env)**
```
NODE_ENV=development
PORT=3001
GRPC_AUTH_PORT=5001
GRPC_EMPLOYEE_PORT=5002
EMPLOYEE_SERVICE_GRPC_URL=localhost:5002
MONGODB_URI=mongodb://localhost:27017/hrms-auth
```

**Employee Service (.env)**
```
NODE_ENV=development
PORT=3002
GRPC_AUTH_PORT=5001
GRPC_EMPLOYEE_PORT=5002
AUTH_SERVICE_GRPC_URL=localhost:5001
MONGODB_URI=mongodb://localhost:27017/hrms-employee
```

## Running Services

### Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

This starts:
- MongoDB database
- Auth Service (HTTP: 3001, gRPC: 5001)
- Employee Service (HTTP: 3002, gRPC: 5002)

### Running Locally

**Terminal 1: Auth Service**
```bash
cd services/auth-service
npm install
npm run dev
```

**Terminal 2: Employee Service**
```bash
cd services/employee-service
npm install
npm run dev
```

## Usage Examples

### From Employee Service - Call Auth Service

```typescript
import { AuthGrpcClient } from './infrastructure/grpc/auth.grpc.client';

const authClient = new AuthGrpcClient('localhost:5001');
await authClient.initialize();

// Verify user exists
const exists = await authClient.verifyUserExists('user@example.com');

// Validate token
const isValid = await authClient.validateToken('token_string');

// Get current user
const user = await authClient.getCurrentUser('userId');

await authClient.close();
```

### From Auth Service - Call Employee Service

```typescript
import { EmployeeGrpcClient } from './infrastructure/grpc/employee.grpc.client';

const employeeClient = new EmployeeGrpcClient('localhost:5002');
await employeeClient.initialize();

// Get employee by email
const employee = await employeeClient.getEmployeeByEmail('john@example.com');

// Get employee by ID
const emp = await employeeClient.getEmployeeById('emp_id_123');

// Get all employees
const employees = await employeeClient.getAllEmployees({ department: 'IT' });

await employeeClient.close();
```

## Error Handling

gRPC errors use standard gRPC status codes:

- `OK (0)`: Success
- `CANCELLED (1)`: Operation cancelled
- `UNKNOWN (2)`: Unknown error
- `INVALID_ARGUMENT (3)`: Invalid argument provided
- `DEADLINE_EXCEEDED (4)`: Operation exceeded deadline
- `NOT_FOUND (5)`: Resource not found
- `ALREADY_EXISTS (6)`: Resource already exists
- `PERMISSION_DENIED (7)`: Permission denied
- `UNAUTHENTICATED (16)`: Authentication required
- `INTERNAL (13)`: Internal server error

Example error handling:

```typescript
try {
  const user = await authClient.getCurrentUser(userId);
} catch (error: any) {
  if (error.code === 5) {
    console.log('User not found');
  } else if (error.code === 16) {
    console.log('Authentication failed');
  } else {
    console.log('Unknown error:', error.message);
  }
}
```

## Testing gRPC Services

### Using grpcurl

Install grpcurl:
```bash
go install github.com/fullstorydev/grpcurl/cmd/grpcurl@latest
```

List services:
```bash
grpcurl -plaintext localhost:5001 list
grpcurl -plaintext localhost:5002 list
```

Call a method:
```bash
grpcurl -plaintext -d '{"email": "test@example.com"}' \
  localhost:5001 auth.AuthService/VerifyUserExists
```

### Using Postman

Postman supports gRPC testing:
1. Create new gRPC request
2. Server URL: `localhost:5001`
3. Service and method selection
4. Add proto files from `services/proto/`

## Best Practices

1. **Connection Management**: Initialize clients once and reuse connections
2. **Error Handling**: Always handle gRPC errors appropriately
3. **Timeouts**: Set reasonable timeouts for gRPC calls
4. **Logging**: Log all inter-service communication for debugging
5. **Health Checks**: Implement gRPC health check service
6. **Load Balancing**: Use service mesh for production deployments

## Monitoring

### Metrics to Track
- gRPC request latency
- Error rates by service
- Connection pool usage
- Message sizes

### Logging
All gRPC operations are logged using the Logger utility with context:
```
[EmployeeGrpcImpl] gRPC: Creating employee
[AuthGrpcClient] Connected to Auth Service at localhost:5001
```

## Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:5001
```
Solution: Ensure the target service is running on the correct port.

### Proto File Not Found
```
Error: ENOENT: no such file or directory, open 'path/to/proto'
```
Solution: Check that proto files exist in `services/proto/` directory.

### Method Not Found
```
Error: 12 UNIMPLEMENTED: ...
```
Solution: Verify the service implements the called method.

## Next Steps

1. Implement gRPC middleware for authentication
2. Add gRPC interceptors for logging and metrics
3. Implement gRPC health checks
4. Setup Kubernetes service discovery
5. Add gRPC load balancing

## References

- [gRPC Documentation](https://grpc.io/docs/)
- [Protocol Buffers Guide](https://developers.google.com/protocol-buffers)
- [@grpc/grpc-js Documentation](https://grpc.io/docs/languages/node/basics/)
