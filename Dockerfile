FROM oven/bun:1-alpine AS base
WORKDIR /app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
ENV NODE_ENV=production
RUN bun run build

FROM base AS release
RUN mkdir -p /app/data
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/dist .
COPY --from=prerelease /app/src/server/db/migrations .
COPY --from=prerelease /app/src/server/env.ts .

USER bun
EXPOSE 3000/tcp

CMD ["bun", "run", "dist/index.js"]
