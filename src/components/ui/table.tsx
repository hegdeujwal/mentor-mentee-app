import { cn } from "@/lib/utils";

/** Scroll container + base styles for data tables; columns stay readable on phones. */
export function Table({ className, children, label }: { className?: string; children: React.ReactNode; label: string }) {
  return (
    <div className={cn("overflow-x-auto rounded-xl border border-line bg-surface", className)} role="region" aria-label={label} tabIndex={0}>
      <table className="w-full min-w-[36rem] text-left text-sm">{children}</table>
    </div>
  );
}

export const th = "border-b border-line bg-navy/5 px-4 py-3 font-semibold text-navy";
export const td = "border-b border-line px-4 py-3 align-middle text-navy";
