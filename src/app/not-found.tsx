import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-extrabold text-navy">404</p>
      <h1 className="text-2xl font-bold text-navy">Page not found</h1>
      <p className="max-w-md text-muted">The page does not exist, or you do not have access to it.</p>
      <ButtonLink href="/dashboard">Go to my dashboard</ButtonLink>
    </main>
  );
}
