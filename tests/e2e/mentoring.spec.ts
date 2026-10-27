import { expect, test } from "@playwright/test";
import { login, logout, USERS } from "./helpers";

test("mentor records feedback and the mentee sees only shared items", async ({ page }) => {
  const shared = `Shared note ${Date.now()}`;
  const secret = `Private note ${Date.now()}`;

  await login(page, USERS.mentor1, /\/mentor$/);
  await page.getByRole("link", { name: "My mentees" }).first().click();

  // Search narrows the list.
  await page.getByLabel("Search by name, email or USN").fill("Asha");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByText("1 mentee shown")).toBeVisible();
  await page.getByRole("link", { name: "Asha Demo" }).click();

  const noteForm = page.getByRole("form", { name: "Add note" });
  await noteForm.getByLabel("Note").fill(shared);
  await noteForm.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByText("Shared note added.")).toBeVisible();

  await noteForm.getByLabel("Note").fill(secret);
  await noteForm.getByLabel("Visibility").selectOption("PRIVATE");
  await noteForm.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByText("Private note added.")).toBeVisible();

  const recForm = page.getByRole("form", { name: "Add recommendation" });
  await recForm.getByLabel("Title").fill("Earn a cloud fundamentals certificate");
  await recForm.getByLabel("Description").fill("Prepare over the winter break.");
  await recForm.getByLabel("Category").selectOption("CERTIFICATION");
  await recForm.getByLabel("Priority").selectOption("HIGH");
  await recForm.getByRole("button", { name: "Add recommendation" }).click();
  await expect(page.getByText("Recommendation added.")).toBeVisible();

  const sessionForm = page.getByRole("form", { name: "Log session" });
  await sessionForm.getByRole("button", { name: "Log session" }).click();
  await expect(sessionForm.getByText("Enter the session date.")).toBeVisible(); // client-side validation
  await sessionForm.getByLabel("Date held").fill(new Date().toISOString().slice(0, 10));
  await sessionForm.getByLabel("Agenda").fill("Internship planning");
  await sessionForm.getByLabel("Outcome").fill("Shortlisted three companies");
  await sessionForm.getByRole("button", { name: "Log session" }).click();
  await expect(page.getByText("Session logged.")).toBeVisible();

  await logout(page);
  await login(page, USERS.mentee01, /\/mentee$/);
  await page.getByRole("link", { name: "Mentor feedback" }).first().click();
  await expect(page.getByText(shared)).toBeVisible();
  await expect(page.getByText(secret)).toHaveCount(0);
  await expect(page.getByText("Earn a cloud fundamentals certificate")).toBeVisible();

  const note = page.locator("li", { hasText: shared });
  await note.getByRole("button", { name: "Acknowledge" }).click();
  await expect(note.getByText(/Acknowledged/)).toBeVisible();
});
