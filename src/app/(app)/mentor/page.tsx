import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { BarChart } from "@/components/ui/bar-chart";
import { requireRole } from "@/features/access/session";
import { mentorOverview } from "@/features/mentoring/queries";
import { STATUS_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Mentor overview" };

export default async function MentorHome() {
  const mentor = await requireRole("MENTOR");
  const o = await mentorOverview(mentor.id);
  const statusCount = (s: keyof typeof STATUS_LABEL) => o.byStatus.find((b) => b.status === s)?._count ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${mentor.name}`}
        description="A summary of the students assigned to you."
        actions={<ButtonLink href="/mentor/mentees">View my mentees</ButtonLink>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Assigned mentees" value={o.mentees} />
        <StatCard label="Sessions logged" value={o.sessions} />
        <StatCard label="Endorsed profiles" value={statusCount("ENDORSED")} />
        <StatCard label="Unacknowledged recommendations" value={o.openRecs} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <BarChart
            title="Profile status of my mentees"
            data={(Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[]).map((s) => ({
              label: STATUS_LABEL[s],
              value: statusCount(s),
            }))}
          />
        </Card>
        <Card>
          <CardTitle>Recent sessions</CardTitle>
          <div className="mt-4">
            {o.recentSessions.length === 0 ? (
              <EmptyState title="No sessions logged yet">Open a mentee to log your first session.</EmptyState>
            ) : (
              <ul className="divide-y divide-line">
                {o.recentSessions.map((s) => (
                  <li key={s.id} className="py-3 text-sm">
                    <Link href={`/mentor/mentees/${s.mentee.id}`} className="font-semibold text-navy underline">
                      {s.mentee.name}
                    </Link>
                    <span className="text-muted"> · {formatDate(s.heldOn)}</span>
                    <p className="mt-1 line-clamp-2 text-navy">{s.agenda}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
