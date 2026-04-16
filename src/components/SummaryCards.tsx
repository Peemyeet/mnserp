import type { SummaryStat } from "../data/dashboard";

const accentStyles: Record<
  SummaryStat["accent"],
  { bg: string; ring: string; dot: string }
> = {
  violet: {
    bg: "from-violet-500 to-indigo-600",
    ring: "ring-violet-500/20",
    dot: "bg-violet-200",
  },
  teal: {
    bg: "from-teal-500 to-emerald-600",
    ring: "ring-teal-500/20",
    dot: "bg-teal-200",
  },
  amber: {
    bg: "from-amber-500 to-orange-600",
    ring: "ring-amber-500/20",
    dot: "bg-amber-200",
  },
  rose: {
    bg: "from-rose-500 to-red-600",
    ring: "ring-rose-500/20",
    dot: "bg-rose-200",
  },
};

function formatNumber(n: number) {
  return new Intl.NumberFormat("th-TH").format(n);
}

export function SummaryCards({ stats }: { stats: SummaryStat[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      {stats.map((s) => {
        const a = accentStyles[s.accent];
        return (
          <article
            key={s.id}
            className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200/60 transition active:bg-slate-50/80 sm:p-5 sm:hover:-translate-y-0.5 sm:hover:shadow-card-hover"
          >
            <div
              className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${a.bg} opacity-[0.12] blur-2xl transition group-hover:opacity-20`}
              aria-hidden
            />
            <div className="relative flex flex-col gap-3">
              <div className="flex justify-end">
                <span
                  className={`h-2 w-2 rounded-full ${a.dot} ring-4 ${a.ring}`}
                  title={s.hint}
                />
              </div>
              <p className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                {formatNumber(s.value)}
              </p>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  {s.label}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {s.hint}
                </p>
              </div>
              <div
                className={`mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100`}
              >
                <div
                  className={`h-full w-full max-w-[100%] rounded-full bg-gradient-to-r ${a.bg} transition-all duration-500`}
                  style={{
                    width:
                      s.id === "total"
                        ? "100%"
                        : `${Math.min(100, (s.value / (stats[0]?.value || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
