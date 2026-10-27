import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/auth-card";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <AuthCard title="Create a mentee account" subtitle="Mentor, administrator and HOD accounts are created by the office.">
      <RegisterForm />
    </AuthCard>
  );
}
