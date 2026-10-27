import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Optimistic, cookie-only role gate. Authoritative checks live in the data access layer.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/dashboard", "/login", "/register", "/mentee/:path*", "/mentor/:path*", "/admin/:path*", "/hod/:path*"],
};
