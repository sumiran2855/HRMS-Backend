# Attendance Service - Quick Start Guide

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd services/attendance-service
npm install
```

### Step 2: Create Environment File
Create `.env` in `services/attendance-service/`:

```env
PORT=3003
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hrms_attendance
GRPC_ATTENDANCE_PORT=5003
JWT_SECRET=dev_secret_key_12345
JWT_EXPIRES_IN=3600
CORS_ORIGIN=*
```

### Step 3: Start MongoDB (if not running)
```bash
# Using Docker
docker run -d \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  mongo:latest
```

### Step 4: Run the Service
```bash
npm run dev
```

### Step 5: Test the Service
```bash
# Health check
curl http://localhost:3003/health

# Ready check  
curl http://localhost:3003/ready

# Create attendance (requires auth header)
curl -X POST http://localhost:3003/api/attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy_token" \
  -H "X-Org-ID: test-org" \
  -H "X-User-ID: test-user" \
  -d '{
    "employeeId": "emp_001",
    "date": "2024-01-15T00:00:00Z",
    "checkInTime": "2024-01-15T09:00:00Z",
    "checkOutTime": "2024-01-15T17:30:00Z",
    "status": "present"
  }'
```

## File Summary

### Core Files
- `src/server.ts` - Entry point with bootstrap
- `src/app.ts` - Express app configuration
- `src/config/env.config.ts` - Environment configuration

### Domain Layer
- `src/domain/entities/Attendance.entity.ts` - Models and interfaces

### Application Layer
- `src/application/services/AttendanceService.ts` - Business logic
- `src/application/commands/Attendance.command.ts` - Commands
- `src/application/handlers/Attendance.handler.ts` - Command handlers
- `src/application/ports/AttendanceRepository.port.ts` - Repository interface

### Infrastructure Layer
- `src/infrastructure/persistence/attendance.repository.ts` - Data access
- `src/infrastructure/persistence/attendance.schema.ts` - MongoDB schema
- `src/bootstrap/db.bootstrap.ts` - Database setup
- `src/bootstrap/grpc.bootstrap.ts` - gRPC setup

### Interface Layer
- `src/interface/http/AttendanceController.ts` - HTTP handlers
- `src/interface/http/routes/attendance.routes.ts` - Routes
- `src/interface/dtos/Attendance.dto.ts` - DTOs

### Bootstrap
- `src/bootstrap/container.bootstrap.ts` - Dependency injection

### Utilities
- `src/shared/constants/attendance.constants.ts` - Constants
- `src/shared/types/index.ts` - TypeScript types
- `src/shared/utils/` - Logger, error handler, response formatter

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance` | Create attendance |
| GET | `/api/attendance/:id` | Get by ID |
| GET | `/api/attendance/employee/date` | Get by employee & date |
| PUT | `/api/attendance/:id` | Update attendance |
| DELETE | `/api/attendance/:id` | Delete attendance |
| POST | `/api/attendance/:id/approve` | Approve attendance |
| GET | `/api/attendance/range/query` | Date range query |
| GET | `/api/attendance/summary/stats` | Get summary |
| GET | `/api/attendance/pending/approvals` | Pending approvals |
| POST | `/api/attendance/bulk/upsert` | Bulk operations |

## Example Usage

### Create Attendance
```bash
curl -X POST http://localhost:3003/api/attendance \
  -H "Content-Type: application/json" \
  -H "X-Org-ID: org_001" \
  -d '{
    "employeeId": "emp_001",
    "date": "2024-01-15T00:00:00Z",
    "checkInTime": "2024-01-15T09:00:00Z",
    "checkOutTime": "2024-01-15T17:30:00Z"
  }'
```

### Get Attendance Summary
```bash
curl "http://localhost:3003/api/attendance/summary/stats?employeeId=emp_001&startDate=2024-01-01&endDate=2024-01-31" \
  -H "X-Org-ID: org_001"
```

### Approve Attendance
```bash
curl -X POST http://localhost:3003/api/attendance/:id/approve \
  -H "X-Org-ID: org_001" \
  -H "X-User-ID: manager_001"
```

## Commands

```bash
npm run dev           # Start in development mode
npm run build         # Build TypeScript
npm start             # Start production
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:cov      # Coverage
npm run lint          # Lint code
npm run format        # Format code
```

## Features

✅ Attendance tracking with check-in/check-out  
✅ Automatic status detection (Present/Late/Absent)  
✅ Leave management with multiple types  
✅ Approval workflow  
✅ Attendance summaries  
✅ Bulk operations  
✅ Multi-tenancy support  
✅ gRPC inter-service communication  
✅ Clean architecture  
✅ CQRS pattern  
✅ Full TypeScript  
✅ Comprehensive logging  
✅ Error handling  
✅ Input validation  

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB or update MONGODB_URI in .env

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3003
```
**Solution**: Change PORT in .env or kill process on port 3003

### Missing Organization Context
```
Error: Organization context missing
```
**Solution**: Add `X-Org-ID` header to requests

### Duplicate Attendance
```
Error: Attendance already exists for this date
```
**Solution**: Update existing record instead of creating new one

## Architecture

```
HTTP Request
    ↓
Route Handler
    ↓
Controller
    ↓
Command
    ↓
Handler
    ↓
Service
    ↓
Repository
    ↓
MongoDB
```

## What's Included

✨ **Complete Service Setup**
- All domain, application, and infrastructure layers
- HTTP API with 10 endpoints
- gRPC service definition
- CQRS pattern with commands and handlers
- Full CRUD operations
- Advanced features (approvals, summaries, bulk operations)

✨ **Production-Ready**
- Error handling
- Logging with context
- Graceful shutdown
- Health checks
- Input validation
- Multi-tenancy
- Security headers

✨ **Development Tools**
- TypeScript with strict mode
- Jest testing setup
- ESLint and Prettier configuration
- npm scripts for common tasks
- Comprehensive documentation

## Next Steps

1. **Install dependencies**: `npm install`
2. **Create `.env` file** with your configuration
3. **Start MongoDB** (or use existing instance)
4. **Run service**: `npm run dev`
5. **Test endpoints** using curl or Postman
6. **Integrate with auth service** for real JWT validation
7. **Connect to employee service** for employee validation
8. **Deploy** to production

## Support

- See [README.md](README.md) for detailed documentation
- See [SETUP_COMPLETE.md](SETUP_COMPLETE.md) for full setup details
- Check [src/interface/dtos/Attendance.dto.ts](src/interface/dtos/Attendance.dto.ts) for request/response schemas

## Happy Coding! 🚀

The attendance service is fully functional and ready for integration with other microservices in your HRMS system.
