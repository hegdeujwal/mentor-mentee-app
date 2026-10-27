// Builds a fresh, disposable SQLite database for the end-to-end tests.
// Refuses to run against anything other than the e2e database file.
import { rmSync } from "node:fs";
import { execSync } from "node:child_process";

const url = process.env.DATABASE_URL ?? "";
if (url !== "file:./e2e.db") {
  console.error(`Refusing to prepare e2e database for DATABASE_URL=${url}`);
  process.exit(1);
}
for (const suffix of ["", "-journal"]) rmSync(`prisma/e2e.db${suffix}`, { force: true });
execSync("npx prisma migrate deploy", { stdio: "inherit" });
execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
