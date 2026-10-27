import type { Metadata } from "next";
import Link from "next/link";
import { requireMenteeAccess, requireRole } from "@/features/access/session";
import { getMenteeDetail } from "@/features/profile/queries";
import { MenteeRecord } from "@/features/profile/components/mentee-record";
import { NoteForm, RecommendationForm, SessionForm } from "@/features/mentoring/components/mentoring-forms";

export const metadata: Metadata = { title: "Mentee" };

export default async function MentorMenteePage({ params }: { params: Promise<{ id: string }> }) {
  const mentor = await requireRole("MENTOR");
  const { id } = await params;
  await requireMenteeAccess(mentor, id); // 404 unless this mentee is assigned to this mentor
  const detail = await getMenteeDetail(mentor, id);

  return (
    <div className="space-y-4">
      <Link href="/mentor/mentees" className="text-sm font-semibold text-navy underline">
        ← Back to my mentees
      </Link>
      <MenteeRecord
        detail={detail}
        actions={{
          notes: <NoteForm menteeId={id} />,
          recommendations: <RecommendationForm menteeId={id} />,
          sessions: <SessionForm menteeId={id} />,
        }}
      />
    </div>
  );
}
