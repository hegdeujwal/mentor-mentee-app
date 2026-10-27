import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { Table, td, th } from "@/components/ui/table";
import { requireRole } from "@/features/access/session";
import { AUDIT_PAGE_SIZE, auditPage } from "@/features/admin/queries";
import { ROLE_LABEL } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Audit log" };

export default async function AuditPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireRole("ADMIN");
  const params = await searchParams;
  const page = Math.max(1, Math.floor(Number(params.page)) || 1);
  const action = params.action && /^[A-Z_]{3,40}$/.test(params.action) ? params.action : undefined;
  const { total, rows, actions } = await auditPage(page, action);
  const pages = Math.max(1, Math.ceil(total / AUDIT_PAGE_SIZE));
  const link = (p: number) => `/admin/audit?page=${p}${action ? `&action=${action}` : ""}`;

  return (
    <div className="space-y-6">
      <PageHeader title="Audit log" description={`${total} recorded event${total === 1 ? "" : "s"}, newest first.`} />
      <form role="search" aria-label="Filter audit log" className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="action" className="sr-only">
          Action
        </label>
        <select id="action" name="action" defaultValue={action ?? ""} className="rounded-lg border border-navy/30 bg-surface px-3 py-2 text-sm text-navy">
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <Button type="submit">Filter</Button>
      </form>

      {rows.length === 0 ? (
        <EmptyState title="No events" />
      ) : (
        <Table label="Audit events">
          <thead>
            <tr>
              <th className={th}>When</th>
              <th className={th}>Actor</th>
              <th className={th}>Action</th>
              <th className={th}>Entity</th>
              <th className={th}>Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className={`${td} whitespace-nowrap`}>{formatDateTime(r.createdAt)}</td>
                <td className={td}>{r.actor ? `${r.actor.name} (${ROLE_LABEL[r.actor.role]})` : "—"}</td>
                <td className={`${td} font-mono text-xs`}>{r.action}</td>
                <td className={td}>{r.entity}</td>
                <td className={`${td} max-w-xs break-words font-mono text-xs`}>{r.details ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <nav aria-label="Audit log pages" className="flex items-center justify-between">
        {page > 1 ? <ButtonLink href={link(page - 1)} variant="outline">Previous</ButtonLink> : <span />}
        <span className="text-sm text-muted">
          Page {page} of {pages}
        </span>
        {page < pages ? <ButtonLink href={link(page + 1)} variant="outline">Next</ButtonLink> : <span />}
      </nav>
    </div>
  );
}
