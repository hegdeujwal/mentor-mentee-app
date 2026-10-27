"use client";

import Link from "next/link";
import { SelectField, TextField } from "@/components/ui/form";
import { FormMessage } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/submit-button";
import { DEPARTMENTS } from "@/lib/constants";
import { useValidatedAction } from "@/lib/use-validated-action";
import { registerAction } from "../actions";
import { registerSchema } from "../schemas";

export function RegisterForm() {
  const { formAction, onSubmit, errors, message } = useValidatedAction(registerAction, registerSchema);

  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormMessage {...message} />
      <TextField label="Full name" name="name" autoComplete="name" required errors={errors?.name} />
      <TextField label="College email" name="email" type="email" autoComplete="email" required errors={errors?.email} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="USN" name="usn" required errors={errors?.usn} hint="e.g. 4NM23IS001" />
        <SelectField
          label="Department"
          name="department"
          required
          placeholder="Select…"
          options={DEPARTMENTS.map((d) => ({ value: d.code, label: d.code }))}
          errors={errors?.department}
        />
      </div>
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="At least 8 characters with upper- and lowercase letters and a digit."
        errors={errors?.password}
      />
      <TextField
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        errors={errors?.confirmPassword}
      />
      <SubmitButton className="w-full" pendingLabel="Creating account…">
        Create account
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-navy underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
