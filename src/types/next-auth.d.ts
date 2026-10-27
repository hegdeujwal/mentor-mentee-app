import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: Role;
    department: string;
  }
  interface Session {
    user: { id: string; role: Role; department: string; loginAt: number } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    department: string;
    loginAt: number;
  }
}
