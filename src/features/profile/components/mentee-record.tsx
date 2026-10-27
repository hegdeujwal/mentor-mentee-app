import { Avatar } from "@/components/ui/avatar";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Progress } from "@/components/ui/progress";
import { NoteList, RecommendationList, SessionList } from "@/features/mentoring/components/feeds";
import { formatDateTime } from "@/lib/utils";
import type { MenteeDetail } from "../queries";
import { profileCompletion } from "../completion";
import { ProfileView } from "./profile-view";

/** Header with identity, status and completion for one mentee. */
export function MenteeHeader({ detail }: { detail: MenteeDetail }) {
  const profile = detail.profile!;
  return (
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Avatar name={detail.name} src={profile.photoPath} size={72} />
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-navy">{detail.name}</h1>
          <StatusBadge status={profile.status} />
        </div>
        <p className="text-sm text-muted">
          {profile.usn} · {detail.department} · Mentor: {detail.assignment?.mentor.name ?? "not assigned"}
        </p>
      </div>
      <div className="sm:w-56">
        <Progress label="Profile completion" value={profileCompletion({ ...profile, name: detail.name, email: detail.email })} />
      </div>
    </Card>
  );
}

type Endorsements = NonNullable<MenteeDetail["profile"]>["endorsements"];

export function EndorsementHistory({ items }: { items: Endorsements }) {
  if (!items.length) return <EmptyState title="No review decisions yet" />;
  return (
    <ol className="space-y-3">
      {items.map((e) => (
        <li key={e.id} className="rounded-lg border border-line bg-surface p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={e.decision === "ENDORSED" ? "gold" : "tomato"}>
              {e.decision === "ENDORSED" ? "Endorsed" : "Changes requested"}
            </Badge>
            <span className="text-xs text-muted">
              by {e.reviewer.name} on {formatDateTime(e.createdAt)}
            </span>
          </div>
          <p className="mt-2 text-sm text-navy">{e.remark}</p>
        </li>
      ))}
    </ol>
  );
}

/** Complete read view of a mentee. `actions` lets the mentor page add its forms. */
export function MenteeRecord({
  detail,
  actions,
}: {
  detail: MenteeDetail;
  actions?: { notes?: React.ReactNode; recommendations?: React.ReactNode; sessions?: React.ReactNode };
}) {
  return (
    <div className="space-y-8">
      <MenteeHeader detail={detail} />
      <section aria-labelledby="profile-heading" className="space-y-3">
        <h2 id="profile-heading" className="text-xl font-bold text-navy">
          Profile
        </h2>
        <ProfileView email={detail.email} profile={detail.profile!} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="notes-heading">
          <Card>
            <CardTitle id="notes-heading">Notes</CardTitle>
            {actions?.notes && <div className="mt-4 border-b border-line pb-5">{actions.notes}</div>}
            <div className="mt-4">
              <NoteList notes={detail.notesReceived} />
            </div>
          </Card>
        </section>
        <section aria-labelledby="recs-heading">
          <Card>
            <CardTitle id="recs-heading">Recommendations</CardTitle>
            {actions?.recommendations && <div className="mt-4 border-b border-line pb-5">{actions.recommendations}</div>}
            <div className="mt-4">
              <RecommendationList items={detail.recommendationsReceived} />
            </div>
          </Card>
        </section>
        <section aria-labelledby="sessions-heading">
          <Card>
            <CardTitle id="sessions-heading">Mentoring sessions</CardTitle>
            {actions?.sessions && <div className="mt-4 border-b border-line pb-5">{actions.sessions}</div>}
            <div className="mt-4">
              <SessionList sessions={detail.sessionsAttended} />
            </div>
          </Card>
        </section>
        <section aria-labelledby="reviews-heading">
          <Card>
            <CardTitle id="reviews-heading">Endorsement history</CardTitle>
            <div className="mt-4">
              <EndorsementHistory items={detail.profile!.endorsements} />
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
