"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialState } from "@/lib/action-state";
import { assignMentorAction } from "../actions";

export function AssignForm({
  menteeId,
  menteeName,
  currentMentorId,
  mentors,
}: {
  menteeId: string;
  menteeName: string;
  currentMentorId: string | null;
  mentors: { id: string; name: string; load: number }[];
}) {
  const [state, action] = useActionState(assignMentorAction, initialState);
  const selectId = `mentor-${menteeId}`;
  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input type="hidden" name="menteeId" value={menteeId} />
      <label htmlFor={selectId} className="sr-only">
        Mentor for {menteeName}
      </label>
      <select
        id={selectId}
        name="mentorId"
        defaultValue={currentMentorId ?? ""}
        className="rounded-lg border border-navy/30 bg-surface px-3 py-2 text-sm text-navy"
      >
        <option value="">— No mentor —</option>
        {mentors.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} ({m.load})
          </option>
        ))}
      </select>
      <SubmitButton variant="outline" className="min-h-9 py-1" aria-label={`Save mentor for ${menteeName}`}>
        Save
      </SubmitButton>
      {state.message && (
        <span role={state.ok ? "status" : "alert"} className={state.ok ? "text-xs text-navy" : "text-xs font-medium text-danger-ink"}>
          {state.message}
        </span>
      )}
    </form>
  );
}
