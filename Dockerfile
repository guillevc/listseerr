# Build stage
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Copy all workspace files
COPY package.json bun.lock ./
COPY packages ./packages

# Install all dependencies and build
RUN bun install --frozen-lockfile && \
    bun run build

# Production stage
FROM oven/bun:1-alpine AS release
WORKDIR /app

# Copy package files for production install
COPY package.json bun.lock ./
COPY packages/api-contract/package.json ./packages/api-contract/
COPY packages/client/package.json ./packages/client/
COPY packages/server/package.json ./packages/server/
COPY packages/shared/package.json ./packages/shared/

# Install only production dependencies
RUN bun install --frozen-lockfile --production

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/packages/server/migrations ./migrations

# Create data directory
RUN mkdir -p /app/data

# Environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info \
    DATABASE_PATH=/app/data/listseerr.db \
    MIGRATIONS_FOLDER=/app/migrations

# Run as non-root user
USER bun
EXPOSE 3000/tcp

CMD ["bun", "./dist/index.js"]
