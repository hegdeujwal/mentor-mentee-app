import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

// E2E runs against a production build on its own SQLite file, reset and seeded for every run.
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1, // the tests share one database
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `node scripts/prepare-e2e-db.mjs && npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 300_000,
    reuseExistingServer: false,
    env: { DATABASE_URL: "file:./e2e.db", AUTH_TRUST_HOST: "true" },
  },
});
