import { auth, signOut } from "@/auth";
import { getCurrentUser } from "@/features/access/session";

/**
 * Clears a session the server no longer accepts (user deactivated, or signed out while
 * another request refreshed the cookie). Without this, the proxy, which only sees the
 * still-valid cookie, and the pages would redirect to each other.
 */
export async function GET(request: Request) {
  const session = await auth();
  const user = await getCurrentUser();
  if (session && !user) await signOut({ redirect: false });
  return Response.redirect(new URL(user ? "/dashboard" : "/login?ended=1", request.url));
}
