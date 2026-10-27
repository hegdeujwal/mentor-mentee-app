"use client";

import { TextArea } from "@/components/ui/form";
import { FormMessage } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/submit-button";
import { useValidatedAction } from "@/lib/use-validated-action";
import { reviewProfileAction } from "../actions";
import { reviewSchema } from "../schemas";

export function ReviewForm({ profileId }: { profileId: string }) {
  const { formAction, onSubmit, errors, message } = useValidatedAction(reviewProfileAction, reviewSchema);
  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-3" noValidate aria-label="Review profile">
      <input type="hidden" name="profileId" value={profileId} />
      <fieldset>
        <legend className="text-sm font-medium text-navy">Decision</legend>
        <div className="mt-2 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="radio" name="decision" value="ENDORSED" defaultChecked className="h-4 w-4 accent-navy" />
            Endorse
          </label>
          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="radio" name="decision" value="CHANGES_REQUESTED" className="h-4 w-4 accent-navy" />
            Request changes
          </label>
        </div>
      </fieldset>
      <TextArea label="Remark" name="remark" required errors={errors?.remark} hint="Recorded with your name and the time." />
      <FormMessage {...message} />
      <SubmitButton pendingLabel="Recording…">Record decision</SubmitButton>
    </form>
  );
}
