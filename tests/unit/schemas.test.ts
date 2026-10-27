import { describe, expect, it } from "vitest";
import { registerSchema } from "@/features/auth/schemas";
import { profileSchema } from "@/features/profile/schemas";
import { recommendationSchema, sessionSchema } from "@/features/mentoring/schemas";
import { createUserSchema, importRowSchema } from "@/features/admin/schemas";

const validRegistration = {
  name: "Asha Demo",
  email: "Asha@Example.edu",
  usn: "demo23is001",
  department: "ISE",
  password: "Secret123",
  confirmPassword: "Secret123",
};

describe("registerSchema", () => {
  it("normalises email and USN", () => {
    const parsed = registerSchema.parse(validRegistration);
    expect(parsed.email).toBe("asha@example.edu");
    expect(parsed.usn).toBe("DEMO23IS001");
  });

  it("rejects weak or mismatched passwords", () => {
    expect(registerSchema.safeParse({ ...validRegistration, password: "short", confirmPassword: "short" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...validRegistration, confirmPassword: "Other1234" }).success).toBe(false);
  });

  it("rejects names containing markup", () => {
    expect(registerSchema.safeParse({ ...validRegistration, name: "<script>x</script>" }).success).toBe(false);
  });
});

describe("profileSchema", () => {
  const base = { name: "Asha Demo", email: "a@example.edu", usn: "DEMO23IS001", department: "ISE" };

  it("turns empty optional fields into null", () => {
    const parsed = profileSchema.parse({ ...base, hobbies: "", phone: "", semester: "" });
    expect(parsed.hobbies).toBeNull();
    expect(parsed.phone).toBeNull();
    expect(parsed.semester).toBeNull();
  });

  it("validates phone, semester and section formats", () => {
    expect(profileSchema.safeParse({ ...base, phone: "12345" }).success).toBe(false);
    expect(profileSchema.safeParse({ ...base, semester: "9" }).success).toBe(false);
    expect(profileSchema.safeParse({ ...base, section: "A1" }).success).toBe(false);
    expect(profileSchema.parse({ ...base, phone: "98765 43210", semester: "5", section: "b" })).toMatchObject({
      phone: "9876543210",
      semester: 5,
      section: "B",
    });
  });

  it("rejects implausible dates of birth", () => {
    expect(profileSchema.safeParse({ ...base, dateOfBirth: "2024-01-01" }).success).toBe(false);
    expect(profileSchema.safeParse({ ...base, dateOfBirth: "2005-06-15" }).success).toBe(true);
  });
});

describe("mentoring schemas", () => {
  it("rejects a session dated in the future", () => {
    const tomorrow = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
    const result = sessionSchema.safeParse({ menteeId: "m", heldOn: tomorrow, agenda: "Agenda", outcome: "Outcome" });
    expect(result.success).toBe(false);
  });

  it("requires a known category and priority for recommendations", () => {
    const rec = { menteeId: "m", title: "Learn SQL", description: "Finish the course", category: "COURSE", priority: "HIGH" };
    expect(recommendationSchema.safeParse(rec).success).toBe(true);
    expect(recommendationSchema.safeParse({ ...rec, priority: "URGENT" }).success).toBe(false);
  });
});

describe("admin schemas", () => {
  it("requires a USN only when creating a mentee", () => {
    const user = { name: "New Mentor", email: "m@example.edu", role: "MENTOR", department: "ISE", password: "Secret123" };
    expect(createUserSchema.safeParse(user).success).toBe(true);
    expect(createUserSchema.safeParse({ ...user, role: "MENTEE" }).success).toBe(false);
    expect(createUserSchema.safeParse({ ...user, role: "MENTEE", usn: "DEMO23IS200" }).success).toBe(true);
  });

  it("validates CSV import rows", () => {
    const row = { name: "Csv Student", email: "c@example.edu", usn: "DEMO23IS300", department: "ISE", semester: "3" };
    expect(importRowSchema.parse(row).semester).toBe(3);
    expect(importRowSchema.safeParse({ ...row, department: "XYZ" }).success).toBe(false);
  });
});
