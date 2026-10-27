// Demo data: 1 HOD, 1 admin, 3 mentors and 15 mentees in the ISE department.
// Every name, email, USN and phone number below is fictional.
import type { ProfileStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createPrismaClient } from "../src/lib/db";

// Seeds the local SQLite file, or Turso when TURSO_DATABASE_URL is set.
const prisma = createPrismaClient();
const DEPT = "ISE";
const DOMAIN = "demo.college.test";

const PASSWORDS = { HOD: "Hod@12345", ADMIN: "Admin@12345", MENTOR: "Mentor@12345", MENTEE: "Mentee@12345" };

const MENTEE_NAMES = [
  "Asha Demo", "Bharat Sample", "Chitra Example", "Dev Placeholder", "Esha Testcase",
  "Farhan Mockup", "Gauri Fixture", "Harsh Stub", "Isha Dummy", "Jay Prototype",
  "Kavya Specimen", "Lokesh Trial", "Meera Pilot", "Nikhil Draftson", "Ojas Sandbox",
];

const STATUS_PLAN: ProfileStatus[] = [
  "ENDORSED", "ENDORSED", "ENDORSED", "ENDORSED", "ENDORSED",
  "SUBMITTED", "SUBMITTED", "SUBMITTED",
  "CHANGES_REQUESTED", "CHANGES_REQUESTED",
  "DRAFT", "DRAFT", "DRAFT", "DRAFT", "DRAFT",
];

const SKILLS = ["Java, SQL", "Python, data analysis", "C, embedded basics", "React, TypeScript", "Networking, Linux"];
const GOALS = ["Software developer at a product company", "Higher studies in data science", "Cloud engineer", "Start a small tech venture", "Research in networks"];
const HOBBIES = ["Chess, reading", "Football, music", "Photography", "Sketching, trekking", "Badminton, cooking"];

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 3600 * 1000);

