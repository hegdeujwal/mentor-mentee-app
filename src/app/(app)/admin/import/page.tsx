import type { Metadata } from "next";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/features/access/session";
import { ImportForm } from "@/features/admin/components/import-form";
import { IMPORT_COLUMNS } from "@/features/admin/schemas";

export const metadata: Metadata = { title: "CSV import" };

export default async function ImportPage() {
  await requireRole("ADMIN");
  return (
    <div className="space-y-6">
      <PageHeader title="Import mentees from CSV" description="Each valid row becomes a mentee account with a temporary password." />
      <Card>
        <CardTitle>File format</CardTitle>
        <p className="mt-2 text-sm text-navy">
          The first row must be a header. Columns: <code className="rounded bg-navy/10 px-1">{IMPORT_COLUMNS.join(", ")}</code>.
          Semester, section and mentor_email are optional. A mentor given by email must be in the same department.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-navy p-3 text-xs text-chiffon">
          {`name,email,usn,department,semester,section,mentor_email
Demo Student,demo.student@example.edu,DEMO23IS101,ISE,5,A,mentor1@demo.college.test`}
        </pre>
      </Card>
      <Card>
        <ImportForm />
      </Card>
    </div>
  );
}
