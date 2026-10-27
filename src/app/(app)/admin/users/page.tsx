import type { Metadata } from "next";
import type { Role } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table, td, th } from "@/components/ui/table";
import { requireRole } from "@/features/access/session";
import { listUsers } from "@/features/admin/queries";
import { toggleUserAction } from "@/features/admin/actions";
import { CreateUserForm } from "@/features/admin/components/create-user-form";
import { ROLE_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Users" };

const control = "rounded-lg border border-navy/30 bg-surface px-3 py-2 text-sm text-navy";

export default async function UsersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const admin = await requireRole("ADMIN");
  const params = await searchParams;
  const q = params.q?.trim().slice(0, 60) || undefined;
  const role = params.role && params.role in ROLE_LABEL ? (params.role as Role) : undefined;
  const users = await listUsers({ q, role });

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Create accounts and activate or deactivate them. Accounts are never deleted, so history is kept." />

      <Card>
        <CardTitle>Add a user</CardTitle>
        <div className="mt-4">
          <CreateUserForm />
        </div>
      </Card>

      <form role="search" aria-label="Filter users" className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="q" className="sr-only">
          Search users
        </label>
        <input id="q" name="q" defaultValue={q} placeholder="Search name or email" className={`${control} flex-1`} />
        <label htmlFor="role" className="sr-only">
          Role
        </label>
        <select id="role" name="role" defaultValue={role ?? ""} className={control}>
          <option value="">All roles</option>
          {Object.entries(ROLE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Button type="submit">Apply</Button>
        {(q || role) && (
          <ButtonLink href="/admin/users" variant="ghost">
            Clear
          </ButtonLink>
        )}
      </form>

      {users.length === 0 ? (
        <EmptyState title="No users match these filters" />
      ) : (
        <Table label="Users">
          <thead>
            <tr>
              <th className={th}>Name</th>
              <th className={th}>Email</th>
              <th className={th}>Role</th>
              <th className={th}>Dept</th>
              <th className={th}>Created</th>
              <th className={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className={td}>{u.name}</td>
                <td className={td}>{u.email}</td>
                <td className={td}>{ROLE_LABEL[u.role]}</td>
                <td className={td}>{u.department}</td>
                <td className={td}>{formatDate(u.createdAt)}</td>
                <td className={td}>
                  <div className="flex items-center gap-2">
                    {u.isActive ? <Badge tone="gold">Active</Badge> : <Badge tone="tomato">Inactive</Badge>}
                    {u.id !== admin.id && (
                      <form action={toggleUserAction}>
                        <input type="hidden" name="userId" value={u.id} />
                        <input type="hidden" name="active" value={String(!u.isActive)} />
                        <SubmitButton
                          variant={u.isActive ? "danger" : "outline"}
                          className="min-h-8 px-3 py-1 text-xs"
                          pendingLabel="…"
                          aria-label={`${u.isActive ? "Deactivate" : "Activate"} ${u.name}`}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
