// Creates .env from .env.example on first install so that
// `npm install && npx prisma migrate dev` works without manual steps.
// An existing .env is never touched.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

if (!existsSync(".env") && existsSync(".env.example")) {
  const secret = randomBytes(32).toString("base64");
  const content = readFileSync(".env.example", "utf8").replace(
    'AUTH_SECRET="replace-me"',
    `AUTH_SECRET="${secret}"`,
  );
  writeFileSync(".env", content);
  console.log("Created .env with a freshly generated AUTH_SECRET.");
}
