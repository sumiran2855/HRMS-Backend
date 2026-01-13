# Auth Service – HRM Microservice Backend

This repository contains the **Authentication Service** for the HRM Microservice Backend.  
It is built using **Node.js, TypeScript, Express**, and follows **Clean Architecture + DDD (Domain-Driven Design)** principles.

---

## 📌 Responsibilities

The Auth Service is responsible for:

- User authentication (login)
- Password hashing & verification
- JWT token generation & validation
- Authentication middleware
- Secure interaction with MongoDB
- Separation of domain, application, and infrastructure layers

---

## 🏗️ Architecture Overview

The service follows a **layered architecture**



---

## 🔐 Authentication Flow (Login)

1. HTTP request hits `AuthController`
2. Controller validates input (DTO)
3. `LoginUserCommand` is created
4. `LoginUserHandler` executes business logic
5. User is fetched via `UserRepositoryPort`
6. Password is verified using `PasswordHasher`
7. JWT token is generated
8. Response returned to client

---

## ⚙️ Tech Stack

- **Node.js**
- **TypeScript**
- **Express.js**
- **MongoDB**
- **JWT**
- **InversifyJS (DI)**
- **Jest (Testing)**
- **Docker**

---

## 🚀 Getting Started

### 1️⃣ Install dependencies
```bash
npm install
:

