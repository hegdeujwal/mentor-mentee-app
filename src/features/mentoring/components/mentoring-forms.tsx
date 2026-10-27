"use client";

import { SelectField, TextArea, TextField } from "@/components/ui/form";
import { FormMessage } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/submit-button";
import { CATEGORY_LABEL, PRIORITY_LABEL } from "@/lib/constants";
import { useValidatedAction } from "@/lib/use-validated-action";
import { addNoteAction, addRecommendationAction, logSessionAction } from "../actions";
import { noteSchema, recommendationSchema, sessionSchema } from "../schemas";

const options = (labels: Record<string, string>) => Object.entries(labels).map(([value, label]) => ({ value, label }));

export function NoteForm({ menteeId }: { menteeId: string }) {
  const { formAction, onSubmit, errors, message } = useValidatedAction(addNoteAction, noteSchema);
  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-3" noValidate aria-label="Add note">
      <input type="hidden" name="menteeId" value={menteeId} />
      <TextArea label="Note" name="body" required errors={errors?.body} rows={4} />
      <SelectField
        label="Visibility"
        name="visibility"
        defaultValue="SHARED"
        options={[
          { value: "SHARED", label: "Shared – the mentee can read it" },
          { value: "PRIVATE", label: "Private – mentor, admin and HOD only" },
        ]}
        errors={errors?.visibility}
      />
      <FormMessage {...message} />
      <SubmitButton>Add note</SubmitButton>
    </form>
  );
}

export function RecommendationForm({ menteeId }: { menteeId: string }) {
  const { formAction, onSubmit, errors, message } = useValidatedAction(addRecommendationAction, recommendationSchema);
  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-3" noValidate aria-label="Add recommendation">
      <input type="hidden" name="menteeId" value={menteeId} />
      <TextField label="Title" name="title" required errors={errors?.title} />
      <TextArea label="Description" name="description" required errors={errors?.description} />
      <div className="grid gap-3 sm:grid-cols-3">
        <SelectField label="Category" name="category" defaultValue="COURSE" options={options(CATEGORY_LABEL)} errors={errors?.category} />
        <SelectField label="Priority" name="priority" defaultValue="MEDIUM" options={options(PRIORITY_LABEL)} errors={errors?.priority} />
        <TextField label="Due date" name="dueDate" type="date" errors={errors?.dueDate} />
      </div>
      <FormMessage {...message} />
      <SubmitButton>Add recommendation</SubmitButton>
    </form>
  );
}

export function SessionForm({ menteeId }: { menteeId: string }) {
  const { formAction, onSubmit, errors, message } = useValidatedAction(logSessionAction, sessionSchema);
  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-3" noValidate aria-label="Log session">
      <input type="hidden" name="menteeId" value={menteeId} />
      <TextField label="Date held" name="heldOn" type="date" required errors={errors?.heldOn} />
      <TextArea label="Agenda" name="agenda" required errors={errors?.agenda} />
      <TextArea label="Outcome" name="outcome" required errors={errors?.outcome} />
      <TextArea label="Follow-up" name="followUp" errors={errors?.followUp} />
      <FormMessage {...message} />
      <SubmitButton>Log session</SubmitButton>
    </form>
  );
}
