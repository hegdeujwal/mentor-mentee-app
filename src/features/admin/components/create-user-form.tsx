"use client";

import { useState } from "react";
import { SelectField, TextField } from "@/components/ui/form";
import { FormMessage } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/submit-button";
import { DEPARTMENTS, ROLE_LABEL } from "@/lib/constants";
import { useValidatedAction } from "@/lib/use-validated-action";
import { createUserAction } from "../actions";
import { createUserSchema } from "../schemas";

export function CreateUserForm() {
  const { formAction, onSubmit, errors, message } = useValidatedAction(createUserAction, createUserSchema);
  const [role, setRole] = useState("MENTEE");
  return (
    <form action={formAction} onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate aria-label="Create user">
      <TextField label="Full name" name="name" required errors={errors?.name} />
      <TextField label="Email" name="email" type="email" required errors={errors?.email} />
      <SelectField
        label="Role"
        name="role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        options={Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label }))}
        errors={errors?.role}
      />
      <SelectField
        label="Department"
        name="department"
        defaultValue="ISE"
        options={DEPARTMENTS.map((d) => ({ value: d.code, label: d.code }))}
        errors={errors?.department}
      />
      {role === "MENTEE" && <TextField label="USN" name="usn" required errors={errors?.usn} />}
      <TextField
        label="Initial password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        hint="8+ characters with upper- and lowercase letters and a digit."
        errors={errors?.password}
      />
      <div className="space-y-3 sm:col-span-2">
        <FormMessage {...message} />
        <SubmitButton>Create user</SubmitButton>
      </div>
    </form>
  );
}
