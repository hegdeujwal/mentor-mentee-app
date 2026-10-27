import { z } from "zod";
import { departmentField, emailField, nameField, passwordField, usnField } from "@/features/auth/schemas";

export const createUserSchema = z
  .object({
    name: nameField,
    email: emailField,
    role: z.enum(["MENTEE", "MENTOR", "ADMIN", "HOD"], { error: "Choose a role." }),
    department: departmentField,
    password: passwordField,
    usn: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.role !== "MENTEE") return;
    const usn = usnField.safeParse(d.usn ?? "");
    if (!usn.success) ctx.addIssue({ code: "custom", path: ["usn"], message: usn.error.issues[0].message });
  });

export const toggleUserSchema = z.object({ userId: z.string().min(1), active: z.enum(["true", "false"]) });

export const assignSchema = z.object({
  menteeId: z.string().min(1),
  mentorId: z.string().optional().transform((v) => (v ? v : null)),
});

export const reviewSchema = z.object({
  profileId: z.string().min(1),
  decision: z.enum(["ENDORSED", "CHANGES_REQUESTED"], { error: "Choose a decision." }),
  remark: z.string().trim().min(3, "Add a remark for the record.").max(500),
});

/** One row of the mentee import CSV. Column names are case-insensitive. */
export const importRowSchema = z.object({
  name: nameField,
  email: emailField,
  usn: usnField,
  department: departmentField,
  semester: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isInteger(v) && v >= 1 && v <= 8), "Semester must be 1–8."),
  section: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^[A-Z]{1,2}$/.test(v), "Section is one or two letters."),
  mentor_email: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
    .transform((v) => (v ? v : null)),
});

export const IMPORT_COLUMNS = ["name", "email", "usn", "department", "semester", "section", "mentor_email"] as const;
