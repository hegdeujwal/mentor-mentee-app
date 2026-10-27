"use client";

import { SelectField, TextArea, TextField } from "@/components/ui/form";
import { FormMessage } from "@/components/ui/feedback";
import { SubmitButton } from "@/components/ui/submit-button";
import { Avatar } from "@/components/ui/avatar";
import { DEPARTMENTS } from "@/lib/constants";
import { useValidatedAction } from "@/lib/use-validated-action";
import { MAX_PHOTO_BYTES, PHOTO_TYPES } from "@/lib/photo";
import { toDateInput } from "@/lib/utils";
import { saveProfileAction } from "../actions";
import { profileSchema } from "../schemas";

export type ProfileFormValues = {
  name: string;
  email: string;
  usn: string;
  department: string;
  phone: string | null;
  semester: number | null;
  section: string | null;
  dateOfBirth: Date | null;
  address: string | null;
  hobbies: string | null;
  interests: string | null;
  skills: string | null;
  strengths: string | null;
  weaknesses: string | null;
  careerGoals: string | null;
  achievements: string | null;
  extracurricular: string | null;
  internships: string | null;
  fatherName: string | null;
  motherName: string | null;
  guardianPhone: string | null;
  parentOccupation: string | null;
  photoPath: string | null;
};

function checkPhoto(data: FormData) {
  const photo = data.get("photo");
  if (!(photo instanceof File) || photo.size === 0) return {};
  if (!(photo.type in PHOTO_TYPES)) return { photo: ["Only JPG, PNG or WEBP images are allowed."] };
  if (photo.size > MAX_PHOTO_BYTES) return { photo: ["Photo must be 2 MB or smaller."] };
  return {};
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-line bg-surface p-5">
      <legend className="px-1 text-lg font-semibold text-navy">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function ProfileForm({ values, locked }: { values: ProfileFormValues; locked: boolean }) {
  const { formAction, onSubmit, errors, message } = useValidatedAction(saveProfileAction, profileSchema, checkPhoto);
  const v = (key: keyof ProfileFormValues) => (values[key] ?? "") as string;

  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-6" noValidate>
      <fieldset disabled={locked} className="space-y-6 disabled:opacity-80">
        <Section title="Personal details">
          <TextField label="Full name" name="name" defaultValue={values.name} required errors={errors?.name} />
          <TextField label="Email" name="email" type="email" defaultValue={values.email} required errors={errors?.email} />
          <TextField label="Phone" name="phone" type="tel" defaultValue={v("phone")} errors={errors?.phone} />
          <TextField
            label="Date of birth"
            name="dateOfBirth"
            type="date"
            defaultValue={toDateInput(values.dateOfBirth)}
            errors={errors?.dateOfBirth}
          />
          <TextArea label="Address" name="address" defaultValue={v("address")} className="sm:col-span-2" errors={errors?.address} />
        </Section>

        <Section title="Academic details">
          <TextField label="USN" name="usn" defaultValue={values.usn} required errors={errors?.usn} />
          <SelectField
            label="Department"
            name="department"
            defaultValue={values.department}
            required
            options={DEPARTMENTS.map((d) => ({ value: d.code, label: `${d.code} – ${d.name}` }))}
            errors={errors?.department}
          />
          <SelectField
            label="Semester"
            name="semester"
            defaultValue={values.semester?.toString() ?? ""}
            placeholder="Select…"
            options={Array.from({ length: 8 }, (_, i) => ({ value: String(i + 1), label: `Semester ${i + 1}` }))}
            errors={errors?.semester}
          />
          <TextField label="Section" name="section" defaultValue={v("section")} maxLength={2} errors={errors?.section} />
        </Section>

        <Section title="About me">
          <TextArea label="Hobbies" name="hobbies" defaultValue={v("hobbies")} errors={errors?.hobbies} />
          <TextArea label="Interests" name="interests" defaultValue={v("interests")} errors={errors?.interests} />
          <TextArea label="Skills" name="skills" defaultValue={v("skills")} errors={errors?.skills} />
          <TextArea label="Career goals" name="careerGoals" defaultValue={v("careerGoals")} errors={errors?.careerGoals} />
          <TextArea label="Strengths" name="strengths" defaultValue={v("strengths")} errors={errors?.strengths} />
          <TextArea label="Weaknesses" name="weaknesses" defaultValue={v("weaknesses")} errors={errors?.weaknesses} />
        </Section>

        <Section title="Achievements and experience">
          <TextArea label="Achievements" name="achievements" defaultValue={v("achievements")} errors={errors?.achievements} />
          <TextArea
            label="Extracurricular activities"
            name="extracurricular"
            defaultValue={v("extracurricular")}
            errors={errors?.extracurricular}
          />
          <TextArea
            label="Internships"
            name="internships"
            defaultValue={v("internships")}
            className="sm:col-span-2"
            errors={errors?.internships}
          />
        </Section>

        <Section title="Parent / guardian details">
          <TextField label="Father's name" name="fatherName" defaultValue={v("fatherName")} errors={errors?.fatherName} />
          <TextField label="Mother's name" name="motherName" defaultValue={v("motherName")} errors={errors?.motherName} />
          <TextField
            label="Parent/guardian phone"
            name="guardianPhone"
            type="tel"
            defaultValue={v("guardianPhone")}
            errors={errors?.guardianPhone}
          />
          <TextField
            label="Parent occupation"
            name="parentOccupation"
            defaultValue={v("parentOccupation")}
            errors={errors?.parentOccupation}
          />
        </Section>

        <fieldset className="rounded-xl border border-line bg-surface p-5">
          <legend className="px-1 text-lg font-semibold text-navy">Profile photo</legend>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar name={values.name} src={values.photoPath} size={72} />
            <TextField
              label="Upload a new photo"
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hint="JPG, PNG or WEBP, up to 2 MB."
              errors={errors?.photo}
              className="flex-1"
            />
          </div>
        </fieldset>
      </fieldset>

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-3 border-t border-line bg-surface px-4 py-3 shadow-[0_-4px_12px_rgba(13,59,102,0.08)] sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:rounded-xl sm:border">
        <div className="flex-1">
          <FormMessage {...message} />
        </div>
        {!locked && <SubmitButton>Save profile</SubmitButton>}
      </div>
    </form>
  );
}
