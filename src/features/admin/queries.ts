import "server-only";
import type { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function adminOverview() {
  const [users, pendingReviews, unassigned, byStatus, recent] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.menteeProfile.count({ where: { status: "SUBMITTED" } }),
    prisma.user.count({ where: { role: "MENTEE", isActive: true, assignment: null } }),
    prisma.menteeProfile.groupBy({ by: ["status"], _count: true }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { actor: { select: { name: true } } } }),
  ]);
  return { users, pendingReviews, unassigned, byStatus, recent };
}

export async function listUsers(filter: { q?: string; role?: Role }) {
  const where: Prisma.UserWhereInput = {
    ...(filter.role && { role: filter.role }),
    ...(filter.q && { OR: [{ name: { contains: filter.q } }, { email: { contains: filter.q } }] }),
  };
  return prisma.user.findMany({
    where,
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: { id: true, name: true, email: true, role: true, department: true, isActive: true, createdAt: true },
  });
}

export async function listAssignments() {
  const [mentees, mentors] = await Promise.all([
    prisma.user.findMany({
      where: { role: "MENTEE", isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        department: true,
        profile: { select: { usn: true } },
        assignment: { select: { mentorId: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "MENTOR", isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, department: true, _count: { select: { mentorOf: true } } },
    }),
  ]);
  return { mentees, mentors };
}

export async function reviewQueue() {
  return prisma.menteeProfile.findMany({
    where: { status: "SUBMITTED" },
    orderBy: { submittedAt: "asc" },
    include: { user: { select: { id: true, name: true } } },
  });
}

export async function recentDecisions() {
  return prisma.endorsement.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { reviewer: { select: { name: true } }, profile: { select: { usn: true, user: { select: { id: true, name: true } } } } },
  });
}

export const AUDIT_PAGE_SIZE = 25;

export async function auditPage(page: number, action?: string) {
  const where: Prisma.AuditLogWhereInput = action ? { action } : {};
  const [total, rows, actions] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * AUDIT_PAGE_SIZE,
      take: AUDIT_PAGE_SIZE,
      include: { actor: { select: { name: true, role: true } } },
    }),
    prisma.auditLog.findMany({ distinct: ["action"], select: { action: true }, orderBy: { action: "asc" } }),
  ]);
  return { total, rows, actions: actions.map((a) => a.action) };
}
