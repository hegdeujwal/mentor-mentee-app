import "server-only";
import { prisma } from "@/lib/db";
import { profileCompletion } from "@/features/profile/completion";

const BUCKETS = [
  { label: "0–49%", min: 0, max: 49 },
  { label: "50–74%", min: 50, max: 74 },
  { label: "75–99%", min: 75, max: 99 },
  { label: "100%", min: 100, max: 100 },
];

/** Everything the HOD dashboard and exports need, scoped to one department. */
export async function departmentSummary(department: string) {
  const [mentees, mentors, sessionCount] = await Promise.all([
    prisma.user.findMany({
      where: { role: "MENTEE", department, isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        profile: true,
        assignment: { select: { mentor: { select: { id: true, name: true } } } },
        _count: { select: { sessionsAttended: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "MENTOR", department, isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        _count: { select: { mentorOf: true, sessionsLed: true, notesWritten: true, recommendationsGiven: true } },
      },
    }),
    prisma.mentoringSession.count({ where: { mentee: { department } } }),
  ]);

  const rows = mentees.map((m) => ({
    id: m.id,
    name: m.name,
    usn: m.profile?.usn ?? "",
    semester: m.profile?.semester ?? null,
    section: m.profile?.section ?? null,
    status: m.profile?.status ?? "DRAFT",
    mentor: m.assignment?.mentor.name ?? null,
    sessions: m._count.sessionsAttended,
    completion: m.profile ? profileCompletion({ ...m.profile, name: m.name, email: m.email }) : 0,
  }));

  const count = (status: string) => rows.filter((r) => r.status === status).length;
  return {
    department,
    totals: {
      mentees: rows.length,
      mentors: mentors.length,
      endorsed: count("ENDORSED"),
      submitted: count("SUBMITTED"),
      changesRequested: count("CHANGES_REQUESTED"),
      draft: count("DRAFT"),
      unassigned: rows.filter((r) => !r.mentor).length,
      sessions: sessionCount,
      averageCompletion: rows.length ? Math.round(rows.reduce((s, r) => s + r.completion, 0) / rows.length) : 0,
    },
    workload: mentors.map((m) => ({
      id: m.id,
      name: m.name,
      mentees: m._count.mentorOf,
      sessions: m._count.sessionsLed,
      notes: m._count.notesWritten,
      recommendations: m._count.recommendationsGiven,
    })),
    completionBuckets: BUCKETS.map((b) => ({
      label: b.label,
      value: rows.filter((r) => r.completion >= b.min && r.completion <= b.max).length,
    })),
    rows,
  };
}

export type DepartmentSummary = Awaited<ReturnType<typeof departmentSummary>>;
