"use client";

import { PageError } from "@/components/states/page-error";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <PageError reset={reset} />;
}
