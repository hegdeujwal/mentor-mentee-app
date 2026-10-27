import { describe, expect, it } from "vitest";
import { canEdit, canReview, canSubmit, statusAfterEdit, statusAfterReview } from "@/features/profile/status";

describe("profile status rules", () => {
  it("locks a submitted profile against edits", () => {
    expect(canEdit("SUBMITTED")).toBe(false);
    expect(() => statusAfterEdit("SUBMITTED")).toThrow();
  });

  it("sends an endorsed profile back to Draft when it is edited", () => {
    expect(statusAfterEdit("ENDORSED")).toBe("DRAFT");
  });

  it("keeps Changes Requested and Draft unchanged on edit", () => {
    expect(statusAfterEdit("CHANGES_REQUESTED")).toBe("CHANGES_REQUESTED");
    expect(statusAfterEdit("DRAFT")).toBe("DRAFT");
  });

  it("allows submission only from Draft or Changes Requested", () => {
    expect(canSubmit("DRAFT")).toBe(true);
    expect(canSubmit("CHANGES_REQUESTED")).toBe(true);
    expect(canSubmit("SUBMITTED")).toBe(false);
    expect(canSubmit("ENDORSED")).toBe(false);
  });

  it("reviews only submitted profiles", () => {
    expect(canReview("SUBMITTED")).toBe(true);
    expect(statusAfterReview("SUBMITTED", "ENDORSED")).toBe("ENDORSED");
    expect(statusAfterReview("SUBMITTED", "CHANGES_REQUESTED")).toBe("CHANGES_REQUESTED");
    expect(() => statusAfterReview("DRAFT", "ENDORSED")).toThrow();
  });
});
