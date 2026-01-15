# Attendance Service

Part of the HRMS Microservice Backend architecture, the Attendance Service manages employee attendance records, check-in/check-out tracking, leave management, and attendance approval workflows.

## Features

- ✅ **Attendance Tracking**: Record employee check-in/check-out times
- ✅ **Status Management**: Track attendance status (Present, Absent, Leave, Half-day, Late)
- ✅ **Leave Management**: Support multiple leave types (Sick, Casual, Earned, Unpaid, Maternity, Other)
- ✅ **Approval Workflow**: Manager approval workflow for attendance records
- ✅ **Attendance Summary**: Generate attendance summaries for reporting
- ✅ **Bulk Operations**: Bulk upsert attendance records for batch processing
- ✅ **Multi-Tenancy**: Complete tenant isolation and data segregation
- ✅ **gRPC Support**: Inter-service communication via gRPC
- ✅ **Clean Architecture**: Layered architecture with CQRS pattern
- ✅ **Type Safety**: Full TypeScript implementation

## Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Inter-Service**: gRPC + Protocol Buffers
- **Dependency Injection**: Inversify
- **Testing**: Jest (configured)
- **Containerization**: Docker

## Project Structure

```
src/
├── app.ts                          # Express app configuration
├── server.ts                       # Server entry point
├── application/
│   ├── commands/                   # CQRS Commands
│   │   └── Attendance.command.ts
│   ├── handlers/                   # Command Handlers
│   │   └── Attendance.handler.ts
│   ├── ports/                      # Repository interfaces
│   │   └── AttendanceRepository.port.ts
│   └── services/                   # Business logic
│       └── AttendanceService.ts
├── bootstrap/
│   ├── container.bootstrap.ts      # IoC Container setup
│   ├── db.bootstrap.ts             # Database initialization
│   └── grpc.bootstrap.ts           # gRPC server setup
├── config/
│   └── env.config.ts               # Environment configuration
├── domain/
│   ├── entities/
│   │   └── Attendance.entity.ts    # Domain models & interfaces
│   └── repositories/               # Repository interfaces
├── infrastructure/
│   ├── database/
│   ├── grpc/                       # gRPC implementations
│   └── persistence/
│       ├── attendance.schema.ts    # MongoDB schema
│       └── attendance.repository.ts # Data access layer
├── interface/
│   ├── dtos/
│   │   └── Attendance.dto.ts       # Request/Response DTOs
│   └── http/
│       ├── AttendanceController.ts # HTTP request handlers
│       └── routes/
│           └── attendance.routes.ts # Route definitions
└── shared/
    ├── constants/
    │   └── attendance.constants.ts # Constants
    ├── types/
    ├── utils/
    │   ├── error-handler.util.ts
    │   ├── logger.util.ts
    │   └── response-formatter.util.ts
```

## API Endpoints

All endpoints require `Authorization: Bearer <token>` header and organization context.

### Create Attendance
```
POST /api/attendance
Content-Type: application/json

{
  "employeeId": "emp_123",
  "date": "2024-01-15T00:00:00Z",
  "checkInTime": "2024-01-15T09:00:00Z",
  "checkOutTime": "2024-01-15T17:30:00Z",
  "status": "present",
  "remarks": "Regular working day"
}

Response (201):
{
  "success": true,
  "message": "Attendance created successfully",
  "statusCode": 201,
  "data": { ... }
}
```

### Get Attendance by ID
```
GET /api/attendance/:id
```

### Get Attendance by Employee & Date
```
GET /api/attendance/employee/date?employeeId=emp_123&date=2024-01-15
```

### Update Attendance
```
PUT /api/attendance/:id
Content-Type: application/json

{
  "status": "leave",
  "leaveType": "sick",
  "remarks": "Medical emergency"
}
```

### Delete Attendance
```
DELETE /api/attendance/:id
```

### Get Attendance by Date Range
```
GET /api/attendance/range/query?startDate=2024-01-01&endDate=2024-01-31&employeeId=emp_123
```

### Get Attendance Summary
```
GET /api/attendance/summary/stats?employeeId=emp_123&startDate=2024-01-01&endDate=2024-01-31

Response:
{
  "success": true,
  "data": {
    "totalPresent": 20,
    "totalAbsent": 2,
    "totalLeave": 3,
    "totalLate": 1,
    "totalHalfDay": 0,
    "workingHours": 160,
    "overtimeHours": 8
  }
}
```

### Approve Attendance
```
POST /api/attendance/:id/approve
```

### Get Pending Approvals
```
GET /api/attendance/pending/approvals?page=1&limit=20
```

### Bulk Upsert Attendance
```
POST /api/attendance/bulk/upsert
Content-Type: application/json

{
  "attendances": [
    {
      "employeeId": "emp_123",
      "date": "2024-01-15",
      "status": "present",
      "checkInTime": "2024-01-15T09:00:00Z",
      "checkOutTime": "2024-01-15T17:30:00Z"
    }
  ]
}
```

## Request Headers

```
Authorization: Bearer <jwt_token>
X-Org-ID: <organization_id>          (Required)
X-User-ID: <user_id>                 (Optional, defaults to token user)
X-User-Email: <user_email>           (Optional)
```

## Database Schema

### Attendance Collection

