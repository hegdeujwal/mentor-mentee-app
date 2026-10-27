import { expect, test } from "@playwright/test";
import { login, logout, USERS } from "./helpers";

test("admin imports mentees from CSV and the HOD sees and exports them", async ({ page }) => {
  await login(page, USERS.admin, /\/admin$/);
  await page.getByRole("link", { name: "CSV import" }).first().click();
  const csv = [
    "name,email,usn,department,semester,section,mentor_email",
    "Riya Imported,riya.imported@example.edu,DEMO23IS201,ISE,3,A,mentor3@demo.college.test",
    "Sam Imported,sam.imported@example.edu,DEMO23IS202,ISE,3,B,",
    "Bad Row,not-an-email,DEMO23IS203,ISE,3,A,",
  ].join("\n");
  await page.getByLabel("CSV file").setInputFiles({ name: "batch.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
  await page.getByRole("button", { name: "Import mentees" }).click();
  await expect(page.getByText("Imported 2 mentee(s); skipped 1 row(s).")).toBeVisible();
  await expect(page.getByRole("cell", { name: "riya.imported@example.edu" })).toBeVisible();
  await expect(page.getByRole("cell", { name: /email/ })).toBeVisible(); // reason for the skipped row

  // Assign the second imported mentee to mentor 1.
  await page.getByRole("link", { name: "Assignments" }).first().click();
  await page.getByLabel("Mentor for Sam Imported", { exact: true }).selectOption({ label: "Prof. Arun Sample (5)" });
  await page.getByRole("button", { name: "Save mentor for Sam Imported" }).click();
  await expect(page.getByText("Sam Imported is now mentored by Prof. Arun Sample.")).toBeVisible();

  await page.getByRole("link", { name: "Audit log" }).first().click();
  await expect(page.getByRole("cell", { name: "CSV_IMPORT" }).first()).toBeVisible();

  await logout(page);
  await login(page, USERS.hod, /\/hod$/);
  await expect(page.getByRole("group", { name: "Total mentees" })).toContainText("17");

  const csvDownload = page.waitForEvent("download");
  await page.getByRole("link", { name: "Export CSV" }).click();
  const csvFile = await (await csvDownload).path();
  const content = (await import("node:fs")).readFileSync(csvFile, "utf8");
  expect(content.split("\r\n")[0]).toBe("Name,USN,Semester,Section,Mentor,Status,Completion %,Sessions");
  expect(content).toContain("Riya Imported");

  const pdfDownload = page.waitForEvent("download");
  await page.getByRole("link", { name: "Export PDF" }).click();
  const pdf = (await import("node:fs")).readFileSync(await (await pdfDownload).path());
  expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
});
