import type { Note, Recommendation, MentoringSession } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/submit-button";
import { CATEGORY_LABEL, PRIORITY_LABEL } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import { acknowledgeAction } from "../actions";

type WithAuthor = Note & { author: { name: string } };
type WithMentor<T> = T & { mentor: { name: string } };

const priorityTone = { HIGH: "tomato", MEDIUM: "sandy", LOW: "outline" } as const;

function AcknowledgeButton({ kind, id }: { kind: "note" | "recommendation"; id: string }) {
  return (
    <form action={acknowledgeAction}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <SubmitButton variant="outline" pendingLabel="Saving…" className="min-h-8 px-3 py-1 text-xs">
        Acknowledge
      </SubmitButton>
    </form>
  );
}

function Acknowledged({ at }: { at: Date }) {
  return <span className="text-xs text-muted">Acknowledged {formatDate(at)}</span>;
}

export function NoteList({ notes, canAcknowledge = false }: { notes: WithAuthor[]; canAcknowledge?: boolean }) {
  if (!notes.length) return <EmptyState title="No notes yet" />;
  return (
    <ul className="space-y-3">
      {notes.map((n) => (
        <li key={n.id} className="rounded-lg border border-line bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted">
              {n.author.name} · {formatDateTime(n.createdAt)}
            </p>
            {n.visibility === "PRIVATE" ? <Badge tone="navy">Private</Badge> : <Badge>Shared</Badge>}
          </div>
          <p className="mt-2 whitespace-pre-line text-sm text-navy">{n.body}</p>
          {n.visibility === "SHARED" && (
            <div className="mt-3">
              {n.acknowledgedAt ? (
                <Acknowledged at={n.acknowledgedAt} />
              ) : canAcknowledge ? (
                <AcknowledgeButton kind="note" id={n.id} />
              ) : (
                <span className="text-xs text-muted">Not yet acknowledged</span>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export function RecommendationList({
  items,
  canAcknowledge = false,
}: {
  items: WithMentor<Recommendation>[];
  canAcknowledge?: boolean;
}) {
  if (!items.length) return <EmptyState title="No recommendations yet" />;
  return (
    <ul className="space-y-3">
      {items.map((r) => (
        <li key={r.id} className="rounded-lg border border-line bg-surface p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-semibold text-navy">{r.title}</h3>
            <div className="flex gap-2">
              <Badge>{CATEGORY_LABEL[r.category]}</Badge>
              <Badge tone={priorityTone[r.priority]}>{PRIORITY_LABEL[r.priority]} priority</Badge>
            </div>
          </div>
          <p className="mt-2 whitespace-pre-line text-sm text-navy">{r.description}</p>
          <p className="mt-2 text-xs text-muted">
            From {r.mentor.name} · Due {formatDate(r.dueDate)}
          </p>
          <div className="mt-3">
            {r.acknowledgedAt ? (
              <Acknowledged at={r.acknowledgedAt} />
            ) : canAcknowledge ? (
              <AcknowledgeButton kind="recommendation" id={r.id} />
            ) : (
              <span className="text-xs text-muted">Not yet acknowledged</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function SessionList({ sessions }: { sessions: WithMentor<MentoringSession>[] }) {
  if (!sessions.length) return <EmptyState title="No sessions logged yet" />;
  return (
    <ol className="space-y-3">
      {sessions.map((s) => (
        <li key={s.id} className="rounded-lg border border-line bg-surface p-4">
          <p className="text-sm font-semibold text-navy">
            {formatDate(s.heldOn)} <span className="font-normal text-muted">· {s.mentor.name}</span>
          </p>
          <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs font-semibold uppercase text-muted">Agenda</dt>
              <dd className="whitespace-pre-line text-navy">{s.agenda}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-muted">Outcome</dt>
              <dd className="whitespace-pre-line text-navy">{s.outcome}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-muted">Follow-up</dt>
              <dd className="whitespace-pre-line text-navy">{s.followUp || "—"}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ol>
  );
}
