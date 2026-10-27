import Image from "next/image";

export function Avatar({ name, src, size = 48 }: { name: string; src?: string | null; size?: number }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={`Photo of ${name}`}
        width={size}
        height={size}
        unoptimized // served by an authenticated route, which the image optimiser cannot call
        className="rounded-full border-2 border-gold object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-navy font-semibold text-chiffon"
      style={{ width: size, height: size, fontSize: size / 2.6 }}
    >
      {initials}
    </span>
  );
}
