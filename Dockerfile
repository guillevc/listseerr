# ============================================
# Stage 1: Build
# ============================================
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json bun.lockb ./

# Install ALL dependencies (including dev deps for build)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build client and server
RUN bun run build:client && bun run build:server

# ============================================
# Stage 2: Runtime
# ============================================
FROM oven/bun:1-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV LOG_LEVEL=info
ENV PORT=3000
ENV DATABASE_PATH=/app/data/listseerr.db

# Copy package.json and lockfile for production deps
COPY package.json bun.lockb ./

# Install ONLY production dependencies
RUN bun install --frozen-lockfile --production

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Copy migration files (required at runtime)
COPY --from=builder /app/src/server/db/migrations ./src/server/db/migrations

# Copy env.ts (required for environment validation)
COPY --from=builder /app/src/server/env.ts ./src/server/env.ts

# Create data directory with proper permissions
RUN mkdir -p /app/data && \
    chown -R bun:bun /app/data

# Switch to non-root user for security
USER bun

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun run -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1))"

# Start the server
CMD ["bun", "run", "dist/index.js"]
