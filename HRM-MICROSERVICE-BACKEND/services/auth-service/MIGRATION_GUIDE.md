# 🔄 Migration Guide - Apply This Pattern to Other Services

This guide shows how to apply the professional architecture pattern used in auth-service to your other microservices.

---

## 📋 Folder Structure Template

Copy this structure to your other services:

```
your-service/
├── src/
│   ├── app.ts ⭐ REQUIRED
│   ├── server.ts ⭐ REQUIRED
│   │
│   ├── application/
│   │   ├── commands/
│   │   ├── handlers/
│   │   ├── ports/
│   │   └── services/
│   │
│   ├── domain/
│   │   ├── entities/
│   │   ├── models/
│   │   ├── repositories/
│   │   └── value-objects/
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   ├── persistence/
│   │   └── security/
│   │
│   ├── interfaces/
│   │   ├── dtos/
│   │   └── http/
│   │       ├── controllers/
│   │       ├── middleware/
│   │       └── routes/
│   │
│   ├── bootstrap/
│   │   ├── container.bootstrap.ts
│   │   └── db.bootstrap.ts
│   │
│   ├── config/
│   │   └── env.config.ts
│   │
│   └── shared/ ⭐ REQUIRED
│       ├── constants/
│       │   └── messages.constant.ts
│       ├── types/
│       │   └── common.type.ts
│       └── utils/
│           ├── logger.util.ts
│           ├── error-handler.util.ts
│           └── response-formatter.util.ts
```

---

## 📁 Step-by-Step Migration

### Step 1: Copy Shared Utilities

Copy these files from auth-service to your service:

```bash
src/shared/
├── constants/messages.constant.ts
├── types/common.type.ts
└── utils/
    ├── logger.util.ts
    ├── error-handler.util.ts
    └── response-formatter.util.ts
```

**No modifications needed** - they're generic and reusable.

### Step 2: Create New app.ts

Copy from auth-service and modify if needed:

```typescript
import 'reflect-metadata';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { container } from './bootstrap/container.bootstrap';
import { registerYourRoutes } from './interfaces/http/routes/your.routes';
import { envConfig } from './config/env.config';
import { Logger } from './shared/utils/logger.util';
import { ErrorHandler } from './shared/utils/error-handler.util';

const logger = new Logger('AppBootstrap');

export function createApp(): Express {
  const app = express();

  // Trust proxy
  app.set('trust proxy', 1);

  // Security
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  }));

  // Body parsers
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Request logging
  app.use((req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    });
    next();
  });

  // Request ID
  app.use((req, res, next) => {
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    (req as any).id = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'your-service', // Change this
      timestamp: new Date().toISOString(),
      environment: envConfig.nodeEnv,
    });
  });

  // Routes
  registerYourRoutes(app, container); // Change this

  // 404
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      statusCode: 404,
    });
  });

  // Error handler
  app.use((err: any, req, res, next) => {
    ErrorHandler.handle(err, req, res, logger);
  });

  return app;
}

export default createApp;
```

### Step 3: Create New server.ts

Copy from auth-service:

```typescript
import 'reflect-metadata';
import { createApp } from './app';
import { initializeDatabase } from './bootstrap/db.bootstrap';
import { envConfig } from './config/env.config';
import { Logger } from './shared/utils/logger.util';

const logger = new Logger('Server');

async function bootstrap(): Promise<void> {
  try {
    logger.info(`Starting Service in ${envConfig.nodeEnv} environment...`);

    logger.info('Initializing database connection...');
    await initializeDatabase();
    logger.info('Database connected successfully');

    const app = createApp();

    const port = envConfig.port || 3001;
    const server = app.listen(port, () => {
      logger.info(`✓ Service running on port ${port}`);
    });

    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);
      server.close(async () => {
        logger.info('HTTP server closed');
        try {
          logger.info('All resources cleaned up');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', error);
      process.exit(1);
    });
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

bootstrap();
```

### Step 4: Update Bootstrap Files

**container.bootstrap.ts** - Register YOUR service dependencies:

```typescript
import 'reflect-metadata';
import { Container } from 'inversify';
// Import YOUR repositories, services, controllers

export function buildContainer(): Container {
  const container = new Container();

  // Register YOUR dependencies here
  // Example:
  // container.bind<IYourRepository>('YourRepository')
  //   .to(YourRepository)
  //   .inSingletonScope();

  return container;
}

export const container = buildContainer();
```

**db.bootstrap.ts** - Keep as is (just update logging):

```typescript
import { connectToDatabase } from '../infrastructure/database/your-connection';
import { Logger } from '../shared/utils/logger.util';

const logger = new Logger('DatabaseBootstrap');

export async function initializeDatabase(): Promise<void> {
  try {
    await connectToDatabase();
    logger.info('Database initialization completed successfully');
  } catch (error) {
    logger.error('Database initialization failed', error);
    throw error;
  }
}
```

