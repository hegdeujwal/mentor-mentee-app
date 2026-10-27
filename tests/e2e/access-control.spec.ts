import { expect, test } from "@playwright/test";
import { login, logout, USERS } from "./helpers";

test("roles cannot reach each other's data", async ({ page, request }) => {
  // Anonymous users are sent to the login page.
  await page.goto("/hod");
  await expect(page).toHaveURL(/\/login/);
  expect((await request.get("/hod/export/csv", { maxRedirects: 0 })).status()).not.toBe(200);

  // Find the id of a mentee that belongs to mentor 2.
  await login(page, USERS.mentor2, /\/mentor$/);
  await page.goto("/mentor/mentees");
  const href = await page.getByRole("link", { name: "Bharat Sample" }).getAttribute("href");
  expect(href).toMatch(/\/mentor\/mentees\/.+/);

  // Mentor 1 cannot open that mentee or use the HOD export.
  await logout(page);
  await login(page, USERS.mentor1, /\/mentor$/);
  // The page streams behind loading.tsx, so the not-found UI arrives with HTTP 200;
  // what matters is that none of the mentee's data is rendered.
  await page.goto(href!);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page.getByText("DEMO23IS002")).toHaveCount(0);
  await page.goto("/mentor/mentees");
  await expect(page.getByRole("link", { name: "Bharat Sample" })).toHaveCount(0);
  await page.goto("/hod/export/csv");
  await expect(page).toHaveURL(/\/mentor$/);

  // A mentee is pushed back to their own area.
  await logout(page);
  await login(page, USERS.mentee01, /\/mentee$/);
  await page.goto("/admin/users");
  await expect(page).toHaveURL(/\/mentee$/);
});

test("login is rate limited after repeated failures", async ({ page }) => {
  await page.goto("/login");
  for (let i = 0; i < 5; i++) {
    await page.getByLabel("Email").fill("mentee05@demo.college.test");
    await page.getByLabel("Password").fill(`wrong-${i}`);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByText("Email or password is incorrect.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeEnabled(); // wait for the action to settle
  }
  await page.getByLabel("Email").fill("mentee05@demo.college.test");
  await page.getByLabel("Password").fill("Mentee@12345"); // even the right password is refused now
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText(/Too many sign-in attempts/)).toBeVisible();
});

test("a deactivated user is signed out on their next request", async ({ page, browser }) => {
  await login(page, { email: "mentee14@demo.college.test", password: "Mentee@12345" }, /\/mentee$/);

  const adminContext = await browser.newContext();
  const admin = await adminContext.newPage();
  await login(admin, USERS.admin, /\/admin$/);
  await admin.goto("/admin/users?q=mentee14");
  await admin.getByRole("button", { name: "Deactivate Nikhil Draftson" }).click();
  await expect(admin.getByText("Inactive")).toBeVisible();

  await page.goto("/mentee/profile");
  await expect(page).toHaveURL(/\/login\?ended=1$/);
  await expect(page.getByText("Your session has ended")).toBeVisible();

  // Restore the account so later tests see the seeded totals.
  await admin.getByRole("button", { name: "Activate Nikhil Draftson" }).click();
  await expect(admin.getByText("Active", { exact: true })).toBeVisible();
  await adminContext.close();
});
