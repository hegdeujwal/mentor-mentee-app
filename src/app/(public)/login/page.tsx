import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ ended?: string }> }) {
  const { ended } = await searchParams;
  return (
    <AuthCard title="Sign in" subtitle="Use the email and password issued by your department.">
      <LoginForm sessionEnded={ended === "1"} />
    </AuthCard>
  );
}
