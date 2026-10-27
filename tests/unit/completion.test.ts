import { describe, expect, it } from "vitest";
import { COMPLETION_FIELDS, missingForSubmission, profileCompletion } from "@/features/profile/completion";

const full = Object.fromEntries(COMPLETION_FIELDS.map((f) => [f.key, "x"]));

describe("profileCompletion", () => {
  it("is 100 when every field is filled and 0 when none are", () => {
    expect(profileCompletion(full)).toBe(100);
    expect(profileCompletion({})).toBe(0);
  });

  it("treats blank strings as empty", () => {
    expect(profileCompletion({ ...full, hobbies: "   " })).toBeLessThan(100);
  });
});

describe("missingForSubmission", () => {
  it("returns nothing for a complete profile", () => {
    expect(missingForSubmission(full)).toEqual([]);
  });

  it("lists required fields that are empty", () => {
    const missing = missingForSubmission({ ...full, phone: null, careerGoals: "" });
    expect(missing).toEqual(expect.arrayContaining(["Phone", "Career goals"]));
  });

  it("does not require optional fields such as hobbies", () => {
    expect(missingForSubmission({ ...full, hobbies: null })).toEqual([]);
  });

  it("requires at least one parent's name", () => {
    expect(missingForSubmission({ ...full, fatherName: null, motherName: null })).toContain("A parent's name");
    expect(missingForSubmission({ ...full, fatherName: null })).toEqual([]);
  });
});
