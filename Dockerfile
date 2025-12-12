FROM oven/bun:1-alpine AS base
WORKDIR /app

# Install dependencies stage
FROM base AS install

# Copy workspace package files and install dependencies
COPY package.json bun.lock ./
COPY packages/client/package.json ./packages/client/
COPY packages/server/package.json ./packages/server/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies (dev + prod) for building
RUN bun install --frozen-lockfile

# Build stage
FROM base AS prerelease

# Copy installed dependencies
COPY --from=install /app/node_modules ./node_modules

# Copy workspace package files
COPY package.json bun.lock ./
COPY packages/client/package.json ./packages/client/
COPY packages/server/package.json ./packages/server/
COPY packages/shared/package.json ./packages/shared/

# Copy all source code
COPY packages/client ./packages/client
COPY packages/server ./packages/server
COPY packages/shared ./packages/shared

ENV NODE_ENV=production
RUN bun run build

# Production stage - install only production dependencies
FROM base AS prod-deps

COPY package.json bun.lock ./
COPY packages/client/package.json ./packages/client/
COPY packages/server/package.json ./packages/server/
COPY packages/shared/package.json ./packages/shared/

RUN bun install --frozen-lockfile --production

# Final production stage
FROM base AS release

# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy built artifacts
COPY --from=prerelease /app/dist ./dist

# Copy server migrations (needed for runtime database initialization)
COPY --from=prerelease /app/packages/server/migrations ./migrations

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Environment variable defaults (can be overridden at runtime)
ENV NODE_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info \
    DATABASE_PATH=/app/data/listseerr.db \
    MIGRATIONS_FOLDER=/app/migrations

# Run as non-root user (can be overridden with --user flag or UID/GID env vars)
USER bun
EXPOSE 3000/tcp

CMD ["bun", "./dist/index.js"]
