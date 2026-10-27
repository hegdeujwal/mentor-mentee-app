import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/features/access/session";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");
  return <AppShell user={user}>{children}</AppShell>;
}
