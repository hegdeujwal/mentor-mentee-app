import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { BarChart } from "@/components/ui/bar-chart";
import { requireRole } from "@/features/access/session";
import { adminOverview } from "@/features/admin/queries";
import { ROLE_LABEL, STATUS_LABEL } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Administration" };

export default async function AdminHome() {
  await requireRole("ADMIN");
  const o = await adminOverview();
  const roleCount = (r: keyof typeof ROLE_LABEL) => o.users.find((u) => u.role === r)?._count ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        description="Accounts, mentor assignments and profile verification."
        actions={
          <>
            <ButtonLink href="/admin/reviews">Review profiles ({o.pendingReviews})</ButtonLink>
            <ButtonLink href="/admin/import" variant="secondary">
              Import CSV
            </ButtonLink>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Mentees" value={roleCount("MENTEE")} />
        <StatCard label="Mentors" value={roleCount("MENTOR")} />
        <StatCard label="Awaiting review" value={o.pendingReviews} />
        <StatCard label="Mentees without mentor" value={o.unassigned} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <BarChart
            title="Profiles by status"
            data={(Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[]).map((s) => ({
              label: STATUS_LABEL[s],
              value: o.byStatus.find((b) => b.status === s)?._count ?? 0,
            }))}
          />
        </Card>
        <Card>
          <CardTitle>Latest activity</CardTitle>
          <div className="mt-4">
            {o.recent.length === 0 ? (
              <EmptyState title="No activity recorded yet" />
            ) : (
              <ul className="divide-y divide-line text-sm">
                {o.recent.map((r) => (
                  <li key={r.id} className="py-2">
                    <span className="font-semibold text-navy">{r.action.replaceAll("_", " ").toLowerCase()}</span>
                    <span className="text-muted">
                      {" "}
                      · {r.actor?.name ?? "anonymous"} · {formatDateTime(r.createdAt)}
                    </span>
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
