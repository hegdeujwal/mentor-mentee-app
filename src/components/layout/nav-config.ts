import type { Role } from "@prisma/client";

export type NavItem = { href: string; label: string };

export const NAV: Record<Role, NavItem[]> = {
  MENTEE: [
    { href: "/mentee", label: "Overview" },
    { href: "/mentee/profile", label: "My profile" },
    { href: "/mentee/feedback", label: "Mentor feedback" },
  ],
  MENTOR: [
    { href: "/mentor", label: "Overview" },
    { href: "/mentor/mentees", label: "My mentees" },
  ],
  ADMIN: [
    { href: "/admin", label: "Overview" },
    { href: "/admin/reviews", label: "Profile reviews" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/assignments", label: "Assignments" },
    { href: "/admin/import", label: "CSV import" },
    { href: "/admin/audit", label: "Audit log" },
  ],
  HOD: [
    { href: "/hod", label: "Department overview" },
    { href: "/hod/mentees", label: "Mentees" },
  ],
};
