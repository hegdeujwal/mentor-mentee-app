import { z } from "zod";
import { departmentField, emailField, nameField, usnField } from "@/features/auth/schemas";

/** Optional free-text field: trims, caps length, and stores empty input as null. */
const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .optional()
    .transform((v) => (v ? v : null));

const phone = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v.replace(/[\s-]/g, "") : null))
  .refine((v) => v === null || /^\+?\d{10,13}$/.test(v), "Enter a 10–13 digit phone number.");

export const profileSchema = z.object({
  name: nameField,
  email: emailField,
  usn: usnField,
  department: departmentField,
  phone,
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
  dateOfBirth: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(`${v}T00:00:00.000Z`) : null))
    .refine((d) => {
      if (d === null) return true;
      if (Number.isNaN(d.getTime())) return false;
      const age = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
      return age >= 15 && age <= 60;
    }, "Enter a valid date of birth."),
  address: text(300),
  hobbies: text(500),
  interests: text(500),
  skills: text(500),
  strengths: text(500),
  weaknesses: text(500),
  careerGoals: text(800),
  achievements: text(1000),
  extracurricular: text(1000),
  internships: text(1000),
  fatherName: text(80),
  motherName: text(80),
  guardianPhone: phone,
  parentOccupation: text(120),
});

export type ProfileInput = z.infer<typeof profileSchema>;

/** Field names in the order they appear on the form, used to collect FormData. */
export const PROFILE_FIELDS = Object.keys(profileSchema.shape) as (keyof ProfileInput)[];
