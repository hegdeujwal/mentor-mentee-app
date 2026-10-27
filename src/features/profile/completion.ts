type ProfileLike = Record<string, unknown>;

/** Every field that counts towards profile completion, with a readable label. */
export const COMPLETION_FIELDS: { key: string; label: string; requiredForSubmit: boolean }[] = [
  { key: "name", label: "Full name", requiredForSubmit: true },
  { key: "usn", label: "USN", requiredForSubmit: true },
  { key: "email", label: "Email", requiredForSubmit: true },
  { key: "phone", label: "Phone", requiredForSubmit: true },
  { key: "department", label: "Department", requiredForSubmit: true },
  { key: "semester", label: "Semester", requiredForSubmit: true },
  { key: "section", label: "Section", requiredForSubmit: true },
  { key: "dateOfBirth", label: "Date of birth", requiredForSubmit: true },
  { key: "address", label: "Address", requiredForSubmit: true },
  { key: "hobbies", label: "Hobbies", requiredForSubmit: false },
  { key: "interests", label: "Interests", requiredForSubmit: false },
  { key: "skills", label: "Skills", requiredForSubmit: true },
  { key: "strengths", label: "Strengths", requiredForSubmit: false },
  { key: "weaknesses", label: "Weaknesses", requiredForSubmit: false },
  { key: "careerGoals", label: "Career goals", requiredForSubmit: true },
  { key: "achievements", label: "Achievements", requiredForSubmit: false },
  { key: "extracurricular", label: "Extracurricular activities", requiredForSubmit: false },
  { key: "internships", label: "Internships", requiredForSubmit: false },
  { key: "fatherName", label: "Father's name", requiredForSubmit: false },
  { key: "motherName", label: "Mother's name", requiredForSubmit: false },
  { key: "guardianPhone", label: "Parent/guardian phone", requiredForSubmit: true },
  { key: "parentOccupation", label: "Parent occupation", requiredForSubmit: false },
  { key: "photoPath", label: "Profile photo", requiredForSubmit: false },
];

const isFilled = (value: unknown) =>
  value !== null && value !== undefined && !(typeof value === "string" && value.trim() === "");

/** Percentage (0–100, whole number) of completion fields that are filled. */
export function profileCompletion(profile: ProfileLike) {
  const filled = COMPLETION_FIELDS.filter((f) => isFilled(profile[f.key])).length;
  return Math.round((filled / COMPLETION_FIELDS.length) * 100);
}

/** Labels of fields that must be filled before the profile can be submitted. */
export function missingForSubmission(profile: ProfileLike) {
  const missing = COMPLETION_FIELDS.filter((f) => f.requiredForSubmit && !isFilled(profile[f.key])).map(
    (f) => f.label,
  );
  if (!isFilled(profile.fatherName) && !isFilled(profile.motherName)) missing.push("A parent's name");
  return missing;
}
