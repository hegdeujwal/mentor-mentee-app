import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { Table, td, th } from "@/components/ui/table";
import { requireRole } from "@/features/access/session";
import { listAssignments } from "@/features/admin/queries";
import { AssignForm } from "@/features/admin/components/assign-form";

export const metadata: Metadata = { title: "Assignments" };

export default async function AssignmentsPage() {
  await requireRole("ADMIN");
  const { mentees, mentors } = await listAssignments();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mentor assignments"
        description="Each mentee has at most one mentor from the same department. The number in brackets is the mentor's current load."
      />
      {mentees.length === 0 ? (
        <EmptyState title="No active mentees">Create mentees or import them from CSV first.</EmptyState>
      ) : (
        <Table label="Mentor assignments">
          <thead>
            <tr>
              <th className={th}>Mentee</th>
              <th className={th}>USN</th>
              <th className={th}>Dept</th>
              <th className={th}>Mentor</th>
            </tr>
          </thead>
          <tbody>
            {mentees.map((m) => (
              <tr key={m.id}>
                <td className={td}>{m.name}</td>
                <td className={td}>{m.profile?.usn}</td>
                <td className={td}>{m.department}</td>
                <td className={td}>
                  <AssignForm
                    menteeId={m.id}
                    menteeName={m.name}
                    currentMentorId={m.assignment?.mentorId ?? null}
                    mentors={mentors
                      .filter((mentor) => mentor.department === m.department)
                      .map((mentor) => ({ id: mentor.id, name: mentor.name, load: mentor._count.mentorOf }))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
