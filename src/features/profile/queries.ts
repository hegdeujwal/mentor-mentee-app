import "server-only";
import { prisma } from "@/lib/db";
import { hodCanViewPrivateNotes, visibleNoteTypes, type Actor } from "@/features/access/policy";

/** The mentee's own profile with the latest review comment. */
export async function getOwnProfile(userId: string) {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      department: true,
      profile: {
        include: {
          endorsements: { orderBy: { createdAt: "desc" }, take: 1, include: { reviewer: { select: { name: true } } } },
        },
      },
      assignment: { select: { mentor: { select: { name: true, email: true } } } },
    },
  });
}

/**
 * Full mentee record for a mentor, admin or HOD. Callers must have passed
 * requireMenteeAccess first; this function only applies note visibility.
 */
export async function getMenteeDetail(actor: Actor, menteeId: string) {
  const visibility = visibleNoteTypes(actor, hodCanViewPrivateNotes());
  return prisma.user.findUniqueOrThrow({
    where: { id: menteeId },
    select: {
      id: true,
      name: true,
      email: true,
      department: true,
      profile: {
        include: {
          endorsements: { orderBy: { createdAt: "desc" }, include: { reviewer: { select: { name: true } } } },
        },
      },
      assignment: { select: { mentor: { select: { id: true, name: true } } } },
      notesReceived: {
        where: { visibility: { in: visibility } },
        orderBy: { createdAt: "desc" },
        include: { author: { select: { name: true } } },
      },
      recommendationsReceived: { orderBy: { createdAt: "desc" }, include: { mentor: { select: { name: true } } } },
      sessionsAttended: { orderBy: { heldOn: "desc" }, include: { mentor: { select: { name: true } } } },
    },
  });
}

export type MenteeDetail = Awaited<ReturnType<typeof getMenteeDetail>>;
