// Captures the screenshots used in the project report from a running instance.
// Usage: BASE_URL=http://localhost:3200 node scripts/capture-screenshots.mjs <output-dir>
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = process.argv[2] ?? "screenshots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const desktop = { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5 };
const mobile = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

async function shot(page, name, { fullPage = false } = {}) {
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage, caret: "initial" });
  console.log("saved", name);
}

async function session(options, email, password) {
  const context = await browser.newContext(options);
  const page = await context.newPage();
  if (email) {
    await page.goto(`${BASE}/login`);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL(/\/(mentee|mentor|admin|hod)$/);
  }
  return { context, page };
}

// Public pages
{
  const { context, page } = await session(desktop);
  await page.goto(BASE);
  await shot(page, "01-landing");
  await page.goto(`${BASE}/login`);
  await shot(page, "02-login");
  await page.goto(`${BASE}/register`);
  await page.getByLabel("Full name").fill("A");
  await page.getByLabel("College email").fill("not-an-email");
  await page.getByRole("button", { name: "Create account" }).click();
  await shot(page, "03-register-validation");
  await context.close();
}

// Mentee
{
  const { context, page } = await session(desktop, "mentee09@demo.college.test", "Mentee@12345");
  await shot(page, "04-mentee-overview");
  await page.goto(`${BASE}/mentee/profile`);
  await shot(page, "05-mentee-profile");
  await page.goto(`${BASE}/mentee/feedback`);
  await shot(page, "06-mentee-feedback");
  await context.close();
}

// Mentor
{
  const { context, page } = await session(desktop, "mentor1@demo.college.test", "Mentor@12345");
  await shot(page, "07-mentor-overview");
  await page.goto(`${BASE}/mentor/mentees`);
  await shot(page, "08-mentor-mentees");
  await page.getByLabel("Status").selectOption("ENDORSED");
  await page.getByRole("button", { name: "Apply" }).click();
  await page.waitForURL(/status=ENDORSED/);
  await shot(page, "09-mentor-mentees-filtered");
  await page.goto(`${BASE}/mentor/mentees`);
  await page.getByRole("link", { name: "Asha Demo" }).click();
  await page.getByRole("heading", { name: "Asha Demo" }).waitFor();
  await shot(page, "10-mentor-mentee-detail", { fullPage: true });
  await context.close();
}

// Administrator
{
  const { context, page } = await session(desktop, "admin@demo.college.test", "Admin@12345");
  await shot(page, "11-admin-overview");
  await page.goto(`${BASE}/admin/reviews`);
  await shot(page, "12-admin-review-queue");
  await page.getByRole("link", { name: "Gauri Fixture" }).first().click();
  await page.getByRole("heading", { name: "Review this profile" }).waitFor();
  await shot(page, "13-admin-review-form");
  await page.goto(`${BASE}/admin/users`);
  await shot(page, "14-admin-users");
  await page.goto(`${BASE}/admin/assignments`);
  await shot(page, "15-admin-assignments");
  await page.goto(`${BASE}/admin/import`);
  const csv = [
    "name,email,usn,department,semester,section,mentor_email",
    "Riya Imported,riya.imported@example.edu,DEMO23IS201,ISE,3,A,mentor3@demo.college.test",
    "Sam Imported,sam.imported@example.edu,DEMO23IS202,ISE,3,B,",
    "Bad Row,not-an-email,DEMO23IS203,ISE,3,A,",
  ].join("\n");
  await page.getByLabel("CSV file").setInputFiles({ name: "batch.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
  await page.getByRole("button", { name: "Import mentees" }).click();
  await page.getByText(/Imported \d+ mentee/).waitFor();
  await shot(page, "16-admin-csv-import", { fullPage: true });
  await page.goto(`${BASE}/admin/audit`);
  await shot(page, "17-admin-audit-log");
  await context.close();
}

// HOD
{
  const { context, page } = await session(desktop, "hod@demo.college.test", "Hod@12345");
  await shot(page, "18-hod-dashboard", { fullPage: true });
  await page.goto(`${BASE}/hod/mentees`);
  await shot(page, "19-hod-mentees");
  const download = page.waitForEvent("download");
  await page.goto(`${BASE}/hod`);
  await page.getByRole("link", { name: "Export PDF" }).click();
  await (await download).saveAs(path.join(OUT, "hod-summary.pdf"));
  console.log("saved hod-summary.pdf");
  await context.close();
}

// Access control: mentor 1 tries to open a mentee assigned to mentor 2
{
  const m2 = await session(desktop, "mentor2@demo.college.test", "Mentor@12345");
  await m2.page.goto(`${BASE}/mentor/mentees`);
  const href = await m2.page.getByRole("link", { name: "Bharat Sample" }).getAttribute("href");
  await m2.context.close();
  const { context, page } = await session(desktop, "mentor1@demo.college.test", "Mentor@12345");
  await page.goto(BASE + href);
  await page.getByRole("heading", { name: "Page not found" }).waitFor();
  await shot(page, "20-access-denied");
  await context.close();
}

// Mobile layouts
{
  const { context, page } = await session(mobile, "mentee09@demo.college.test", "Mentee@12345");
  await shot(page, "21-mobile-mentee-overview");
  await page.getByRole("button", { name: "Menu" }).click();
  await shot(page, "22-mobile-menu-open");
  await context.close();
}
{
  const { context, page } = await session(mobile, "hod@demo.college.test", "Hod@12345");
  await shot(page, "23-mobile-hod-dashboard");
  await context.close();
}

await browser.close();
