import { z } from "zod";
import { DEPARTMENT_CODES } from "@/lib/constants";

export const emailField = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address."));

export const passwordField = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use at most 72 characters.")
  .regex(/[a-z]/, "Include a lowercase letter.")
  .regex(/[A-Z]/, "Include an uppercase letter.")
  .regex(/\d/, "Include a digit.");

export const usnField = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{8,12}$/, "USN must be 8–12 letters or digits, e.g. 4NM23IS001.");

export const nameField = z
  .string()
  .trim()
  .min(2, "Enter the full name.")
  .max(80, "Name is too long.")
  .regex(/^[\p{L} .'-]+$/u, "Use letters, spaces, dots, apostrophes or hyphens only.");

export const departmentField = z.enum(DEPARTMENT_CODES, { error: "Choose a department." });

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Enter your password.").max(72),
});

export const registerSchema = z
  .object({
    name: nameField,
    email: emailField,
    usn: usnField,
    department: departmentField,
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    error: "Passwords do not match.",
  });
