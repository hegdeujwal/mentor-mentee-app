export const DEPARTMENTS = [
  { code: "ISE", name: "Information Science and Engineering" },
  { code: "CSE", name: "Computer Science and Engineering" },
  { code: "ECE", name: "Electronics and Communication Engineering" },
  { code: "ME", name: "Mechanical Engineering" },
  { code: "CV", name: "Civil Engineering" },
] as const;

export const DEPARTMENT_CODES = DEPARTMENTS.map((d) => d.code) as [string, ...string[]];

export const ROLE_HOME = {
  MENTEE: "/mentee",
  MENTOR: "/mentor",
  ADMIN: "/admin",
  HOD: "/hod",
} as const;

export const ROLE_LABEL = {
  MENTEE: "Mentee",
  MENTOR: "Mentor",
  ADMIN: "Administrator",
  HOD: "Head of Department",
} as const;

export const STATUS_LABEL = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  ENDORSED: "Endorsed",
  CHANGES_REQUESTED: "Changes Requested",
} as const;

export const CATEGORY_LABEL = {
  COURSE: "Course",
  CERTIFICATION: "Certification",
  CLUB: "Club",
  INTERNSHIP: "Internship",
  STUDY_PLAN: "Study plan",
  OTHER: "Other",
} as const;

export const PRIORITY_LABEL = { LOW: "Low", MEDIUM: "Medium", HIGH: "High" } as const;
