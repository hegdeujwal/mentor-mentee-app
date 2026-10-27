"use client";

import { useActionState, useState } from "react";
import { z } from "zod";
import { initialState, type ActionState } from "./action-state";

type Errors = Record<string, string[] | undefined>;

/**
 * Wraps a server action with client-side validation using the same Zod schema
 * the server uses. Invalid forms are stopped before any request is made.
 */
export function useValidatedAction(
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>,
  schema: z.ZodType,
  extraCheck?: (data: FormData) => Errors,
) {
  const [state, formAction] = useActionState(action, initialState);
  const [clientErrors, setClientErrors] = useState<Errors>();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const data = new FormData(form);
    const strings = Object.fromEntries([...data].filter(([, value]) => typeof value === "string"));
    const parsed = schema.safeParse(strings);
    const found: Errors = {
      ...(parsed.success ? {} : z.flattenError(parsed.error).fieldErrors),
      ...extraCheck?.(data),
    };
    if (Object.values(found).some((v) => v?.length)) {
      e.preventDefault();
      setClientErrors(found);
      requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
    } else {
      setClientErrors(undefined);
    }
  }

  const message = clientErrors ? { ok: false, message: "Please correct the highlighted fields." } : state;
  return { formAction, onSubmit, errors: clientErrors ?? state.errors, message, state };
}