```typescript
{
  _id: ObjectId,
  employeeId: String (indexed),
  organizationId: String (indexed),
  date: Date (indexed),
  checkInTime?: Date,
  checkOutTime?: Date,
  status: "present" | "absent" | "leave" | "half-day" | "late",
  leaveType?: "sick" | "casual" | "earned" | "unpaid" | "maternity" | "other",
  remarks?: String,
  approvedBy?: String,
  approvedAt?: Date,
  isApproved: Boolean (indexed),
  workHours: Number (default: 8),
  overtime: Number (default: 0),
  createdBy?: String,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
- { organizationId: 1, employeeId: 1, date: 1 } (unique per org/employee/date)
- { organizationId: 1, date: -1 }
- { organizationId: 1, isApproved: 1 }
```

## Environment Variables

```env
# Server
PORT=3003
NODE_ENV=development

# Database
MONGODB_URI=mongodb://admin:password123@mongodb:27017/hrms_attendance?authSource=admin

# gRPC
GRPC_ATTENDANCE_PORT=5003

# JWT (for token validation)
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=3600

# CORS
CORS_ORIGIN=*
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
PORT=3003
MONGODB_URI=mongodb://localhost:27017/hrms_attendance
GRPC_ATTENDANCE_PORT=5003
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### 3. Start Service
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### 4. Health Check
```bash
curl http://localhost:3003/health
curl http://localhost:3003/ready
```

## Attendance Status Determination

The service automatically determines attendance status based on check-in time:

- **Present**: Check-in before 9:30 AM
- **Late**: Check-in after 9:30 AM
- **Absent**: No check-in recorded
- **Leave**: Explicitly marked as leave with leave type
- **Half-day**: Explicitly marked as half-day

## Working Hours Calculation

Working hours are calculated as:
```
workingHours = (checkOutTime - checkInTime) / 60 minutes / 60 seconds
```

## Tenant Isolation

All operations are scoped to the organization/tenant:

1. **Request Validation**: Every request must include organization context (from JWT or headers)
2. **Query Filtering**: All database queries automatically filter by `organizationId`
3. **Cross-Tenant Protection**: Attempting to access another tenant's data returns 403 Forbidden
4. **Indexes**: Compound indexes ensure efficient tenant-scoped queries

## CQRS Pattern

The service implements Command Query Responsibility Segregation:

**Commands** (write operations):
- `CreateAttendanceCommand`
- `UpdateAttendanceCommand`
- `DeleteAttendanceCommand`
- `ApproveAttendanceCommand`
- `BulkUpsertAttendanceCommand`

**Queries** (read operations):
- `GetAttendanceByDateRangeCommand`
- `GetAttendanceSummaryCommand`

Each command has a corresponding handler that executes the business logic.

## Error Handling

All errors follow a standard format:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "code": "ERROR_CODE"
}
```

Common error codes:
- `ATTENDANCE_NOT_FOUND` (404)
- `DUPLICATE_ATTENDANCE` (409)
- `INVALID_DATE_RANGE` (400)
- `MISSING_ORG_ID` (400)
- `CROSS_TENANT_ACCESS_DENIED` (403)
- `INTERNAL_SERVER_ERROR` (500)

## Logging

Structured logging is implemented across the service:

```typescript
logger.info("Operation description", { data: "context" })
logger.warn("Warning message", { data: "context" })
logger.error("Error occurred", error)
logger.debug("Debug info", { data: "context" })
```

Logs include timestamp, service name, and contextual data.

## Testing

Run tests:
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:cov           # With coverage
```

## gRPC Service

The service exposes a gRPC interface for inter-service communication:

### Methods
- `CreateAttendance`
- `GetAttendanceById`
- `GetAttendanceByDateRange`
- `UpdateAttendance`
- `DeleteAttendance`
- `ApproveAttendance`
- `GetAttendanceSummary`
- `BulkUpsertAttendance`
- `GetPendingApprovals`

See [attendance.proto](../../proto/attendance.proto) for message definitions.

## Performance Considerations

1. **Indexing**: Strategic indexes on `organizationId`, `date`, and `isApproved` for fast queries
2. **Bulk Operations**: `BulkUpsertAttendance` uses MongoDB bulk write for efficiency
3. **Pagination**: Date range queries support pagination to limit response size
4. **Aggregation**: Summary calculations done in application layer (can be optimized with MongoDB aggregation pipeline)

## Future Enhancements

- [ ] Export attendance to CSV/Excel
- [ ] Advanced filtering and search
- [ ] Integration with payroll system
- [ ] Mobile app support
- [ ] Real-time notifications for approvals
- [ ] Geolocation-based attendance
- [ ] Biometric integration
- [ ] Analytics dashboard

## Security Considerations

✅ **Multi-tenancy**: Complete tenant isolation
✅ **Authentication**: JWT token validation required
✅ **Authorization**: Role-based access control (via future auth service)
✅ **Data Validation**: Input sanitization and validation
✅ **Error Handling**: Safe error messages without exposing internals
✅ **Logging**: Audit trail of all operations
⚠️ **TLS**: gRPC over insecure channel (enable TLS in production)

## Contributing

1. Follow TypeScript best practices
2. Maintain clean architecture principles
3. Add tests for new features
4. Update documentation
5. Follow commit message conventions

## Support

For issues or questions, contact the development team.

## License

ISC
