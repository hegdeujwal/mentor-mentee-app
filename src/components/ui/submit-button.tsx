"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonVariant } from "./button";

/** Submit button that disables itself and swaps its label while the form is pending. */
export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> & { pendingLabel?: string; variant?: ButtonVariant }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} disabled={pending} aria-busy={pending} {...props}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
