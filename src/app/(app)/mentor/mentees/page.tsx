import type { Metadata } from "next";
import Link from "next/link";
import type { ProfileStatus } from "@prisma/client";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { Table, td, th } from "@/components/ui/table";
import { requireRole } from "@/features/access/session";
import { listMentorMentees } from "@/features/mentoring/queries";
import { STATUS_LABEL } from "@/lib/constants";

export const metadata: Metadata = { title: "My mentees" };

const control = "rounded-lg border border-navy/30 bg-surface px-3 py-2 text-sm text-navy";

export default async function MentorMenteesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const mentor = await requireRole("MENTOR");
  const params = await searchParams;
  const q = params.q?.trim().slice(0, 60) || undefined;
  const status = params.status && params.status in STATUS_LABEL ? (params.status as ProfileStatus) : undefined;
  const semesterNum = Number(params.semester);
  const semester = Number.isInteger(semesterNum) && semesterNum >= 1 && semesterNum <= 8 ? semesterNum : undefined;
  const mentees = await listMentorMentees(mentor.id, { q, status, semester });
  const filtered = Boolean(q || status || semester);

  return (
    <div className="space-y-6">
      <PageHeader title="My mentees" description="Only students assigned to you are listed here." />

      <form role="search" aria-label="Filter mentees" className="grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-[1fr_auto_auto_auto]">
        <label className="sr-only" htmlFor="q">
          Search by name, email or USN
        </label>
        <input id="q" name="q" defaultValue={q} placeholder="Search name, email or USN" className={control} />
        <label className="sr-only" htmlFor="status">
          Status
        </label>
        <select id="status" name="status" defaultValue={status ?? ""} className={control}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="semester">
          Semester
        </label>
        <select id="semester" name="semester" defaultValue={semester ?? ""} className={control}>
          <option value="">All semesters</option>
          {Array.from({ length: 8 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Semester {i + 1}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <Button type="submit">Apply</Button>
          {filtered && (
            <ButtonLink href="/mentor/mentees" variant="ghost">
              Clear
            </ButtonLink>
          )}
        </div>
      </form>

      <p className="text-sm text-muted" aria-live="polite">
        {mentees.length} mentee{mentees.length === 1 ? "" : "s"} shown
      </p>

      {mentees.length === 0 ? (
        <EmptyState title={filtered ? "No mentees match these filters" : "No mentees assigned yet"}>
          {filtered ? "Try a different search or clear the filters." : "The administrator will assign students to you."}
        </EmptyState>
      ) : (
        <Table label="Assigned mentees">
          <thead>
            <tr>
              <th className={th}>Mentee</th>
              <th className={th}>USN</th>
              <th className={th}>Sem / Sec</th>
              <th className={th}>Status</th>
              <th className={th}>Completion</th>
              <th className={th}>Sessions</th>
            </tr>
          </thead>
          <tbody>
            {mentees.map((m) => (
              <tr key={m.id} className="hover:bg-chiffon/50">
                <td className={td}>
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} src={m.photoPath} size={36} />
                    <Link href={`/mentor/mentees/${m.id}`} className="font-semibold text-navy underline">
                      {m.name}
                    </Link>
                  </div>
                </td>
                <td className={td}>{m.usn}</td>
                <td className={td}>{m.semester ? `${m.semester} / ${m.section ?? "—"}` : "—"}</td>
                <td className={td}>
                  <StatusBadge status={m.status} />
                </td>
                <td className={td}>{m.completion}%</td>
                <td className={td}>{m.sessions}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
