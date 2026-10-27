import type { Metadata } from "next";
import Link from "next/link";
import { requireMenteeAccess, requireRole } from "@/features/access/session";
import { getMenteeDetail } from "@/features/profile/queries";
import { MenteeRecord } from "@/features/profile/components/mentee-record";

export const metadata: Metadata = { title: "Mentee record" };

export default async function HodMenteePage({ params }: { params: Promise<{ id: string }> }) {
  const hod = await requireRole("HOD");
  const { id } = await params;
  await requireMenteeAccess(hod, id); // 404 for mentees outside the HOD's department
  const detail = await getMenteeDetail(hod, id);
  return (
    <div className="space-y-4">
      <Link href="/hod/mentees" className="text-sm font-semibold text-navy underline">
        ← Back to department mentees
      </Link>
      <MenteeRecord detail={detail} />
    </div>
  );
}
