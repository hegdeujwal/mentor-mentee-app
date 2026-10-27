import Link from "next/link";
import type { Role } from "@prisma/client";
import { logoutAction } from "@/features/auth/actions";
import { ROLE_HOME, ROLE_LABEL } from "@/lib/constants";
import { NAV } from "./nav-config";
import { SidebarNav } from "./sidebar-nav";
import { MobileMenu } from "./mobile-menu";

export function AppShell({
  user,
  children,
}: {
  user: { name: string; role: Role; department: string };
  children: React.ReactNode;
}) {
  const items = NAV[user.role];
  const home = ROLE_HOME[user.role];
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <header className="on-navy relative flex items-center justify-between bg-navy px-4 py-3 lg:hidden">
        <Link href={home} className="text-lg font-bold text-chiffon">
          MentorLink
        </Link>
        <MobileMenu>
          <SidebarNav items={items} home={home} />
          <form action={logoutAction} className="mt-4 border-t border-chiffon/20 pt-4">
            <button className="text-sm font-semibold text-chiffon underline">Sign out</button>
          </form>
        </MobileMenu>
      </header>

      <aside className="on-navy hidden bg-navy p-5 lg:flex lg:min-h-dvh lg:flex-col">
        <Link href={home} className="text-xl font-bold text-chiffon">
          MentorLink
        </Link>
        <p className="mt-1 text-xs text-chiffon/90">{ROLE_LABEL[user.role]} · {user.department}</p>
        <nav aria-label="Main" className="mt-8 flex-1">
          <SidebarNav items={items} home={home} />
        </nav>
        <div className="border-t border-chiffon/20 pt-4">
          <p className="truncate text-sm font-semibold text-chiffon">{user.name}</p>
          <form action={logoutAction}>
            <button className="mt-2 text-sm text-chiffon underline hover:text-white">Sign out</button>
          </form>
        </div>
      </aside>

      <main id="main" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
