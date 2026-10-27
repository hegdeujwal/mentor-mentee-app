import { getCurrentUser } from "@/features/access/session";
import { departmentSummary } from "@/features/hod/queries";
import { summaryToPdf } from "@/features/hod/export";
import { audit } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "HOD") return new Response("Forbidden", { status: 403 });

  const summary = await departmentSummary(user.department);
  const bytes = await summaryToPdf(summary, user.name);
  await audit({ actorId: user.id, action: "DEPARTMENT_EXPORTED", entity: "Department", entityId: user.department, details: { format: "pdf" } });
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${user.department}-mentoring-summary.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
