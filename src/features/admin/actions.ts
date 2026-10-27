"use server";

import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { csvToRecords } from "@/lib/csv";
import { formValues, zodErrors, type ActionState } from "@/lib/action-state";
import { requireRole } from "@/features/access/session";
import { statusAfterReview } from "@/features/profile/status";
import { assignSchema, createUserSchema, importRowSchema, reviewSchema, toggleUserSchema } from "./schemas";

export async function createUserAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireRole("ADMIN");
  const parsed = createUserSchema.safeParse(formValues(formData, ["name", "email", "role", "department", "password", "usn"]));
  if (!parsed.success) return zodErrors(parsed.error);
  const { name, email, role, department, password } = parsed.data;
  const usn = parsed.data.usn?.trim().toUpperCase();

  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    return { ok: false, message: "Please correct the highlighted fields.", errors: { email: ["This email is already in use."] } };
  }
  if (role === "MENTEE" && (await prisma.menteeProfile.findUnique({ where: { usn: usn! }, select: { id: true } }))) {
    return { ok: false, message: "Please correct the highlighted fields.", errors: { usn: ["This USN is already registered."] } };
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role,
      department,
      passwordHash: await bcrypt.hash(password, 12),
      ...(role === "MENTEE" && { profile: { create: { usn: usn!, department } } }),
    },
  });
  await audit({ actorId: admin.id, action: "USER_CREATED", entity: "User", entityId: user.id, details: { email, role } });
  revalidatePath("/admin/users");
  return { ok: true, message: `${name} was added as ${role.toLowerCase()}.` };
}

export async function toggleUserAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const parsed = toggleUserSchema.safeParse(formValues(formData, ["userId", "active"]));
  if (!parsed.success || parsed.data.userId === admin.id) return; // an admin cannot lock themselves out
  const isActive = parsed.data.active === "true";
  await prisma.user.update({ where: { id: parsed.data.userId }, data: { isActive } });
  await audit({
    actorId: admin.id,
    action: "USER_UPDATED",
    entity: "User",
    entityId: parsed.data.userId,
    details: { isActive },
  });
  revalidatePath("/admin/users");
}

export async function assignMentorAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireRole("ADMIN");
  const parsed = assignSchema.safeParse(formValues(formData, ["menteeId", "mentorId"]));
  if (!parsed.success) return zodErrors(parsed.error);
  const { menteeId, mentorId } = parsed.data;

  const mentee = await prisma.user.findFirst({ where: { id: menteeId, role: "MENTEE" } });
  if (!mentee) return { ok: false, message: "Mentee not found." };

  if (!mentorId) {
    await prisma.mentorAssignment.deleteMany({ where: { menteeId } });
    await audit({ actorId: admin.id, action: "MENTOR_UNASSIGNED", entity: "User", entityId: menteeId });
    revalidatePath("/admin/assignments");
    return { ok: true, message: `${mentee.name} has no mentor now.` };
  }

  const mentor = await prisma.user.findFirst({ where: { id: mentorId, role: "MENTOR", isActive: true } });
  if (!mentor) return { ok: false, message: "Choose an active mentor." };
  if (mentor.department !== mentee.department) {
    return { ok: false, message: "Mentor and mentee must belong to the same department." };
  }

  await prisma.mentorAssignment.upsert({
    where: { menteeId },
    create: { menteeId, mentorId, assignedById: admin.id },
    update: { mentorId, assignedById: admin.id, assignedAt: new Date() },
  });
  await audit({ actorId: admin.id, action: "MENTOR_ASSIGNED", entity: "User", entityId: menteeId, details: { mentorId } });
  revalidatePath("/admin/assignments");
  return { ok: true, message: `${mentee.name} is now mentored by ${mentor.name}.` };
}

export type ImportResult = ActionState & {
  created?: { name: string; email: string; tempPassword: string }[];
  skipped?: { line: number; reason: string }[];
};

const MAX_IMPORT_BYTES = 512 * 1024;

