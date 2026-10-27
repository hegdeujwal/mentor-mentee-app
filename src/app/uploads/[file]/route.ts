import { prisma } from "@/lib/db";
import { storage, UPLOAD_URL_PREFIX } from "@/lib/storage";
import { getCurrentUser, getMenteeFacts } from "@/features/access/session";
import { canViewMentee } from "@/features/access/policy";

const MIME = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" } as const;

/** Serves a profile photo only to users allowed to see that mentee. */
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { file } = await params;
  const owner = await prisma.menteeProfile.findFirst({
    where: { photoPath: UPLOAD_URL_PREFIX + file },
    select: { userId: true },
  });
  const facts = owner && (await getMenteeFacts(owner.userId));
  if (!facts || !canViewMentee(user, facts)) return new Response("Not found", { status: 404 });

  const bytes = await storage.read(file);
  if (!bytes) return new Response("Not found", { status: 404 });
  const ext = file.split(".").pop() as keyof typeof MIME;
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": MIME[ext],
      "Cache-Control": "private, max-age=300",
      "Content-Disposition": "inline",
    },
  });
}
