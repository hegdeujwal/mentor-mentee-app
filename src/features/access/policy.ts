import type { NoteVisibility, Role } from "@prisma/client";

// Pure authorization rules. Server code loads the facts from the database
// and asks these functions; the rules themselves are unit tested.

export type Actor = { id: string; role: Role; department: string };

export type MenteeFacts = { menteeId: string; department: string; mentorId: string | null };

export function canViewMentee(actor: Actor, mentee: MenteeFacts) {
  switch (actor.role) {
    case "MENTEE":
      return actor.id === mentee.menteeId;
    case "MENTOR":
      return mentee.mentorId === actor.id;
    case "ADMIN":
      return true;
    case "HOD":
      return actor.department === mentee.department;
  }
}

/** Only the assigned mentor writes notes, recommendations and session logs. */
export function canMentor(actor: Actor, mentee: MenteeFacts) {
  return actor.role === "MENTOR" && mentee.mentorId === actor.id;
}

/** Which note visibilities the actor may read for a mentee they can already view. */
export function visibleNoteTypes(actor: Actor, hodCanViewPrivate: boolean): NoteVisibility[] {
  if (actor.role === "MENTEE") return ["SHARED"];
  if (actor.role === "HOD" && !hodCanViewPrivate) return ["SHARED"];
  return ["SHARED", "PRIVATE"];
}

export function hodCanViewPrivateNotes() {
  return process.env.HOD_CAN_VIEW_PRIVATE_NOTES !== "false";
}
