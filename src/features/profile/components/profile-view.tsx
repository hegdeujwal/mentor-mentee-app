import type { MenteeProfile } from "@prisma/client";
import { Card, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-line text-sm text-navy">{value || "—"}</dd>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardTitle className="text-base">{title}</CardTitle>
      <dl className="mt-3 grid gap-4 sm:grid-cols-2">{children}</dl>
    </Card>
  );
}

/** Read-only profile used by mentors, administrators and the HOD. */
export function ProfileView({ email, profile }: { email: string; profile: MenteeProfile }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Group title="Personal and academic">
        <Item label="USN" value={profile.usn} />
        <Item label="Email" value={email} />
        <Item label="Phone" value={profile.phone} />
        <Item label="Date of birth" value={profile.dateOfBirth ? formatDate(profile.dateOfBirth) : null} />
        <Item label="Department" value={profile.department} />
        <Item label="Semester / section" value={profile.semester ? `${profile.semester} / ${profile.section ?? "—"}` : null} />
        <Item label="Address" value={profile.address} />
      </Group>
      <Group title="Parent / guardian">
        <Item label="Father's name" value={profile.fatherName} />
        <Item label="Mother's name" value={profile.motherName} />
        <Item label="Phone" value={profile.guardianPhone} />
        <Item label="Occupation" value={profile.parentOccupation} />
      </Group>
      <Group title="About">
        <Item label="Hobbies" value={profile.hobbies} />
        <Item label="Interests" value={profile.interests} />
        <Item label="Skills" value={profile.skills} />
        <Item label="Career goals" value={profile.careerGoals} />
        <Item label="Strengths" value={profile.strengths} />
        <Item label="Weaknesses" value={profile.weaknesses} />
      </Group>
      <Group title="Achievements and experience">
        <Item label="Achievements" value={profile.achievements} />
        <Item label="Extracurricular" value={profile.extracurricular} />
        <Item label="Internships" value={profile.internships} />
      </Group>
    </div>
  );
}
