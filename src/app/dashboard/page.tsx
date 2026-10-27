import { redirect } from "next/navigation";
import { requireRole } from "@/features/access/session";
import { ROLE_HOME } from "@/lib/constants";

/** Sends each user to their role's home page. */
export default async function DashboardRedirect() {
  const user = await requireRole("MENTEE", "MENTOR", "ADMIN", "HOD");
  redirect(ROLE_HOME[user.role]);
}
