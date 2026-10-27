import { describe, expect, it } from "vitest";
import { canMentor, canViewMentee, visibleNoteTypes, type Actor } from "@/features/access/policy";

const mentee = { menteeId: "m1", department: "ISE", mentorId: "t1" };
const actor = (role: Actor["role"], id = "x", department = "ISE"): Actor => ({ id, role, department });

describe("canViewMentee", () => {
  it("lets a mentee see only their own record", () => {
    expect(canViewMentee(actor("MENTEE", "m1"), mentee)).toBe(true);
    expect(canViewMentee(actor("MENTEE", "m2"), mentee)).toBe(false);
  });

  it("lets a mentor see only mentees assigned to them", () => {
    expect(canViewMentee(actor("MENTOR", "t1"), mentee)).toBe(true);
    expect(canViewMentee(actor("MENTOR", "t2"), mentee)).toBe(false);
    expect(canViewMentee(actor("MENTOR", "t1"), { ...mentee, mentorId: null })).toBe(false);
  });

  it("limits the HOD to their own department", () => {
    expect(canViewMentee(actor("HOD", "h", "ISE"), mentee)).toBe(true);
    expect(canViewMentee(actor("HOD", "h", "CSE"), mentee)).toBe(false);
  });

  it("lets an administrator see every mentee", () => {
    expect(canViewMentee(actor("ADMIN", "a", "CSE"), mentee)).toBe(true);
  });
});

describe("canMentor", () => {
  it("allows only the assigned mentor to write mentoring records", () => {
    expect(canMentor(actor("MENTOR", "t1"), mentee)).toBe(true);
    expect(canMentor(actor("MENTOR", "t2"), mentee)).toBe(false);
    expect(canMentor(actor("ADMIN", "t1"), mentee)).toBe(false);
    expect(canMentor(actor("HOD", "t1"), mentee)).toBe(false);
  });
});

describe("visibleNoteTypes", () => {
  it("never shows private notes to a mentee", () => {
    expect(visibleNoteTypes(actor("MENTEE"), true)).toEqual(["SHARED"]);
  });

  it("shows private notes to the HOD only when the policy allows it", () => {
    expect(visibleNoteTypes(actor("HOD"), true)).toContain("PRIVATE");
    expect(visibleNoteTypes(actor("HOD"), false)).toEqual(["SHARED"]);
  });

  it("always shows private notes to mentors and administrators", () => {
    expect(visibleNoteTypes(actor("MENTOR"), false)).toContain("PRIVATE");
    expect(visibleNoteTypes(actor("ADMIN"), false)).toContain("PRIVATE");
  });
});
