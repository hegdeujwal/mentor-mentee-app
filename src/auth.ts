import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/db";
import { loginLimiter } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { loginSchema } from "@/features/auth/schemas";

class RateLimited extends CredentialsSignin {
  code = "rate_limited";
}

// Used when the email is unknown so the response time does not reveal which emails exist.
const DUMMY_HASH = "$2b$12$BuBlmIIQFrQOzddbqKeKSuy8SdSsHPVqoqhAcgc3dON225YsXYsTW";

function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw, request) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const limitKey = `${email}|${clientIp(request)}`;
        const limit = loginLimiter.hit(limitKey);
        if (!limit.allowed) {
          await audit({ actorId: null, action: "LOGIN_RATE_LIMITED", entity: "User", details: { email } });
          throw new RateLimited();
        }

        const user = await prisma.user.findUnique({ where: { email } });
        const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !valid || !user.isActive) {
          await audit({
            actorId: user?.id ?? null,
            action: "LOGIN_FAILED",
            entity: "User",
            entityId: user?.id,
            details: { email },
          });
          return null;
        }

        loginLimiter.reset(limitKey); // only consecutive failures count towards the limit
        await audit({ actorId: user.id, action: "LOGIN_SUCCESS", entity: "User", entityId: user.id });
        return { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department };
      },
    }),
  ],
});
