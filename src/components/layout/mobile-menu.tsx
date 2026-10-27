"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** Collapsible container for the sidebar on small screens. */
export function MobileMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);

  // Close the menu after navigating.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg border border-chiffon/40 px-3 py-1.5 text-sm font-semibold text-chiffon"
      >
        {open ? "Close menu" : "Menu"}
      </button>
      {open && (
        <nav id="mobile-nav" aria-label="Main" className="absolute inset-x-0 top-full z-40 bg-navy p-4 shadow-lg">
          {children}
        </nav>
      )}
    </div>
  );
}
