import Link from "next/link";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-6 text-2xl font-bold text-navy">
        MentorLink
      </Link>
      <main id="main" className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-md sm:p-8">
        <h1 className="text-2xl font-bold text-navy">{title}</h1>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
