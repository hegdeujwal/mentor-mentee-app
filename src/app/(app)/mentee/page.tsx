import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/ui/stat-card";
import { requireRole } from "@/features/access/session";
import { getOwnProfile } from "@/features/profile/queries";
import { profileCompletion } from "@/features/profile/completion";
import { menteeFeedback } from "@/features/mentoring/queries";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview" };

const STATUS_HELP = {
  DRAFT: "Your profile has not been submitted yet. Complete it and submit it for review.",
  SUBMITTED: "Your profile is waiting for the administrator's review. Editing is locked until then.",
  ENDORSED: "Your profile has been verified. Editing it again will send it back to Draft.",
  CHANGES_REQUESTED: "The reviewer asked for changes. Update your profile and submit it again.",
} as const;

export default async function MenteeHome() {
  const user = await requireRole("MENTEE");
  const [me, feedback] = await Promise.all([getOwnProfile(user.id), menteeFeedback(user.id)]);
  const profile = me.profile!;
  const lastReview = profile.endorsements[0];
  const pendingNotes = feedback.notes.filter((n) => !n.acknowledgedAt).length;
  const pendingRecs = feedback.recommendations.filter((r) => !r.acknowledgedAt).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy sm:text-3xl">Hello, {me.name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-muted">
          {profile.usn} · Mentor: {me.assignment?.mentor.name ?? "not assigned yet"}
        </p>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle>Profile status</CardTitle>
          <StatusBadge status={profile.status} />
        </div>
        <p className="mt-2 text-sm text-navy">{STATUS_HELP[profile.status]}</p>
        {lastReview && (
          <div className="mt-3 rounded-lg border border-line bg-chiffon/60 p-3 text-sm">
            <p className="font-semibold text-navy">Last review remark</p>
            <p className="mt-1 text-navy">“{lastReview.remark}”</p>
            <p className="mt-1 text-xs text-muted">
              {lastReview.reviewer.name} · {formatDateTime(lastReview.createdAt)}
            </p>
          </div>
        )}
        <div className="mt-4 max-w-md">
          <Progress label="Profile completion" value={profileCompletion({ ...profile, name: me.name, email: me.email })} />
        </div>
        <ButtonLink href="/mentee/profile" className="mt-4">
          Open my profile
        </ButtonLink>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Shared notes" value={feedback.notes.length} hint={`${pendingNotes} not yet acknowledged`} />
        <StatCard label="Recommendations" value={feedback.recommendations.length} hint={`${pendingRecs} not yet acknowledged`} />
        <StatCard label="Mentoring sessions" value={feedback.sessions} hint="Logged by your mentor" />
      </div>
      {(pendingNotes > 0 || pendingRecs > 0) && (
        <p className="text-sm text-navy">
          You have unread feedback.{" "}
          <Link href="/mentee/feedback" className="font-semibold underline">
            Read and acknowledge it
          </Link>
          .
        </p>
      )}
    </div>
  );
}
