# Database Migrations Guide

## Project Migration Setup

### Structure

```
packages/server/
├── drizzle.config.ts          # Drizzle Kit configuration
├── migrations/                 # Generated migration files
│   ├── 0000_last_northstar.sql    # Initial schema
│   ├── 0001_easy_logan.sql        # Incremental changes
│   ├── ...
│   ├── 0011_busy_gargoyle.sql     # Latest migration
│   └── meta/
│       ├── _journal.json          # Migration registry
│       └── XXXX_snapshot.json     # Schema snapshots
├── src/
│   ├── infrastructure/db/
│   │   ├── schema.ts              # Source of truth (Drizzle ORM)
│   │   └── client.ts              # Database connection
│   └── bootstrap/
│       └── database.ts            # Migration runner
└── scripts/
    ├── migrate.ts                 # Standalone migration script
    └── reset.ts                   # Development reset script
```

### How Migrations Run

1. **Server starts** → calls `runMigrations()` in `src/index.ts:10`
2. **Drizzle migrator** reads `migrations/` folder
3. **Checks `__drizzle_migrations` table** in your SQLite database
4. **Applies only NEW migrations** (not already in that table)
5. **Records each migration** as applied in `__drizzle_migrations`
6. **Server continues** startup after migrations complete

---

## Can We Consolidate Migrations?

### Short Answer

**Before production:** Yes, you can squash all migrations into one.
**After production:** No, you must keep incremental migrations.

### Why?

The `__drizzle_migrations` table tracks applied migrations by filename:

```
| id | hash                | created_at    |
|----|---------------------|---------------|
| 1  | 0000_last_northstar | 1764696599732 |
| 2  | 0001_easy_logan     | 1764717042931 |
| ... |
```

If a user's database has applied `0000` through `0005`, and you consolidate into a new single `0000_consolidated.sql`:

- Drizzle sees `0000_consolidated.sql` as a **new, never-applied migration**
- It tries to run it, which contains `CREATE TABLE` statements
- **Crash:** Tables already exist!

### When You CAN Consolidate

| Scenario                                         | Can Consolidate? |
| ------------------------------------------------ | ---------------- |
| No users have the app installed yet              | Yes              |
| App is in development, you control all databases | Yes              |
| Users have production databases                  | **No**           |
| Self-hosted app with existing installations      | **No**           |

### How to Consolidate (Before Production Only)

```bash
# 1. Delete all migration files
rm -rf packages/server/migrations/*

# 2. Regenerate from current schema (creates single 0000 file)
bun run db:generate

# 3. Reset your development database
bun run db:reset
```

---

## Safe vs Breaking Database Changes

### Safe Changes (Backward Compatible)

| Change Type                 | Example                          | Why Safe                     |
| --------------------------- | -------------------------------- | ---------------------------- |
| **Add nullable column**     | `ALTER TABLE x ADD col TEXT`     | Existing rows get NULL       |
| **Add column with default** | `ADD col INTEGER DEFAULT 0`      | Existing rows get default    |
| **Add new table**           | `CREATE TABLE new_table`         | No impact on existing tables |
| **Add index**               | `CREATE INDEX idx ON table(col)` | Read-only structure          |

### Breaking Changes (Require Migration Strategy)

| Change Type                      | Problem                      | Solution                                  |
| -------------------------------- | ---------------------------- | ----------------------------------------- |
| **Drop column**                  | Old code may reference it    | Deploy code first, migrate later          |
| **Rename column**                | Old code uses old name       | Use alias or two-phase deploy             |
| **Add NOT NULL without default** | Existing rows fail           | Add with default, then alter              |
| **Change column type**           | Data may not convert         | Create new column, migrate data, drop old |
| **Drop table**                   | Foreign keys, app references | Ensure no references first                |

### SQLite-Specific Limitations

SQLite has limited `ALTER TABLE` support:

- Can: `ADD COLUMN`, `RENAME COLUMN`, `RENAME TABLE`
- Cannot: `DROP COLUMN` (directly), `ALTER COLUMN` type

**For unsupported operations, Drizzle generates:**

1. Create new table with desired schema
2. Copy data from old table
3. Drop old table
4. Rename new table to old name

---

## How to Create Migrations

### Workflow

```bash
# 1. Edit your schema file
#    packages/server/src/infrastructure/db/schema.ts

# 2. Generate migration from schema diff
bun run db:generate

# 3. Review generated SQL file in migrations/
#    Check the new XXXX_<name>.sql file

# 4. Apply migration (happens automatically on server start)
#    Or manually: bun run db:migrate

# 5. Test thoroughly before committing
```

### Example: Adding a Column

**1. Edit schema.ts:**

```typescript
export const executionHistory = sqliteTable('execution_history', {
  // existing columns...
  itemsFound: integer('items_found'),
  itemsRequested: integer('items_requested'),
  // NEW: add this column
  itemsSkippedAvailable: integer('items_skipped_available'),
});
```

**2. Run generate:**

```bash
bun run db:generate
```

**3. Drizzle creates migration file:**

```sql
-- 0012_xxx.sql
ALTER TABLE `execution_history` ADD `items_skipped_available` integer;
```

### Commands Reference

| Command               | Purpose                                            |
| --------------------- | -------------------------------------------------- |
| `bun run db:generate` | Diff schema.ts against last snapshot, generate SQL |
| `bun run db:migrate`  | Run pending migrations (also creates default user) |
| `bun run db:reset`    | Delete database + WAL files, re-run migrations     |

---

## Production Migration Patterns

### 1. Additive-Only Pattern (Recommended)

- Only add new tables/columns
- Never remove or rename in the same release
- Old code continues working during rollout

### 2. Two-Phase Migration

**Phase 1:** Add new column, deploy code that writes to both old and new
**Phase 2:** (Later) Drop old column after confirming new is stable

### 3. Feature Flags

- Add new schema behind a feature flag
- Enable flag after migration is proven stable
- Roll back by disabling flag, not reverting migration

---

## Common Issues & Solutions

### "Table already exists"

**Cause:** Database has data but migrations table doesn't match
**Fix:** Either reset database (dev) or manually update `__drizzle_migrations` (careful!)

### "Column not found" after deployment

**Cause:** Code references column that migration hasn't created yet
**Fix:** Deploy migration before code that uses new column

### Migration runs but schema doesn't match

**Cause:** Manual database edits outside of migrations
**Fix:** Generate migration from current schema, or reset database

---

## Best Practices

1. **Never edit existing migration files** - Create new migrations instead
2. **Always additive in production** - Add columns nullable, add with defaults
3. **Test migrations on copy of production data** - Before deploying
4. **Version control migrations** - They're part of your codebase
5. **Review generated SQL** - Before committing the migration
6. **Run `db:generate` after schema changes** - Keep migrations in sync
