import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ROLE_HOME } from "@/lib/constants";
import { canViewMentee, type Actor, type MenteeFacts } from "./policy";

export type CurrentUser = Actor & { name: string; email: string };

/**
 * Reads the session and re-loads the user from the database on every request,
 * so a deactivated account or changed role takes effect immediately.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, department: true, isActive: true, sessionsRevokedAt: true },
  });
  if (!user || !user.isActive) return null;
  // A token from before the last sign-out stays cryptographically valid, so reject it here.
  if (user.sessionsRevokedAt && (session.user.loginAt ?? 0) <= user.sessionsRevokedAt.getTime()) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department };
});

/** Guard for pages and server actions. */
export async function requireRole(...roles: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect((await auth()) ? "/session-ended" : "/login");
  if (!roles.includes(user.role)) redirect(ROLE_HOME[user.role]);
  return user;
}

export async function getMenteeFacts(menteeId: string): Promise<MenteeFacts | null> {
  const mentee = await prisma.user.findFirst({
    where: { id: menteeId, role: "MENTEE" },
    select: { id: true, department: true, assignment: { select: { mentorId: true } } },
  });
  if (!mentee) return null;
  return { menteeId: mentee.id, department: mentee.department, mentorId: mentee.assignment?.mentorId ?? null };
}

/**
 * Loads the facts for a mentee and responds with 404 when the actor may not see them,
 * so a mentor cannot even confirm that another mentor's mentee exists.
 */
export async function requireMenteeAccess(actor: Actor, menteeId: string) {
  const facts = await getMenteeFacts(menteeId);
  if (!facts || !canViewMentee(actor, facts)) notFound();
  return facts;
}
