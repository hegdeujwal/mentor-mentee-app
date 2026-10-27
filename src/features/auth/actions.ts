"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { ROLE_HOME } from "@/lib/constants";
import { formValues, zodErrors, type ActionState } from "@/lib/action-state";
import { loginSchema, registerSchema } from "./schemas";

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formValues(formData, ["email", "password"]);
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return { ...zodErrors(parsed.error), values: { email: raw.email ?? "" } };

  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      const limited = "code" in error && error.code === "rate_limited";
      return {
        ok: false,
        values: { email: parsed.data.email },
        message: limited
          ? "Too many sign-in attempts. Please wait 15 minutes and try again."
          : "Email or password is incorrect.",
      };
    }
    throw error;
  }
  const user = await prisma.user.findUniqueOrThrow({ where: { email: parsed.data.email }, select: { role: true } });
  redirect(ROLE_HOME[user.role]);
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse(
    formValues(formData, ["name", "email", "usn", "department", "password", "confirmPassword"]),
  );
  if (!parsed.success) return zodErrors(parsed.error);
  const { name, email, usn, department, password } = parsed.data;

  const [emailTaken, usnTaken] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.menteeProfile.findUnique({ where: { usn }, select: { id: true } }),
  ]);
  if (emailTaken || usnTaken) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      errors: {
        email: emailTaken ? ["An account with this email already exists."] : undefined,
        usn: usnTaken ? ["This USN is already registered."] : undefined,
      },
    };
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role: "MENTEE",
      department,
      passwordHash: await bcrypt.hash(password, 12),
      profile: { create: { usn, department } },
    },
  });
  await audit({ actorId: user.id, action: "MENTEE_REGISTERED", entity: "User", entityId: user.id });

  await signIn("credentials", { email, password, redirectTo: ROLE_HOME.MENTEE });
  return {};
}

export async function logoutAction() {
  // Revoke server-side as well: a request already in flight can re-send a refreshed cookie.
  const session = await auth();
  if (session?.user?.id) {
    await prisma.user.update({ where: { id: session.user.id }, data: { sessionsRevokedAt: new Date() } });
  }
  await signOut({ redirect: false });
  redirect("/login");
}
