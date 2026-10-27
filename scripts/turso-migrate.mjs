// Applies prisma/migrations/*/migration.sql to the Turso database in order.
// `prisma migrate deploy` cannot talk to Turso directly, so applied migrations
// are tracked in a small table of our own. Safe to re-run: each migration runs once.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
if (!url) {
  console.error("TURSO_DATABASE_URL is not set.");
  process.exit(1);
}
const db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });

await db.execute(
  'CREATE TABLE IF NOT EXISTS "_turso_migrations" ("name" TEXT PRIMARY KEY, "appliedAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)',
);
const applied = new Set((await db.execute('SELECT "name" FROM "_turso_migrations"')).rows.map((r) => r.name));

const dir = path.join("prisma", "migrations");
const pending = readdirSync(dir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !applied.has(e.name))
  .map((e) => e.name)
  .sort();

for (const name of pending) {
  const sql = readFileSync(path.join(dir, name, "migration.sql"), "utf8");
  // migrate() runs the script with foreign keys off, as Prisma's SQLite migrations expect.
  await db.migrate([...splitStatements(sql), { sql: 'INSERT INTO "_turso_migrations" ("name") VALUES (?)', args: [name] }]);
  console.log(`applied ${name}`);
}
console.log(pending.length ? `${pending.length} migration(s) applied.` : "Database is up to date.");

/** Splits a migration script on statement-ending semicolons, dropping comment-only chunks. */
function splitStatements(sql) {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
    .filter(Boolean);
}
