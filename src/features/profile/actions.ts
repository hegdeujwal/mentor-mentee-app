"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { storage } from "@/lib/storage";
import { validatePhoto } from "@/lib/photo";
import { formValues, zodErrors, type ActionState } from "@/lib/action-state";
import { requireRole } from "@/features/access/session";
import { PROFILE_FIELDS, profileSchema } from "./schemas";
import { canEdit, canSubmit, statusAfterEdit } from "./status";
import { missingForSubmission } from "./completion";

export async function saveProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole("MENTEE");
  const parsed = profileSchema.safeParse(formValues(formData, PROFILE_FIELDS));
  if (!parsed.success) return zodErrors(parsed.error);
  const { name, email, ...data } = parsed.data;

  const profile = await prisma.menteeProfile.findUniqueOrThrow({ where: { userId: user.id } });
  if (!canEdit(profile.status)) {
    return { ok: false, message: "Your profile is under review and cannot be edited until the review is done." };
  }

  const [emailOwner, usnOwner] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.menteeProfile.findUnique({ where: { usn: data.usn }, select: { userId: true } }),
  ]);
  const errors: Record<string, string[]> = {};
  if (emailOwner && emailOwner.id !== user.id) errors.email = ["This email is used by another account."];
  if (usnOwner && usnOwner.userId !== user.id) errors.usn = ["This USN belongs to another student."];
  if (Object.keys(errors).length) return { ok: false, message: "Please correct the highlighted fields.", errors };

  let photoPath = profile.photoPath;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const bytes = new Uint8Array(await photo.arrayBuffer());
    const check = validatePhoto({ type: photo.type, size: photo.size, bytes });
    if (!check.ok) return { ok: false, message: check.error, errors: { photo: [check.error] } };
    photoPath = await storage.save(bytes, check.extension);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      email,
      department: data.department,
      profile: { update: { ...data, photoPath, status: statusAfterEdit(profile.status) } },
    },
  });
  if (photoPath !== profile.photoPath && profile.photoPath) await storage.remove(profile.photoPath);

  revalidatePath("/mentee", "layout");
  return {
    ok: true,
    message:
      profile.status === "ENDORSED"
        ? "Saved. Because the profile changed, it is back in Draft and needs to be submitted again."
        : "Profile saved.",
  };
}

export async function submitProfileAction(_prev: ActionState): Promise<ActionState> {
  const user = await requireRole("MENTEE");
  const record = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { name: true, email: true, profile: true },
  });
  const profile = record.profile!;
  if (!canSubmit(profile.status)) return { ok: false, message: "This profile cannot be submitted in its current state." };

  const missing = missingForSubmission({ ...profile, name: record.name, email: record.email });
  if (missing.length) return { ok: false, message: `Fill these fields before submitting: ${missing.join(", ")}.` };

  await prisma.menteeProfile.update({
    where: { id: profile.id },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });
  await audit({ actorId: user.id, action: "PROFILE_SUBMITTED", entity: "MenteeProfile", entityId: profile.id });
  revalidatePath("/mentee", "layout");
  return { ok: true, message: "Profile submitted for review." };
}
