# Employee Service

Employee Management Microservice for HRMS System

## Features

- Employee CRUD operations
- Employee profile management
- Department management
- Kafka-based event streaming
- JWT authentication
- MongoDB persistence

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/employees` - Create employee
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

## Architecture

- **Application Layer**: Business logic and use cases
- **Domain Layer**: Core business entities and rules
- **Infrastructure Layer**: Database, external services
- **Interfaces Layer**: HTTP controllers and routes
- **Shared Layer**: Common utilities, constants, types
