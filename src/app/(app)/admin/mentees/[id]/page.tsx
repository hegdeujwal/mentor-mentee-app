import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { requireMenteeAccess, requireRole } from "@/features/access/session";
import { getMenteeDetail } from "@/features/profile/queries";
import { MenteeRecord } from "@/features/profile/components/mentee-record";
import { canReview } from "@/features/profile/status";
import { ReviewForm } from "@/features/admin/components/review-form";

export const metadata: Metadata = { title: "Mentee record" };

export default async function AdminMenteePage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireRole("ADMIN");
  const { id } = await params;
  await requireMenteeAccess(admin, id);
  const detail = await getMenteeDetail(admin, id);
  const profile = detail.profile!;

  return (
    <div className="space-y-4">
      <Link href="/admin/reviews" className="text-sm font-semibold text-navy underline">
        ← Back to reviews
      </Link>
      {canReview(profile.status) && (
        <Card className="border-2 border-sandy">
          <CardTitle>Review this profile</CardTitle>
          <p className="mt-1 text-sm text-muted">Check the details below, then record your decision.</p>
          <div className="mt-4">
            <ReviewForm profileId={profile.id} />
          </div>
        </Card>
      )}
      <MenteeRecord detail={detail} />
    </div>
  );
}
