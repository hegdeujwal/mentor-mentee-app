import { z } from "zod";

const id = z.string().min(1).max(40);

export const noteSchema = z.object({
  menteeId: id,
  body: z.string().trim().min(3, "Write at least a few words.").max(2000, "Keep notes under 2000 characters."),
  visibility: z.enum(["PRIVATE", "SHARED"], { error: "Choose who can see this note." }),
});

export const recommendationSchema = z.object({
  menteeId: id,
  title: z.string().trim().min(3, "Give the recommendation a short title.").max(120),
  description: z.string().trim().min(3, "Describe what the mentee should do.").max(1000),
  category: z.enum(["COURSE", "CERTIFICATION", "CLUB", "INTERNSHIP", "STUDY_PLAN", "OTHER"], {
    error: "Choose a category.",
  }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"], { error: "Choose a priority." }),
  dueDate: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(`${v}T00:00:00.000Z`) : null))
    .refine((d) => d === null || !Number.isNaN(d.getTime()), "Enter a valid date."),
});

export const sessionSchema = z.object({
  menteeId: id,
  heldOn: z
    .string()
    .min(1, "Enter the session date.")
    .transform((v) => new Date(`${v}T00:00:00.000Z`))
    .refine((d) => !Number.isNaN(d.getTime()), "Enter a valid date.")
    .refine((d) => d.getTime() <= Date.now(), "A session cannot be logged for a future date."),
  agenda: z.string().trim().min(3, "Describe the agenda.").max(500),
  outcome: z.string().trim().min(3, "Record the outcome.").max(1000),
  followUp: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v ? v : null)),
});

export const acknowledgeSchema = z.object({
  kind: z.enum(["note", "recommendation"]),
  id,
});
