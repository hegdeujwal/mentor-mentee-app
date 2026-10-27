"use client";

import { useActionState } from "react";
import Link from "next/link";
import { TextField } from "@/components/ui/form";
import { FormMessage } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialState } from "@/lib/action-state";
import { loginAction } from "../actions";

export function LoginForm({ sessionEnded = false }: { sessionEnded?: boolean }) {
  const [state, action] = useActionState(loginAction, initialState);
  return (
    <form action={action} className="space-y-4" noValidate>
      {sessionEnded && !state.message && (
        <FormMessage ok={false} message="Your session has ended. Please sign in again." />
      )}
      <FormMessage {...state} />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        errors={state.errors?.email}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        errors={state.errors?.password}
      />
      <SubmitButton className="w-full" pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        New mentee?{" "}
        <Link href="/register" className="font-semibold text-navy underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
