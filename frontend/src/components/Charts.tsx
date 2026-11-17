import type { ReactNode } from "react";

export function ChartCard({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[340px] flex-col rounded-lg border border-neutral-100 dark:border-neutral-800">
      <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
        <h2 className="text-[15px] font-bold">{title}</h2>
        {hint && <p className="text-[12px] text-neutral-500">{hint}</p>}
      </div>
      <div className="flex flex-1 flex-col p-4">{children}</div>
    </div>
  );
}

export interface Datum { label: string; value: number; color?: string }

/** Gráfico de barras com linhas de grade tracejadas. */
export function BarChart({ data, unit = "Quantidade", empty = "Sem dados ainda." }: { data: Datum[]; unit?: string; empty?: string }) {
  const max = Math.max(4, ...data.map((d) => d.value));
  const ticks = Array.from({ length: max + 1 }, (_, i) => i).filter((t) => max <= 6 || t % Math.ceil(max / 5) === 0);
  const total = data.reduce((a, d) => a + d.value, 0);
  const summary = data.map((d) => `${d.label}: ${d.value}`).join("; ");

  return (
    <div className="flex flex-1 flex-col" role="img" aria-label={`Gráfico de barras. ${summary}`}>
      <span className="text-[11px] text-neutral-500">{unit}</span>
      <div className="relative mt-1 flex flex-1 gap-2">
        <div className="relative w-5 shrink-0">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 translate-y-1/2 text-[11px] tabular-nums text-neutral-500" style={{ bottom: `${(t / max) * 100}%` }}>{t}</span>
          ))}
        </div>
        <div className="relative flex-1 border-b border-neutral-300 dark:border-neutral-600">
          {ticks.map((t) => (
            <div key={t} className="absolute inset-x-0 border-t border-dashed border-neutral-200 dark:border-neutral-700" style={{ bottom: `${(t / max) * 100}%` }} />
          ))}
          <div className="absolute inset-0 grid gap-4 px-4" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
            {data.map((d) => (
              <div key={d.label} className="mx-auto flex h-full w-full max-w-[140px] flex-col justify-end">
                <div className="relative w-full rounded-t-sm transition-[height]" style={{ height: `${(d.value / max) * 100}%`, background: d.color ?? "#0873d6" }}>
                  <span className="absolute -top-5 w-full text-center text-[12px] font-bold tabular-nums">{d.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-2 grid gap-4 pl-7 pr-4 text-center text-[12px] text-neutral-600 dark:text-neutral-300" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`, paddingLeft: "calc(1.75rem + 1rem)" }}>
        {data.map((d) => <span key={d.label}>{d.label}</span>)}
      </div>
      {total === 0 && <p className="mt-2 text-center text-[12px] text-neutral-500">{empty}</p>}
    </div>
  );
}

/** Gráfico de rosca com percentuais e legenda. */
export function DonutChart({ data, centerLabel }: { data: Datum[]; centerLabel: string }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const r = 38, circ = 2 * Math.PI * r;
  let acc = 0;
  const segs = data.filter((d) => d.value > 0).map((d) => {
    const frac = d.value / total, start = acc;
    acc += frac;
    const mid = (start + frac / 2) * 2 * Math.PI - Math.PI / 2;
    return { ...d, frac, start, lx: 50 + r * Math.cos(mid), ly: 50 + r * Math.sin(mid) };
  });
  const summary = data.map((d) => `${d.label}: ${d.value}`).join("; ");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 sm:flex-row">
      <svg viewBox="0 0 100 100" className="size-52 shrink-0" role="img" aria-label={`Gráfico de rosca. ${summary}`}>
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="18" className="stroke-neutral-100 dark:stroke-neutral-800" />
        {segs.map((s) => (
          <circle key={s.label} cx="50" cy="50" r={r} fill="none" stroke={s.color} strokeWidth="18"
            strokeDasharray={`${s.frac * circ} ${circ}`} strokeDashoffset={-s.start * circ} transform="rotate(-90 50 50)" />
        ))}
        {segs.filter((s) => s.frac >= 0.06).map((s) => (
          <text key={s.label} x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle" fontSize="5" fontWeight="700" fill="#fff">
            {Math.round(s.frac * 100)}%
          </text>
        ))}
        <text x="50" y="48" textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor">{total}</text>
        <text x="50" y="58" textAnchor="middle" fontSize="4.5" className="fill-neutral-500">{centerLabel}</text>
      </svg>
      <ul className="flex flex-col gap-1.5 text-[12px]">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="size-3 shrink-0 rounded-sm" style={{ background: d.color }} />
            <span>{d.label}</span>
            <strong className="ml-auto pl-3 tabular-nums">{d.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface HItem { label: string; pct: number; color: string; detail: string }

/** Lista de barras horizontais (progresso), ideal para rankings e consumo. */
export function HBarList({ items, empty }: { items: HItem[]; empty: string }) {
  if (items.length === 0) return <p className="m-auto text-[13px] text-neutral-500">{empty}</p>;
  return (
    <ul className="flex flex-1 flex-col justify-center gap-3.5">
      {items.map((i) => (
        <li key={i.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-[12px]">
            <span className="truncate font-semibold">{i.label}</span>
            <span className="shrink-0 tabular-nums text-neutral-500">{i.detail}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800" role="progressbar"
            aria-label={i.label} aria-valuenow={Math.round(i.pct)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full transition-[width]" style={{ width: `${Math.min(100, i.pct)}%`, background: i.color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