/** Imports mentees from CSV. Every row is validated; bad rows are reported, good rows are created. */
export async function importMenteesAction(_prev: ImportResult, formData: FormData): Promise<ImportResult> {
  const admin = await requireRole("ADMIN");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Choose a CSV file to import." };
  if (file.size > MAX_IMPORT_BYTES) return { ok: false, message: "The CSV file must be smaller than 512 KB." };
  if (!/\.csv$/i.test(file.name)) return { ok: false, message: "Only .csv files can be imported." };

  const records = csvToRecords(await file.text());
  if (!records.length) return { ok: false, message: "The file has no data rows." };

  const mentors = await prisma.user.findMany({ where: { role: "MENTOR", isActive: true }, select: { id: true, email: true, department: true } });
  const mentorByEmail = new Map(mentors.map((m) => [m.email, m]));
  const created: NonNullable<ImportResult["created"]> = [];
  const skipped: NonNullable<ImportResult["skipped"]> = [];
  const seenEmails = new Set<string>();
  const seenUsns = new Set<string>();

  for (const [index, record] of records.entries()) {
    const line = index + 2; // +1 for the header, +1 for 1-based numbering
    const parsed = importRowSchema.safeParse(record);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      skipped.push({ line, reason: `${issue.path.join(".") || "row"}: ${issue.message}` });
      continue;
    }
    const row = parsed.data;
    if (seenEmails.has(row.email) || seenUsns.has(row.usn)) {
      skipped.push({ line, reason: "Duplicate email or USN within the file." });
      continue;
    }
    seenEmails.add(row.email);
    seenUsns.add(row.usn);

    const [emailTaken, usnTaken] = await Promise.all([
      prisma.user.findUnique({ where: { email: row.email }, select: { id: true } }),
      prisma.menteeProfile.findUnique({ where: { usn: row.usn }, select: { id: true } }),
    ]);
    if (emailTaken || usnTaken) {
      skipped.push({ line, reason: emailTaken ? "Email already registered." : "USN already registered." });
      continue;
    }
    const mentor = row.mentor_email ? mentorByEmail.get(row.mentor_email) : undefined;
    if (row.mentor_email && (!mentor || mentor.department !== row.department)) {
      skipped.push({ line, reason: "mentor_email does not match an active mentor in the same department." });
      continue;
    }

    // Temporary password shown once to the administrator; mentees should change it after first sign-in.
    const tempPassword = `Mm-${randomBytes(6).toString("base64url")}9a`;
    await prisma.user.create({
      data: {
        name: row.name,
        email: row.email,
        role: "MENTEE",
        department: row.department,
        passwordHash: await bcrypt.hash(tempPassword, 12),
        profile: { create: { usn: row.usn, department: row.department, semester: row.semester, section: row.section } },
        ...(mentor && { assignment: { create: { mentorId: mentor.id, assignedById: admin.id } } }),
      },
    });
    created.push({ name: row.name, email: row.email, tempPassword });
  }

  await audit({
    actorId: admin.id,
    action: "CSV_IMPORT",
    entity: "User",
    details: { file: file.name, created: created.length, skipped: skipped.length },
  });
  revalidatePath("/admin", "layout");
  return {
    ok: created.length > 0,
    message: `Imported ${created.length} mentee(s); skipped ${skipped.length} row(s).`,
    created,
    skipped,
  };
}

export async function reviewProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireRole("ADMIN");
  const parsed = reviewSchema.safeParse(formValues(formData, ["profileId", "decision", "remark"]));
  if (!parsed.success) return zodErrors(parsed.error);
  const { profileId, decision, remark } = parsed.data;

  const profile = await prisma.menteeProfile.findUnique({ where: { id: profileId } });
  if (!profile) return { ok: false, message: "Profile not found." };
  if (profile.status !== "SUBMITTED") return { ok: false, message: "This profile is no longer waiting for review." };

  await prisma.$transaction([
    prisma.menteeProfile.update({ where: { id: profileId }, data: { status: statusAfterReview(profile.status, decision) } }),
    prisma.endorsement.create({ data: { profileId, reviewerId: admin.id, decision, remark } }),
  ]);
  await audit({
    actorId: admin.id,
    action: decision === "ENDORSED" ? "PROFILE_ENDORSED" : "PROFILE_CHANGES_REQUESTED",
    entity: "MenteeProfile",
    entityId: profileId,
    details: { remark },
  });
  revalidatePath("/admin", "layout");
  return { ok: true, message: decision === "ENDORSED" ? "Profile endorsed." : "Changes requested from the mentee." };
}
