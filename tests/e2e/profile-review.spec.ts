import { expect, test } from "@playwright/test";
import { login, logout, TINY_PNG, USERS } from "./helpers";

test("mentee completes and submits a profile, admin endorses it", async ({ page, playwright }) => {
  await login(page, USERS.mentee12, /\/mentee$/);
  await page.getByRole("link", { name: "My profile" }).first().click();
  await expect(page.getByRole("heading", { name: "My profile" })).toBeVisible();

  // A text file disguised as a PNG is rejected on the server by its content.
  await page.getByLabel("Upload a new photo").setInputFiles({ name: "fake.png", mimeType: "image/png", buffer: Buffer.from("not an image") });
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("The file content does not match its image type.").first()).toBeVisible();

  await page.getByLabel("Hobbies").fill("Chess and long-distance running");
  await page.getByLabel("Upload a new photo").setInputFiles({ name: "me.png", mimeType: "image/png", buffer: TINY_PNG });
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Profile saved.")).toBeVisible();
  const photo = page.getByAltText(/Photo of/);
  await expect(photo).toBeVisible();
  await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);

  // The photo URL is not public: an anonymous request is refused.
  const src = await photo.getAttribute("src");
  const anonymous = await playwright.request.newContext();
  expect((await anonymous.get(new URL(src!, page.url()).toString())).status()).toBe(401);
  await anonymous.dispose();

  await page.getByRole("button", { name: "Submit for review" }).click();
  await expect(page.getByText(/submitted and is waiting for review/)).toBeVisible();
  await expect(page.getByText("Submitted", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Save profile" })).toHaveCount(0); // locked while under review

  await logout(page);
  await login(page, USERS.admin, /\/admin$/);
  await page.getByRole("link", { name: "Profile reviews" }).first().click();
  await page.getByRole("link", { name: "Lokesh Trial" }).click();
  await page.getByLabel("Remark").fill("Checked against the admission register.");
  await page.getByRole("button", { name: "Record decision" }).click();
  // The review form disappears once the profile leaves Submitted; the decision shows in the history.
  const history = page.getByRole("region", { name: "Endorsement history" });
  await expect(history.getByText("Endorsed")).toBeVisible();
  await expect(history.getByText("Checked against the admission register.")).toBeVisible();
  await expect(history.getByText(/by Office Admin Demo/)).toBeVisible();

  await logout(page);
  await login(page, USERS.mentee12, /\/mentee$/);
  await expect(page.getByText("Endorsed", { exact: true })).toBeVisible();
  await expect(page.getByText("Checked against the admission register.")).toBeVisible();
});
