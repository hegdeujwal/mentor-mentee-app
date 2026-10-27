"use client";

import { Button } from "@/components/ui/button";

export function PageError({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-danger-ink/40 bg-surface p-6">
      <h1 className="text-xl font-bold text-danger-ink">Something went wrong</h1>
      <p className="mt-2 text-sm text-navy">
        The page could not be loaded. Your data has not been changed. Try again, and contact the department office if
        the problem continues.
      </p>
      <Button className="mt-4" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
