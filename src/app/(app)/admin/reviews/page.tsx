import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { Table, td, th } from "@/components/ui/table";
import { requireRole } from "@/features/access/session";
import { recentDecisions, reviewQueue } from "@/features/admin/queries";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Profile reviews" };

export default async function ReviewsPage() {
  await requireRole("ADMIN");
  const [queue, decisions] = await Promise.all([reviewQueue(), recentDecisions()]);

  return (
    <div className="space-y-6">
      <PageHeader title="Profile reviews" description="Submitted profiles, oldest first. Open one to endorse it or request changes." />
      {queue.length === 0 ? (
        <EmptyState title="Nothing to review">All submitted profiles have been handled.</EmptyState>
      ) : (
        <Table label="Profiles awaiting review">
          <thead>
            <tr>
              <th className={th}>Mentee</th>
              <th className={th}>USN</th>
              <th className={th}>Dept</th>
              <th className={th}>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((p) => (
              <tr key={p.id}>
                <td className={td}>
                  <Link href={`/admin/mentees/${p.user.id}`} className="font-semibold text-navy underline">
                    {p.user.name}
                  </Link>
                </td>
                <td className={td}>{p.usn}</td>
                <td className={td}>{p.department}</td>
                <td className={td}>{formatDateTime(p.submittedAt)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Card>
        <CardTitle>Recent decisions</CardTitle>
        <div className="mt-4">
          {decisions.length === 0 ? (
            <EmptyState title="No decisions recorded yet" />
          ) : (
            <ul className="divide-y divide-line text-sm">
              {decisions.map((d) => (
                <li key={d.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-3">
                  <Badge tone={d.decision === "ENDORSED" ? "gold" : "tomato"}>
                    {d.decision === "ENDORSED" ? "Endorsed" : "Changes requested"}
                  </Badge>
                  <Link href={`/admin/mentees/${d.profile.user.id}`} className="font-semibold text-navy underline">
                    {d.profile.user.name}
                  </Link>
                  <span className="text-muted">
                    by {d.reviewer.name} · {formatDateTime(d.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}
