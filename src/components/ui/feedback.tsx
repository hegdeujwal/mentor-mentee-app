import { cn } from "@/lib/utils";

export function FormMessage({ ok, message }: { ok?: boolean; message?: string }) {
  if (!message) return null;
  return (
    <p
      role={ok ? "status" : "alert"}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm font-medium",
        ok ? "border-navy/30 bg-gold/40 text-navy" : "border-danger-ink/40 bg-tomato/10 text-danger-ink",
      )}
    >
      {message}
    </p>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-navy/30 bg-surface/60 px-6 py-10 text-center">
      <p className="font-semibold text-navy">{title}</p>
      {children && <div className="mt-1 text-sm text-muted">{children}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-lg bg-navy/10", className)} />;
}