### Step 5: Update Routes

Example for your service routes:

```typescript
import { Container } from 'inversify';
import express, { Router, Request, Response } from 'express';
import { YourController } from '../controllers/Your.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequestBody, trimRequestBody } from '../middleware/validation.middleware';

export function registerYourRoutes(app: express.Application, container: Container): void {
  const router = Router();

  /**
   * Example public route
   */
  router.post(
    '/create',
    trimRequestBody,
    validateRequestBody(['name', 'description']),
    async (req: Request, res: Response, next) => {
      try {
        const controller = container.get(YourController);
        await controller.create(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * Example protected route
   */
  router.get(
    '/detail/:id',
    authMiddleware,
    async (req: Request, res: Response, next) => {
      try {
        const controller = container.get(YourController);
        await controller.getDetail(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  app.use('/api/your-service', router); // Change prefix
}
```

### Step 6: Update Controllers

Use this pattern for your controllers:

```typescript
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { IYourService } from '../../../application/services/your.service';
import { ResponseFormatter } from '../../../shared/utils/response-formatter.util';
import { Logger } from '../../../shared/utils/logger.util';
import { ERROR_MESSAGES, HTTP_STATUS } from '../../../shared/constants/messages.constant';
import { AppError } from '../../../shared/utils/error-handler.util';

@injectable()
export class YourController {
  private logger = new Logger('YourController');

  constructor(@inject('YourService') private yourService: IYourService) {}

  async create(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id;

    try {
      this.logger.debug(`[${requestId}] Create request:`, req.body);

      const result = await this.yourService.create(req.body);

      this.logger.info(`[${requestId}] Created successfully`);

      res.status(HTTP_STATUS.CREATED).json(
        ResponseFormatter.success(result, 'Created successfully', HTTP_STATUS.CREATED)
      );
    } catch (error: any) {
      this.logger.error(`[${requestId}] Create error:`, error);

      const appError = error instanceof AppError
        ? error
        : new AppError(ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);

      throw appError;
    }
  }
}
```

### Step 7: Create Custom Middleware (if needed)

```typescript
import { Request, Response, NextFunction } from 'express';
import { Logger } from '../../../shared/utils/logger.util';
import { AppError } from '../../../shared/utils/error-handler.util';
import { HTTP_STATUS } from '../../../shared/constants/messages.constant';

const logger = new Logger('YourMiddleware');

export function yourCustomMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Your middleware logic
    next();
  } catch (error) {
    next(error);
  }
}
```

### Step 8: Add Documentation

Copy and adapt these files:

```bash
cp auth-service/ARCHITECTURE.md your-service/ARCHITECTURE.md
cp auth-service/DEVELOPMENT_GUIDE.md your-service/DEVELOPMENT_GUIDE.md
# Edit service-specific details
```

---

## 🔧 Common Patterns

### Creating a Service with Logging

```typescript
import { injectable, inject } from 'inversify';
import { IYourRepository } from '../repositories/your.repository';
import { Logger } from '../../shared/utils/logger.util';
import { AppError } from '../../shared/utils/error-handler.util';
import { HTTP_STATUS } from '../../shared/constants/messages.constant';

@injectable()
export class YourService {
  private logger = new Logger('YourService');

  constructor(@inject('YourRepository') private repo: IYourRepository) {}

  async create(data: any): Promise<any> {
    try {
      this.logger.info('Creating item', { data });

      const result = await this.repo.create(data);

      this.logger.info('Item created', { id: result.id });
      return result;
    } catch (error: any) {
      this.logger.error('Create failed', error);

      throw new AppError(
        error.message || 'Failed to create',
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }
}

export interface IYourService {
  create(data: any): Promise<any>;
}
```

### Using ResponseFormatter

```typescript
// Success
res.json(ResponseFormatter.success(data, 'Success message', 200));

// Error
res.json(ResponseFormatter.error('Error message', 400));

// Paginated
res.json(ResponseFormatter.paginated(
  data,
  total,
  page,
  limit,
  'Data fetched'
));
```

### Using AppError

```typescript
// Throw application error
throw new AppError(
  ERROR_MESSAGES.USER_NOT_FOUND,
  HTTP_STATUS.NOT_FOUND
);

// Throw with custom message
throw new AppError(
  'Custom error message',
  HTTP_STATUS.BAD_REQUEST
);
```

### Using Logger

```typescript
const logger = new Logger('YourModule');

logger.info('Info message', { data: 'value' });
logger.warn('Warning message', { data: 'value' });
logger.error('Error message', error);
logger.debug('Debug message', { data: 'value' }); // Shows only if DEBUG=true
```

---

## ✅ Checklist for Migration

