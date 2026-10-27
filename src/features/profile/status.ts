import type { ProfileStatus, ReviewDecision } from "@prisma/client";

/** A submitted profile is frozen while it waits for review. */
export function canEdit(status: ProfileStatus) {
  return status !== "SUBMITTED";
}

export function canSubmit(status: ProfileStatus) {
  return status === "DRAFT" || status === "CHANGES_REQUESTED";
}

export function canReview(status: ProfileStatus) {
  return status === "SUBMITTED";
}

/**
 * Editing an endorsed profile invalidates the endorsement, so it returns to Draft.
 * A profile with requested changes keeps that status until it is resubmitted,
 * so the reviewer's comment stays visible while the mentee works on it.
 */
export function statusAfterEdit(status: ProfileStatus): ProfileStatus {
  if (!canEdit(status)) throw new Error("A submitted profile cannot be edited.");
  return status === "ENDORSED" ? "DRAFT" : status;
}

export function statusAfterReview(status: ProfileStatus, decision: ReviewDecision): ProfileStatus {
  if (!canReview(status)) throw new Error("Only submitted profiles can be reviewed.");
  return decision;
}
