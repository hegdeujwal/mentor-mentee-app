import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";
import { ROLE_HOME } from "@/lib/constants";

// Route prefix → the only role allowed under it.
const PROTECTED_PREFIXES: [string, Role][] = [
  ["/mentee", "MENTEE"],
  ["/mentor", "MENTOR"],
  ["/admin", "ADMIN"],
  ["/hod", "HOD"],
];

/**
 * Edge-safe part of the Auth.js config (no Prisma, no bcrypt) shared by the
 * proxy and the full server config. The proxy check is only a first gate:
 * pages, server actions and route handlers re-check the role from the database.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const role = auth?.user?.role;

      if (role && (pathname === "/login" || pathname === "/register")) {
        return Response.redirect(new URL(ROLE_HOME[role], request.nextUrl));
      }
      if (pathname === "/dashboard") {
        return role ? Response.redirect(new URL(ROLE_HOME[role], request.nextUrl)) : false;
      }

      const match = PROTECTED_PREFIXES.find(
        ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
      );
      if (!match) return true;
      if (!role) return false; // Auth.js redirects to the sign-in page
      if (match[1] !== role) return Response.redirect(new URL(ROLE_HOME[role], request.nextUrl));
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.department = user.department;
        token.loginAt = Date.now(); // kept across token refreshes, unlike iat
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.department = token.department;
      session.user.loginAt = token.loginAt;
      return session;
    },
  },
} satisfies NextAuthConfig;
