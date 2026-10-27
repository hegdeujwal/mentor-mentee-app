import type { Metadata } from "next";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireRole } from "@/features/access/session";
import { menteeFeedback } from "@/features/mentoring/queries";
import { NoteList, RecommendationList } from "@/features/mentoring/components/feeds";

export const metadata: Metadata = { title: "Mentor feedback" };

export default async function MenteeFeedbackPage() {
  const user = await requireRole("MENTEE");
  const { notes, recommendations } = await menteeFeedback(user.id);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mentor feedback"
        description="Notes your mentor has shared with you and the actions they recommend. Acknowledge each one once you have read it."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Recommendations</CardTitle>
          <div className="mt-4">
            <RecommendationList items={recommendations} canAcknowledge />
          </div>
        </Card>
        <Card>
          <CardTitle>Shared notes</CardTitle>
          <div className="mt-4">
            <NoteList notes={notes} canAcknowledge />
          </div>
        </Card>
      </div>
    </div>
  );
}
