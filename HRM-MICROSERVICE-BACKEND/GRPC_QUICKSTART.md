# gRPC Quick Start Guide

## What's Been Set Up

Your HRMS microservices now have gRPC support for inter-service communication! Here's what has been configured:

### ✅ Installed
- `@grpc/grpc-js` - gRPC library for Node.js
- `@grpc/proto-loader` - Protocol Buffer loader

### ✅ Created
- **Proto Files** (`services/proto/`)
  - `auth.proto` - Auth Service definitions
  - `employee.proto` - Employee Service definitions

- **gRPC Servers** (Handle incoming gRPC requests)
  - `employee-service/src/infrastructure/grpc/employee.grpc.ts`
  - `auth-service/src/infrastructure/grpc/auth.grpc.ts`

- **gRPC Clients** (Make gRPC requests to other services)
  - `employee-service/src/infrastructure/grpc/auth.grpc.client.ts`
  - `auth-service/src/infrastructure/grpc/employee.grpc.client.ts`

- **Bootstrap Files** (Setup gRPC servers on startup)
  - `src/bootstrap/grpc.bootstrap.ts` (both services)

- **Configuration** (Environment variables)
  - `src/config/grpc.config.ts` (both services)

## Default Ports

| Service | HTTP | gRPC |
|---------|------|------|
| Auth    | 3001 | 5001 |
| Employee| 3002 | 5002 |

## Environment Variables

Add to your `.env` files:

```bash
# Auth Service .env
GRPC_AUTH_PORT=5001
GRPC_EMPLOYEE_PORT=5002
EMPLOYEE_SERVICE_GRPC_URL=localhost:5002

# Employee Service .env
GRPC_AUTH_PORT=5001
GRPC_EMPLOYEE_PORT=5002
AUTH_SERVICE_GRPC_URL=localhost:5001
```

## Next Steps

### 1. Initialize gRPC Server in server.ts

Add to your service's main server file:

```typescript
import { initializeGrpcServer, startGrpcServer, loadProtoDefinition } from './bootstrap/grpc.bootstrap';
import { grpcConfig } from './config/grpc.config';

// In your bootstrap function:
const grpcServer = initializeGrpcServer();
const protoDefinition = loadProtoDefinition(
  path.join(__dirname, '../proto'),
  'employee.proto' // or 'auth.proto'
);

// Register services
const employeeProto = protoDefinition.employee;
grpcServer.addService(employeeProto.EmployeeService.service, new EmployeeGrpcImpl(container));

// Start gRPC server
await startGrpcServer(grpcServer, grpcConfig.grpcEmployeePort);
```

### 2. Initialize gRPC Clients

```typescript
import { AuthGrpcClient } from './infrastructure/grpc/auth.grpc.client';
import { grpcConfig } from './config/grpc.config';

// In your service initialization:
const authClient = new AuthGrpcClient(grpcConfig.authServiceUrl);
await authClient.initialize();
```

### 3. Use gRPC Calls

```typescript
// From Employee Service - Call Auth Service
const userExists = await authClient.verifyUserExists('user@example.com');

// From Auth Service - Call Employee Service  
const employee = await employeeClient.getEmployeeByEmail('john@example.com');
```

## Running with Docker Compose

```bash
docker-compose up -d
```

This starts:
- MongoDB
- Auth Service (HTTP: 3001, gRPC: 5001)
- Employee Service (HTTP: 3002, gRPC: 5002)

## Testing gRPC Services

### Using curl (HTTP API)
```bash
curl http://localhost:3001/api/health
curl http://localhost:3002/api/health
```

### Using grpcurl (gRPC)
Install grpcurl:
```bash
go install github.com/fullstorydev/grpcurl/cmd/grpcurl@latest
```

List services:
```bash
grpcurl -plaintext localhost:5001 list
grpcurl -plaintext localhost:5002 list
```

## Project Structure

```
services/
├── proto/
│   ├── auth.proto
│   └── employee.proto
├── auth-service/
│   └── src/
│       ├── bootstrap/
│       │   └── grpc.bootstrap.ts
│       ├── config/
│       │   └── grpc.config.ts
│       └── infrastructure/
│           └── grpc/
│               ├── auth.grpc.ts (server)
│               └── employee.grpc.client.ts (client)
└── employee-service/
    └── src/
        ├── bootstrap/
        │   └── grpc.bootstrap.ts
        ├── config/
        │   └── grpc.config.ts
        └── infrastructure/
            └── grpc/
                ├── employee.grpc.ts (server)
                └── auth.grpc.client.ts (client)
```

## Common Issues

### Port Already in Use
If ports 5001 or 5002 are already in use, update the `GRPC_*_PORT` environment variables.

### Service Not Found
Ensure both services are running on the correct ports before attempting communication.

### Proto File Not Found
Verify proto files exist in `services/proto/` directory.

## Resources

- Full documentation: See `GRPC_GUIDE.md`
- Proto definitions: `services/proto/`
- Docker setup: `docker-compose.yml`

## What You Can Do Now

- ✅ Services can communicate via gRPC
- ✅ Type-safe RPC calls using Protocol Buffers
- ✅ Efficient binary serialization
- ✅ HTTP/2 multiplexing for better performance
- ✅ Ready for production deployment

Happy coding! 🚀
