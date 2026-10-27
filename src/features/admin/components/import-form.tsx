"use client";

import { useActionState } from "react";
import { TextField } from "@/components/ui/form";
import { FormMessage } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/submit-button";
import { Table, td, th } from "@/components/ui/table";
import { importMenteesAction, type ImportResult } from "../actions";

export function ImportForm() {
  const [state, action] = useActionState<ImportResult, FormData>(importMenteesAction, {});
  return (
    <div className="space-y-6">
      <form action={action} className="space-y-4" aria-label="Import mentees">
        <TextField label="CSV file" name="file" type="file" accept=".csv,text/csv" required hint="Up to 512 KB." />
        <FormMessage ok={state.ok} message={state.message} />
        <SubmitButton pendingLabel="Importing…">Import mentees</SubmitButton>
      </form>

      {state.created && state.created.length > 0 && (
        <section aria-labelledby="created-heading" className="space-y-2">
          <h2 id="created-heading" className="text-lg font-semibold text-navy">
            Created accounts
          </h2>
          <p className="text-sm text-muted">
            These temporary passwords are shown only once. Hand them to the students privately.
          </p>
          <Table label="Created accounts">
            <thead>
              <tr>
                <th className={th}>Name</th>
                <th className={th}>Email</th>
                <th className={th}>Temporary password</th>
              </tr>
            </thead>
            <tbody>
              {state.created.map((c) => (
                <tr key={c.email}>
                  <td className={td}>{c.name}</td>
                  <td className={td}>{c.email}</td>
                  <td className={`${td} font-mono`}>{c.tempPassword}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
      )}

      {state.skipped && state.skipped.length > 0 && (
        <section aria-labelledby="skipped-heading" className="space-y-2">
          <h2 id="skipped-heading" className="text-lg font-semibold text-navy">
            Skipped rows
          </h2>
          <Table label="Skipped rows">
            <thead>
              <tr>
                <th className={th}>Line</th>
                <th className={th}>Reason</th>
              </tr>
            </thead>
            <tbody>
              {state.skipped.map((s) => (
                <tr key={s.line}>
                  <td className={td}>{s.line}</td>
                  <td className={td}>{s.reason}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
      )}
    </div>
  );
}
