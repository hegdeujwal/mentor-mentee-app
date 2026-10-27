import "server-only";
import { prisma } from "./db";

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGIN_RATE_LIMITED"
  | "MENTEE_REGISTERED"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "MENTOR_ASSIGNED"
  | "MENTOR_UNASSIGNED"
  | "CSV_IMPORT"
  | "PROFILE_SUBMITTED"
  | "PROFILE_ENDORSED"
  | "PROFILE_CHANGES_REQUESTED"
  | "NOTE_CREATED"
  | "RECOMMENDATION_CREATED"
  | "SESSION_LOGGED"
  | "DEPARTMENT_EXPORTED";

export async function audit(entry: {
  actorId: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  details?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: entry.actorId,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId ?? null,
      details: entry.details ? JSON.stringify(entry.details) : null,
    },
  });
}
