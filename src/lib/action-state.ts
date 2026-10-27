import { z } from "zod";

/** Shape returned by every form server action and consumed by useActionState. */
export type ActionState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
  /** Non-secret values echoed back so a form can keep them after a failed submit. */
  values?: Record<string, string>;
};

export const initialState: ActionState = {};

export function zodErrors(error: z.ZodError): ActionState {
  return {
    ok: false,
    message: "Please correct the highlighted fields.",
    errors: z.flattenError(error).fieldErrors as Record<string, string[]>,
  };
}

/** Collects string values from FormData; File entries are ignored. */
export function formValues(formData: FormData, keys: readonly string[]) {
  const out: Record<string, string | undefined> = {};
  for (const key of keys) {
    const value = formData.get(key);
    out[key] = typeof value === "string" ? value : undefined;
  }
  return out;
}
