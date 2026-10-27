import { getCurrentUser } from "@/features/access/session";
import { departmentSummary } from "@/features/hod/queries";
import { summaryToCsv } from "@/features/hod/export";
import { audit } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "HOD") return new Response("Forbidden", { status: 403 });

  const summary = await departmentSummary(user.department);
  await audit({ actorId: user.id, action: "DEPARTMENT_EXPORTED", entity: "Department", entityId: user.department, details: { format: "csv" } });
  return new Response(summaryToCsv(summary), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${user.department}-mentoring-summary.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