async function main() {
  // Clear in dependency order so the seed can be re-run.
  await prisma.auditLog.deleteMany();
  await prisma.storedFile.deleteMany();
  await prisma.endorsement.deleteMany();
  await prisma.mentoringSession.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.note.deleteMany();
  await prisma.mentorAssignment.deleteMany();
  await prisma.menteeProfile.deleteMany();
  await prisma.user.deleteMany();

  const hash = Object.fromEntries(
    await Promise.all(Object.entries(PASSWORDS).map(async ([role, pw]) => [role, await bcrypt.hash(pw, 12)])),
  ) as Record<keyof typeof PASSWORDS, string>;

  await prisma.user.create({
    data: { name: "Dr. Hema Placeholder", email: `hod@${DOMAIN}`, role: "HOD", department: DEPT, passwordHash: hash.HOD },
  });
  const admin = await prisma.user.create({
    data: { name: "Office Admin Demo", email: `admin@${DOMAIN}`, role: "ADMIN", department: DEPT, passwordHash: hash.ADMIN },
  });
  const mentors = await Promise.all(
    ["Prof. Arun Sample", "Prof. Beena Example", "Prof. Charan Mock"].map((name, i) =>
      prisma.user.create({
        data: { name, email: `mentor${i + 1}@${DOMAIN}`, role: "MENTOR", department: DEPT, passwordHash: hash.MENTOR },
      }),
    ),
  );

  for (const [i, name] of MENTEE_NAMES.entries()) {
    const n = i + 1;
    const status = STATUS_PLAN[i];
    const complete = status !== "DRAFT" || n % 2 === 0;
    const mentor = mentors[i % 3];

    const mentee = await prisma.user.create({
      data: {
        name,
        email: `mentee${String(n).padStart(2, "0")}@${DOMAIN}`,
        role: "MENTEE",
        department: DEPT,
        passwordHash: hash.MENTEE,
        profile: {
          create: {
            usn: `DEMO23IS${String(n).padStart(3, "0")}`,
            department: DEPT,
            semester: 5,
            section: n <= 8 ? "A" : "B",
            phone: `90000000${String(n).padStart(2, "0")}`,
            status,
            submittedAt: status === "DRAFT" ? null : daysAgo(20 - n),
            ...(complete && {
              dateOfBirth: new Date(`2005-0${(n % 9) + 1}-1${n % 9}T00:00:00.000Z`),
              address: `${n} Example Street, Demo Town 500 0${String(n).padStart(2, "0")}`,
              hobbies: HOBBIES[i % 5],
              interests: "Web development, competitive programming",
              skills: SKILLS[i % 5],
              strengths: "Consistent, works well in teams",
              weaknesses: "Public speaking",
              careerGoals: GOALS[i % 5],
              achievements: n % 3 === 0 ? "Finalist, department hackathon (demo entry)" : null,
              extracurricular: "Member of the coding club",
              internships: n % 4 === 0 ? "Summer intern at Example Labs (fictional), 6 weeks" : null,
              fatherName: `Father of ${name.split(" ")[0]}`,
              motherName: `Mother of ${name.split(" ")[0]}`,
              guardianPhone: `90000001${String(n).padStart(2, "0")}`,
              parentOccupation: "Business",
            }),
          },
        },
        assignment: { create: { mentorId: mentor.id, assignedById: admin.id } },
      },
      include: { profile: true },
    });

    if (status === "ENDORSED" || status === "CHANGES_REQUESTED") {
      await prisma.endorsement.create({
        data: {
          profileId: mentee.profile!.id,
          reviewerId: admin.id,
          decision: status,
          remark: status === "ENDORSED" ? "Details checked against the admission record." : "Please add your date of birth as in the marks card and a parent phone number.",
          createdAt: daysAgo(10 - (n % 5)),
        },
      });
    }

    await prisma.mentoringSession.create({
      data: {
        mentorId: mentor.id,
        menteeId: mentee.id,
        heldOn: daysAgo(14 + n),
        agenda: "Semester start check-in: attendance, course load and goals.",
        outcome: "Agreed on a weekly study timetable.",
        followUp: "Share the timetable by next Monday.",
      },
    });
    if (n % 2 === 1) {
      await prisma.mentoringSession.create({
        data: {
          mentorId: mentor.id,
          menteeId: mentee.id,
          heldOn: daysAgo(n),
          agenda: "Mid-semester review of internal marks.",
          outcome: "Two subjects need extra practice; plan made.",
        },
      });
    }

    await prisma.note.create({
      data: {
        authorId: mentor.id,
        menteeId: mentee.id,
        visibility: "SHARED",
        body: "Good progress this month. Keep attending the coding club sessions.",
        acknowledgedAt: n % 3 === 0 ? daysAgo(2) : null,
      },
    });
    await prisma.note.create({
      data: {
        authorId: mentor.id,
        menteeId: mentee.id,
        visibility: "PRIVATE",
        body: "Seemed stressed about the backlog; check again in two weeks.",
      },
    });
    await prisma.recommendation.create({
      data: {
        mentorId: mentor.id,
        menteeId: mentee.id,
        title: n % 2 ? "Complete an online SQL course" : "Join the department robotics club",
        description: n % 2 ? "Finish an introductory SQL course and share the certificate." : "Attend two club meetings and pick a small project.",
        category: n % 2 ? "COURSE" : "CLUB",
        priority: (["HIGH", "MEDIUM", "LOW"] as const)[i % 3],
        dueDate: daysAgo(-30),
      },
    });
  }

  console.log("Seeded: 1 HOD, 1 admin, 3 mentors, 15 mentees.");
  console.table([
    { role: "HOD", email: `hod@${DOMAIN}`, password: PASSWORDS.HOD },
    { role: "Admin", email: `admin@${DOMAIN}`, password: PASSWORDS.ADMIN },
    { role: "Mentor", email: `mentor1@${DOMAIN} … mentor3@${DOMAIN}`, password: PASSWORDS.MENTOR },
    { role: "Mentee", email: `mentee01@${DOMAIN} … mentee15@${DOMAIN}`, password: PASSWORDS.MENTEE },
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
