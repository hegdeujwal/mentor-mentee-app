"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { formValues, zodErrors, type ActionState } from "@/lib/action-state";
import { getMenteeFacts, requireRole } from "@/features/access/session";
import { canMentor } from "@/features/access/policy";
import { acknowledgeSchema, noteSchema, recommendationSchema, sessionSchema } from "./schemas";

const NOT_YOUR_MENTEE: ActionState = { ok: false, message: "You can only mentor students assigned to you." };

/** Confirms the signed-in mentor is the one assigned to this mentee. */
async function requireAssignedMentor(menteeId: string) {
  const mentor = await requireRole("MENTOR");
  const facts = await getMenteeFacts(menteeId);
  return facts && canMentor(mentor, facts) ? mentor : null;
}

export async function addNoteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = noteSchema.safeParse(formValues(formData, ["menteeId", "body", "visibility"]));
  if (!parsed.success) return zodErrors(parsed.error);
  const mentor = await requireAssignedMentor(parsed.data.menteeId);
  if (!mentor) return NOT_YOUR_MENTEE;

  const note = await prisma.note.create({ data: { ...parsed.data, authorId: mentor.id } });
  await audit({
    actorId: mentor.id,
    action: "NOTE_CREATED",
    entity: "Note",
    entityId: note.id,
    details: { menteeId: note.menteeId, visibility: note.visibility },
  });
  revalidatePath(`/mentor/mentees/${note.menteeId}`);
  return { ok: true, message: note.visibility === "SHARED" ? "Shared note added." : "Private note added." };
}

export async function addRecommendationAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = recommendationSchema.safeParse(
    formValues(formData, ["menteeId", "title", "description", "category", "priority", "dueDate"]),
  );
  if (!parsed.success) return zodErrors(parsed.error);
  const mentor = await requireAssignedMentor(parsed.data.menteeId);
  if (!mentor) return NOT_YOUR_MENTEE;

  const rec = await prisma.recommendation.create({ data: { ...parsed.data, mentorId: mentor.id } });
  await audit({
    actorId: mentor.id,
    action: "RECOMMENDATION_CREATED",
    entity: "Recommendation",
    entityId: rec.id,
    details: { menteeId: rec.menteeId, title: rec.title },
  });
  revalidatePath(`/mentor/mentees/${rec.menteeId}`);
  return { ok: true, message: "Recommendation added." };
}

export async function logSessionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = sessionSchema.safeParse(formValues(formData, ["menteeId", "heldOn", "agenda", "outcome", "followUp"]));
  if (!parsed.success) return zodErrors(parsed.error);
  const mentor = await requireAssignedMentor(parsed.data.menteeId);
  if (!mentor) return NOT_YOUR_MENTEE;

  const session = await prisma.mentoringSession.create({ data: { ...parsed.data, mentorId: mentor.id } });
  await audit({
    actorId: mentor.id,
    action: "SESSION_LOGGED",
    entity: "MentoringSession",
    entityId: session.id,
    details: { menteeId: session.menteeId },
  });
  revalidatePath(`/mentor/mentees/${session.menteeId}`);
  revalidatePath("/mentor");
  return { ok: true, message: "Session logged." };
}

/** A mentee acknowledges a shared note or a recommendation addressed to them. */
export async function acknowledgeAction(formData: FormData) {
  const mentee = await requireRole("MENTEE");
  const parsed = acknowledgeSchema.safeParse(formValues(formData, ["kind", "id"]));
  if (!parsed.success) return;
  const { kind, id } = parsed.data;
  const now = new Date();

  // updateMany with the owner in the filter: another mentee's item simply matches nothing.
  if (kind === "note") {
    await prisma.note.updateMany({
      where: { id, menteeId: mentee.id, visibility: "SHARED", acknowledgedAt: null },
      data: { acknowledgedAt: now },
    });
  } else {
    await prisma.recommendation.updateMany({
      where: { id, menteeId: mentee.id, acknowledgedAt: null },
      data: { acknowledgedAt: now },
    });
  }
  revalidatePath("/mentee", "layout");
}
