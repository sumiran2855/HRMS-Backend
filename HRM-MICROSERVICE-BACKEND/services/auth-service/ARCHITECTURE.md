# Auth Service - Microservice Architecture

Microservice implementation following **Clean Architecture** and **Layered Architecture** patterns.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERFACES LAYER                         │
│  (HTTP Controllers, Routes, Middleware, DTOs)               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                          │
│  (Use Cases, Commands, Services, Handlers)                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    DOMAIN LAYER                             │
│  (Entities, Value Objects, Repositories Interfaces)         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                        │
│  (Database, Authentication, External Services)              │
└─────────────────────────────────────────────────────────────┘
```

## Folder Structure

```
src/
├── app.ts                      # Express application factory
├── server.ts                   # Server bootstrap and startup
├── application/                # Application/Use Case layer
│   ├── commands/               # Command objects
│   ├── handlers/               # Command handlers
│   ├── ports/                  # Port interfaces
│   └── services/               # Application services
├── domain/                     # Domain/Business logic layer
│   ├── entities/               # Domain entities
│   ├── models/                 # Domain models
│   ├── repositories/           # Repository interfaces
│   └── value-objects/          # Value objects
├── infrastructure/             # Infrastructure layer
│   ├── database/               # Database connections
│   ├── persistence/            # Repository implementations
│   └── security/               # Security utilities
├── interfaces/                 # Interfaces/Presentation layer
│   ├── dtos/                   # Data Transfer Objects
│   └── http/
│       ├── controllers/        # HTTP controllers
│       ├── middleware/         # Express middleware
│       └── routes/             # Route definitions
├── bootstrap/                  # Application bootstrap
│   ├── app.bootstrap.ts        # App initialization (new)
│   ├── container.bootstrap.ts  # IoC container setup
│   ├── db.bootstrap.ts         # Database initialization
│   └── http.bootstrap.ts       # HTTP server setup (deprecated)
├── config/                     # Configuration
│   └── env.config.ts           # Environment variables
└── shared/                     # Shared utilities & constants
    ├── constants/              # Constants
    │   └── messages.constant.ts
    ├── types/                  # Common types
    │   └── common.type.ts
    └── utils/                  # Utility functions
        ├── logger.util.ts
        ├── error-handler.util.ts
        └── response-formatter.util.ts
```

## Key Features

### 1. **Layered Architecture**
- **Interfaces Layer**: HTTP endpoints, controllers, middleware
- **Application Layer**: Business logic, services, use cases
- **Domain Layer**: Core business rules, entities
- **Infrastructure Layer**: Database, external services

### 2. **Professional Error Handling**
- Centralized error handling with `ErrorHandler`
- Custom `AppError` class for application-specific errors
- Request ID tracking for debugging
- Environment-aware error responses

### 3. **Standardized API Responses**
- `ResponseFormatter` for consistent response format
- Success and error response templates
- Paginated response support

### 4. **Logging**
- Centralized `Logger` class
- Context-based logging with timestamps
- Support for different log levels (info, warn, error, debug)

### 5. **Middleware Stack**
- `authMiddleware`: JWT token validation
- `optionalAuthMiddleware`: Optional authentication
- `validateRequestBody`: Field validation
- `trimRequestBody`: String trimming
- Request ID tracking
- Security headers (Helmet)
- CORS configuration

### 6. **Dependency Injection**
- Inversify IoC container
- Singleton scope for services
- Clean constructor injection

### 7. **Graceful Shutdown**
- Proper cleanup on SIGTERM/SIGINT
- 30-second shutdown timeout
- Uncaught exception handling

## Getting Started

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hrms_auth
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h
BCRYPT_ROUNDS=10
CORS_ORIGIN=*
DEBUG=false
```

### Development

```bash
npm run dev
```

### Building

```bash
npm run build
```

### Production

```bash
npm start
```

### Testing

```bash
npm test
npm run test:watch
npm run test:cov
```

## API Endpoints

### Public Routes

#### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "ok",
  "service": "auth-service",
  "timestamp": "2026-01-13T10:30:00.000Z",
  "environment": "development"
}
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password",
  "fullName": "John Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

#### Validate Token
```http
POST /api/auth/validate-token
Content-Type: application/json
Authorization: Bearer <token>
```

### Protected Routes

#### Get Current User
```http
GET /api/auth/current-user
Authorization: Bearer <token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

#### Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Login successful",
  "statusCode": 200,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "123",
      "email": "user@example.com"
    }
  },
  "timestamp": "2026-01-13T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid credentials",
  "statusCode": 401,
  "requestId": "1234567890-abc",
  "timestamp": "2026-01-13T10:30:00.000Z"
}
```

## Best Practices

1. **Error Handling**: Always throw `AppError` for known application errors
2. **Logging**: Use logger instance for all logging needs
3. **Validation**: Use middleware to validate inputs before controller
4. **Response**: Use `ResponseFormatter` for all responses
5. **Dependency Injection**: Inject dependencies via constructor
6. **Constants**: Use constants from `shared/constants` for magic strings
7. **Types**: Use TypeScript interfaces for type safety
8. **Middleware**: Apply middleware to routes that need it

## Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Password Hashing**: bcryptjs
- **DI Container**: Inversify
- **Security**: Helmet, CORS
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier

## Contributing

Follow the established architecture patterns and coding standards.

## License

ISC
