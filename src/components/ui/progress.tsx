export function Progress({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-navy">{label}</span>
        <span className="font-semibold text-navy">{value}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className="h-2.5 w-full overflow-hidden rounded-full bg-navy/10"
      >
        <div className="h-full rounded-full bg-navy" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
