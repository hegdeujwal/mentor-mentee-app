import type { Metadata } from "next";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Progress } from "@/components/ui/progress";
import { requireRole } from "@/features/access/session";
import { getOwnProfile } from "@/features/profile/queries";
import { missingForSubmission, profileCompletion } from "@/features/profile/completion";
import { canEdit, canSubmit } from "@/features/profile/status";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { SubmitProfile } from "@/features/profile/components/submit-profile";

export const metadata: Metadata = { title: "My profile" };

export default async function MenteeProfilePage() {
  const user = await requireRole("MENTEE");
  const me = await getOwnProfile(user.id);
  const profile = me.profile!;
  const combined = { ...profile, name: me.name, email: me.email };
  const lastReview = profile.endorsements[0];

  return (
    <div className="space-y-6">
      <PageHeader title="My profile" description="Keep this up to date. Your mentor and the department office read it." />

      <Card className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-navy">Verification status:</span>
            <StatusBadge status={profile.status} />
          </div>
          {profile.status === "CHANGES_REQUESTED" && lastReview && (
            <p role="note" className="rounded-lg border border-danger-ink/40 bg-tomato/10 p-3 text-sm text-navy">
              <span className="font-semibold text-danger-ink">Requested changes: </span>
              {lastReview.remark}
            </p>
          )}
          {profile.status === "SUBMITTED" && (
            <p role="status" className="text-sm text-navy">
              Your profile has been submitted and is waiting for review. Editing is locked until a decision is recorded.
            </p>
          )}
          <Progress label="Completion" value={profileCompletion(combined)} />
        </div>
        {canSubmit(profile.status) && <SubmitProfile missing={missingForSubmission(combined)} />}
      </Card>

      <ProfileForm
        locked={!canEdit(profile.status)}
        values={{ ...profile, name: me.name, email: me.email }}
      />
    </div>
  );
}
