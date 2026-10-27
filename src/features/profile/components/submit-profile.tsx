"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialState } from "@/lib/action-state";
import { submitProfileAction } from "../actions";

export function SubmitProfile({ missing }: { missing: string[] }) {
  const [state, action] = useActionState(submitProfileAction, initialState);
  return (
    <form action={action} className="space-y-3">
      {missing.length > 0 && (
        <p className="text-sm text-muted">
          Still needed before you can submit: <span className="font-medium text-navy">{missing.join(", ")}</span>.
        </p>
      )}
      <FormMessage {...state} />
      <SubmitButton variant="secondary" pendingLabel="Submitting…">
        Submit for review
      </SubmitButton>
    </form>
  );
}
