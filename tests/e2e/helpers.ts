import { expect, type Page } from "@playwright/test";

export const USERS = {
  admin: { email: "admin@demo.college.test", password: "Admin@12345" },
  hod: { email: "hod@demo.college.test", password: "Hod@12345" },
  mentor1: { email: "mentor1@demo.college.test", password: "Mentor@12345" },
  mentor2: { email: "mentor2@demo.college.test", password: "Mentor@12345" },
  mentee01: { email: "mentee01@demo.college.test", password: "Mentee@12345" },
  mentee12: { email: "mentee12@demo.college.test", password: "Mentee@12345" },
};

export async function login(page: Page, user: { email: string; password: string }, home: RegExp) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(home);
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login$/);
}

// A valid 1x1 PNG.
export const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
