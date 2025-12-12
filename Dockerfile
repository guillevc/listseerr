# Build stage
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Copy and build
COPY package.json bun.lock ./
COPY packages ./packages
RUN bun install --frozen-lockfile && bun run build

# Production stage - minimal image
FROM oven/bun:1-alpine
WORKDIR /app

# Copy only built artifacts (no node_modules!)
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

USER bun
EXPOSE 3000/tcp

CMD ["bun", "./dist/index.js"]
