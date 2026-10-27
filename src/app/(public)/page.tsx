import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

const ROLES = [
  {
    title: "Mentees",
    text: "Keep one up-to-date profile, read your mentor's advice and track whether your record has been endorsed.",
  },
  {
    title: "Mentors",
    text: "See only the students assigned to you, log every meeting, and leave private or shared notes and recommendations.",
  },
  {
    title: "Administrators",
    text: "Create accounts, import a batch from CSV, assign mentors and endorse submitted profiles with a recorded remark.",
  },
  {
    title: "Head of Department",
    text: "A read-only view of the whole department: endorsement progress, mentor workload and an exportable summary.",
  },
];

const STEPS = [
  "The mentee fills in the profile and submits it.",
  "The administrator checks it and endorses it or asks for changes.",
  "The mentor meets the mentee, logs the session and adds recommendations.",
  "The HOD follows progress for the department and exports a summary.",
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      <header className="on-navy bg-navy">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="text-xl font-bold text-chiffon">MentorLink</span>
          <nav aria-label="Account" className="flex gap-2">
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-chiffon hover:bg-white/10">
              Sign in
            </Link>
            <Link href="/register" className="rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-navy hover:brightness-95">
              Register as mentee
            </Link>
          </nav>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-chiffon sm:text-5xl">
            Mentoring records for the whole department, in one place.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-chiffon/90">
            MentorLink replaces paper mentoring diaries: students keep their profile current, mentors write down what was
            discussed, the office verifies the data and the HOD sees where every batch stands.
          </p>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-bold text-navy">One system, four roles</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r) => (
            <li key={r.title} className="rounded-xl border border-line bg-surface p-5 shadow-sm">
              <h3 className="font-semibold text-navy">{r.title}</h3>
              <p className="mt-2 text-sm text-muted">{r.text}</p>
            </li>
          ))}
        </ul>

        <section aria-labelledby="flow" className="mt-12 rounded-xl bg-surface p-6 shadow-sm">
          <h2 id="flow" className="text-2xl font-bold text-navy">
            How a profile moves through the system
          </h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <li key={s} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy font-bold text-chiffon">
                  {i + 1}
                </span>
                <span className="pt-1 text-navy">{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/login">Sign in</ButtonLink>
            <ButtonLink href="/register" variant="secondary">
              Create a mentee account
            </ButtonLink>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-6 text-center text-sm text-muted">
        MentorLink · Mentor–mentee management for college departments
      </footer>
    </div>
  );
}
