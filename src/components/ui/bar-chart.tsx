/**
 * Horizontal bar chart drawn with plain elements. The same numbers are exposed
 * as a table for screen readers, so the chart itself is hidden from them.
 */
export function BarChart({
  title,
  data,
  unit = "",
}: {
  title: string;
  data: { label: string; value: number }[];
  unit?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <figure>
      <figcaption className="mb-3 text-sm font-semibold text-navy">{title}</figcaption>
      <div aria-hidden="true" className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="grid grid-cols-[minmax(0,8rem)_1fr_auto] items-center gap-2 text-sm">
            <span className="truncate text-navy" title={d.label}>
              {d.label}
            </span>
            <div className="h-5 rounded bg-navy/10">
              <div className="h-5 rounded bg-navy" style={{ width: `${(d.value / max) * 100}%` }} />
            </div>
            <span className="w-10 text-right font-semibold tabular-nums text-navy">
              {d.value}
              {unit}
            </span>
          </div>
        ))}
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>
                {d.value}
                {unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
