# AGENTS.md

## Development instructions

- Run after code changes:
  - `bun run lint --fix`
  - `bun run format`
  - `bun run typecheck`
- Do not modify `AGENTS.md` file without explicit user approval.
- Use latest language, framework and tool features:
  - Typescript 5.9
  - Bun 1.3
  - Hono 4.10
  - React 19.2
  - TailwindCSS 4.1
  - Look up used versions of more dependencies in every `package.json` file.
- In case of database migrations needed, use [MIGRATIONS.md](./docs/MIGRATIONS.md) as a reference: @/docs/MIGRATIONS.md

## Architecture instructions

Refer to [ARCHITECTURE.md](./docs/ARCHITECTURE.md) and use it as a guideline for every task: @/docs/ARCHITECTURE.md
