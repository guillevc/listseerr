FROM oven/bun:1-alpine AS base
WORKDIR /app

FROM base AS install

RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production
RUN bun run build

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/dist ./dist
COPY --from=prerelease /app/src/server/db/migrations ./migrations

RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/listseerr.db
ENV MIGRATIONS_FOLDER=/app/migrations

USER bun
EXPOSE 3000/tcp

CMD ["bun", "run", "./dist/index.js"]
