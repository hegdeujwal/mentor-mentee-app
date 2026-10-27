import type { ProfileStatus } from "@prisma/client";
import { STATUS_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";

const tones = {
  gold: "bg-gold text-navy",
  sandy: "bg-sandy text-navy",
  tomato: "bg-tomato text-on-tomato",
  navy: "bg-navy text-chiffon",
  outline: "border border-navy/40 text-navy",
} as const;

export function Badge({
  tone = "outline",
  className,
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}

const statusTone: Record<ProfileStatus, keyof typeof tones> = {
  DRAFT: "outline",
  SUBMITTED: "sandy",
  ENDORSED: "gold",
  CHANGES_REQUESTED: "tomato",
};

export function StatusBadge({ status }: { status: ProfileStatus }) {
  return <Badge tone={statusTone[status]}>{STATUS_LABEL[status]}</Badge>;
}
