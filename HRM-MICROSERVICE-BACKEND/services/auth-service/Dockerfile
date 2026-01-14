# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root tsconfig and service files
COPY tsconfig.base.json ./
COPY services/auth-service/tsconfig.json ./tsconfig.json

# Copy package files
COPY services/auth-service/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY services/auth-service/src ./src

# Copy proto files
COPY services/proto ./proto

# Build TypeScript
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY services/auth-service/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy proto files for gRPC
COPY services/proto ./proto

# Expose ports
EXPOSE 3001 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "dist/server.js"]
