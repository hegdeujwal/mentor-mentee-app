import type { Metadata } from "next";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { BarChart } from "@/components/ui/bar-chart";
import { Table, td, th } from "@/components/ui/table";
import { requireRole } from "@/features/access/session";
import { departmentSummary } from "@/features/hod/queries";

export const metadata: Metadata = { title: "Department overview" };

export default async function HodHome() {
  const hod = await requireRole("HOD");
  const s = await departmentSummary(hod.department);
  const t = s.totals;
  const pending = t.submitted + t.changesRequested + t.draft;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Department overview · ${s.department}`}
        description="Read-only summary of mentoring in your department."
        actions={
          <>
            {/* Plain anchors: these are file downloads, not client-side navigations. */}
            <a href="/hod/export/csv" className="inline-flex min-h-10 items-center rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-chiffon hover:bg-navy-deep">
              Export CSV
            </a>
            <a href="/hod/export/pdf" className="inline-flex min-h-10 items-center rounded-lg bg-sandy px-4 py-2 text-sm font-semibold text-navy hover:brightness-95">
              Export PDF
            </a>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total mentees" value={t.mentees} hint={`${t.unassigned} without a mentor`} />
        <StatCard label="Endorsed profiles" value={t.endorsed} hint={`${pending} pending`} />
        <StatCard label="Mentoring sessions" value={t.sessions} />
        <StatCard label="Average completion" value={`${t.averageCompletion}%`} />
      </div>

      {t.mentees === 0 ? (
        <EmptyState title="No mentees in this department yet" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <BarChart
              title="Endorsed vs pending profiles"
              data={[
                { label: "Endorsed", value: t.endorsed },
                { label: "Submitted", value: t.submitted },
                { label: "Changes requested", value: t.changesRequested },
                { label: "Draft", value: t.draft },
              ]}
            />
          </Card>
          <Card>
            <BarChart title="Mentees per mentor" data={s.workload.map((w) => ({ label: w.name, value: w.mentees }))} />
          </Card>
          <Card>
            <BarChart title="Profile completion (number of mentees)" data={s.completionBuckets} />
          </Card>
          <Card>
            <BarChart title="Sessions logged per mentor" data={s.workload.map((w) => ({ label: w.name, value: w.sessions }))} />
          </Card>
        </div>
      )}

      <section aria-labelledby="workload-heading" className="space-y-3">
        <CardTitle id="workload-heading">Mentor workload</CardTitle>
        {s.workload.length === 0 ? (
          <EmptyState title="No mentors in this department" />
        ) : (
          <Table label="Mentor workload">
            <thead>
              <tr>
                <th className={th}>Mentor</th>
                <th className={th}>Mentees</th>
                <th className={th}>Sessions</th>
                <th className={th}>Notes</th>
                <th className={th}>Recommendations</th>
              </tr>
            </thead>
            <tbody>
              {s.workload.map((w) => (
                <tr key={w.id}>
                  <td className={td}>{w.name}</td>
                  <td className={td}>{w.mentees}</td>
                  <td className={td}>{w.sessions}</td>
                  <td className={td}>{w.notes}</td>
                  <td className={td}>{w.recommendations}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>
    </div>
  );
}