### Pre-Migration
- [ ] Review auth-service structure
- [ ] Understand layered architecture
- [ ] Review design patterns used

### Copy Phase
- [ ] Copy shared utilities (no changes)
- [ ] Copy app.ts (update service name)
- [ ] Copy server.ts (no changes usually)
- [ ] Update bootstrap files

### Refactor Phase
- [ ] Update all controllers to use ErrorHandler
- [ ] Update all routes to use middleware
- [ ] Add request ID tracking
- [ ] Update responses to use ResponseFormatter
- [ ] Replace magic strings with constants
- [ ] Add logging throughout

### Testing Phase
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Test error handling
- [ ] Test middleware
- [ ] Verify request IDs in responses

### Documentation Phase
- [ ] Update ARCHITECTURE.md
- [ ] Update DEVELOPMENT_GUIDE.md
- [ ] Add service-specific notes
- [ ] Update README.md

### Deployment Phase
- [ ] Configure environment variables
- [ ] Test in development
- [ ] Test in staging
- [ ] Deploy to production

---

## 🎯 Benefits After Migration

✅ Consistency across all microservices
✅ Same error handling pattern
✅ Same logging approach
✅ Same response format
✅ Same middleware handling
✅ Easier team onboarding
✅ Better debugging with request IDs
✅ Standardized security measures
✅ Better code organization
✅ Easier testing

---

## 📊 Service Inventory Template

Create this file to track migration progress:

**SERVICES_MIGRATION_STATUS.md**

```markdown
# Microservices Migration Status

| Service | Status | Completion | Notes |
|---------|--------|------------|-------|
| auth-service | ✅ Complete | 100% | Reference implementation |
| user-service | 🔄 In Progress | 60% | Controllers updated |
| order-service | ⏳ Pending | 0% | Queued for migration |
| payment-service | ⏳ Pending | 0% | Queued for migration |
| notification-service | ⏳ Pending | 0% | Queued for migration |

Legend:
✅ Complete - Fully migrated and tested
🔄 In Progress - Currently being migrated
⏳ Pending - Waiting to be started
```

---

## 🚀 Quick Migration Script

Create a script to speed up migration:

**migrate-service.sh**
```bash
#!/bin/bash

SERVICE_NAME=$1
SOURCE_SERVICE="auth-service"
TARGET_SERVICE=$SERVICE_NAME

echo "Migrating $SOURCE_SERVICE pattern to $TARGET_SERVICE..."

# Copy shared utilities
cp -r services/$SOURCE_SERVICE/src/shared/* \
  services/$TARGET_SERVICE/src/shared/

# Copy app.ts and server.ts
cp services/$SOURCE_SERVICE/src/app.ts \
  services/$TARGET_SERVICE/src/app.ts

cp services/$SOURCE_SERVICE/src/server.ts \
  services/$TARGET_SERVICE/src/server.ts

echo "✅ Migration scaffolding complete!"
echo "📝 Next steps:"
echo "1. Update app.ts service name"
echo "2. Update bootstrap files"
echo "3. Update controllers to use new patterns"
echo "4. Update routes with middleware"
echo "5. Run tests"
```

---

## 💡 Pro Tips

### 1. Start with Copy
Copy from auth-service first, then modify. Don't rewrite from scratch.

### 2. Update Gradually
Migrate one service at a time to avoid disruption.

### 3. Test Thoroughly
Add tests for each refactored component.

### 4. Document Changes
Keep track of what you changed and why.

### 5. Review Code
Have team members review the migrated code.

### 6. Share Knowledge
Train team members on the new patterns.

---

## 📞 Common Issues During Migration

### Issue: Module Not Found
```typescript
// Make sure paths are correct
import { Logger } from '../../../shared/utils/logger.util';
// Count dots carefully!
```

### Issue: DI Container Not Working
```typescript
// Ensure services are registered in container.bootstrap.ts
container.bind<IService>('Service').to(Service).inSingletonScope();
```

### Issue: Middleware Not Executing
```typescript
// Ensure middleware is applied before route handler
router.post('/route',
  middleware1,
  middleware2,
  async (req, res, next) => { ... }
);
```

### Issue: Error Not Being Caught
```typescript
// Always wrap in try-catch and call next(error)
try {
  // Code
} catch (error) {
  next(error); // Don't forget this!
}
```

---

## 🎓 Learning Resources

1. **ARCHITECTURE.md** - Understand the pattern
2. **auth-service code** - Study the reference implementation
3. **SETUP_GUIDE.md** - Learn about changes made
4. **DEVELOPMENT_GUIDE.md** - Best practices

---

**Happy migrating! Your microservices will be production-ready in no time.** 🚀

Once you've migrated all services, your entire microservice ecosystem will follow the same professional patterns. This ensures consistency, maintainability, and quality across all services.
