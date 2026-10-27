import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-navy text-chiffon hover:bg-navy-deep",
  secondary: "bg-sandy text-navy hover:brightness-95",
  outline: "border border-navy bg-transparent text-navy hover:bg-navy/5",
  danger: "bg-tomato text-on-tomato hover:brightness-95",
  ghost: "bg-transparent text-navy hover:bg-navy/5",
} as const;

export type ButtonVariant = keyof typeof variants;

const base =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cn(base, variants[variant], className);
}

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: React.ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}
