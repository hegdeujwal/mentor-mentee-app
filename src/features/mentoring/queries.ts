import "server-only";
import type { Prisma, ProfileStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { profileCompletion } from "@/features/profile/completion";

export type MenteeFilter = { q?: string; status?: ProfileStatus; semester?: number };

/** Mentees assigned to one mentor. The mentor id comes from the session, never from the request. */
export async function listMentorMentees(mentorId: string, filter: MenteeFilter) {
  const where: Prisma.UserWhereInput = {
    role: "MENTEE",
    assignment: { mentorId },
    profile: {
      ...(filter.status && { status: filter.status }),
      ...(filter.semester && { semester: filter.semester }),
    },
    ...(filter.q && {
      OR: [{ name: { contains: filter.q } }, { email: { contains: filter.q } }, { profile: { usn: { contains: filter.q.toUpperCase() } } }],
    }),
  };
  const mentees = await prisma.user.findMany({
    where,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      profile: true,
      _count: { select: { sessionsAttended: true } },
    },
  });
  return mentees.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    usn: m.profile?.usn ?? "",
    semester: m.profile?.semester ?? null,
    section: m.profile?.section ?? null,
    status: m.profile?.status ?? "DRAFT",
    photoPath: m.profile?.photoPath ?? null,
    completion: m.profile ? profileCompletion({ ...m.profile, name: m.name, email: m.email }) : 0,
    sessions: m._count.sessionsAttended,
  }));
}

export async function mentorOverview(mentorId: string) {
  const [mentees, sessions, openRecs, recentSessions] = await Promise.all([
    prisma.mentorAssignment.count({ where: { mentorId } }),
    prisma.mentoringSession.count({ where: { mentorId } }),
    prisma.recommendation.count({ where: { mentorId, acknowledgedAt: null } }),
    prisma.mentoringSession.findMany({
      where: { mentorId },
      orderBy: { heldOn: "desc" },
      take: 5,
      include: { mentee: { select: { id: true, name: true } } },
    }),
  ]);
  const byStatus = await prisma.menteeProfile.groupBy({
    by: ["status"],
    where: { user: { assignment: { mentorId } } },
    _count: true,
  });
  return { mentees, sessions, openRecs, recentSessions, byStatus };
}

export async function menteeFeedback(menteeId: string) {
  const [notes, recommendations, sessions] = await Promise.all([
    prisma.note.findMany({
      where: { menteeId, visibility: "SHARED" },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } },
    }),
    prisma.recommendation.findMany({
      where: { menteeId },
      orderBy: [{ acknowledgedAt: { sort: "asc", nulls: "first" } }, { dueDate: "asc" }],
      include: { mentor: { select: { name: true } } },
    }),
    prisma.mentoringSession.count({ where: { menteeId } }),
  ]);
  return { notes, recommendations, sessions };
}
