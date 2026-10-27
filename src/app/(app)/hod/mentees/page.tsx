import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { Table, td, th } from "@/components/ui/table";
import { requireRole } from "@/features/access/session";
import { departmentSummary } from "@/features/hod/queries";

export const metadata: Metadata = { title: "Department mentees" };

export default async function HodMenteesPage() {
  const hod = await requireRole("HOD");
  const { rows } = await departmentSummary(hod.department);

  return (
    <div className="space-y-6">
      <PageHeader title="Department mentees" description={`All active mentees in ${hod.department}.`} />
      {rows.length === 0 ? (
        <EmptyState title="No mentees yet" />
      ) : (
        <Table label="Department mentees">
          <thead>
            <tr>
              <th className={th}>Name</th>
              <th className={th}>USN</th>
              <th className={th}>Sem</th>
              <th className={th}>Mentor</th>
              <th className={th}>Status</th>
              <th className={th}>Completion</th>
              <th className={th}>Sessions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className={td}>
                  <Link href={`/hod/mentees/${r.id}`} className="font-semibold text-navy underline">
                    {r.name}
                  </Link>
                </td>
                <td className={td}>{r.usn}</td>
                <td className={td}>{r.semester ?? "—"}</td>
                <td className={td}>{r.mentor ?? "Unassigned"}</td>
                <td className={td}>
                  <StatusBadge status={r.status} />
                </td>
                <td className={td}>{r.completion}%</td>
                <td className={td}>{r.sessions}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
