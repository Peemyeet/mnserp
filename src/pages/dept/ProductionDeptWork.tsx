import { Factory, LayoutGrid, Wrench } from "lucide-react";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptPageHeader } from "../../components/dept/DeptPageHeader";
import { ProductionDeptHeaderActions } from "../../components/dept/ProductionDeptHeaderActions";

type CardTheme = "violet" | "amber" | "sky";

const CARD_THEME: Record<
  CardTheme,
  { shell: string; blur: string; total: string; iconBg: string }
> = {
  violet: {
    shell:
      "border-violet-200/80 bg-gradient-to-br from-violet-100/90 via-violet-50 to-white ring-violet-100/60",
    blur: "-right-8 -top-12 h-40 w-40 bg-violet-200/40",
    total: "bg-violet-600",
    iconBg: "bg-violet-500",
  },
  amber: {
    shell:
      "border-amber-200/80 bg-gradient-to-br from-amber-100/90 via-yellow-50 to-white ring-amber-100/60",
    blur: "-right-6 -bottom-8 h-36 w-36 bg-amber-200/35",
    total: "bg-amber-500",
    iconBg: "bg-amber-500",
  },
  sky: {
    shell:
      "border-sky-200/80 bg-gradient-to-br from-sky-100/90 via-cyan-50/70 to-white ring-sky-100/60",
    blur: "-left-6 -top-8 h-32 w-32 bg-sky-200/40",
    total: "bg-sky-600",
    iconBg: "bg-sky-500",
  },
};

function CornerTotal({ n, className }: { n: number; className: string }) {
  return (
    <span
      className={`absolute right-3 top-3 flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-bold text-white shadow ${className}`}
    >
      {n}
    </span>
  );
}

function MiniStat({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <div className="rounded-xl border border-white/60 bg-white/80 px-3 py-3 text-center shadow-sm ring-1 ring-slate-200/50">
      <div className="text-xs font-semibold text-slate-600">{title}</div>
      <div className="mt-1 text-lg font-bold tabular-nums text-slate-900">
        {count}
      </div>
    </div>
  );
}

function DayBandRow({
  label,
  tone,
  count,
}: {
  label: string;
  tone: "red" | "orange" | "violet" | "teal";
  count: number;
}) {
  const bg = {
    red: "bg-red-500 hover:bg-red-600",
    orange: "bg-orange-500 hover:bg-orange-600",
    violet: "bg-violet-600 hover:bg-violet-700",
    teal: "bg-teal-500 hover:bg-teal-600",
  }[tone];
  return (
    <button
      type="button"
      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-white shadow-md transition ${bg}`}
    >
      <span>{label}</span>
      <span className="tabular-nums rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-bold">
        {count}
      </span>
    </button>
  );
}

export function ProductionDeptWork() {
  const bands = [
    { label: "61 วัน", tone: "red" as const, count: 0 },
    { label: "41-60 วัน", tone: "orange" as const, count: 0 },
    { label: "21-40 วัน", tone: "violet" as const, count: 0 },
    { label: "1-20 วัน", tone: "teal" as const, count: 0 },
  ];

  const card1Total = 0;
  const card2Total = 5;
  const card3Total = 0;

  return (
    <DeptPageFrame>
      <DeptPageHeader
        deptId="production"
        titleTh="ฝ่ายผลิต"
        titleEn="Production Department"
        workPath="/dept/production/work"
        reportPath="/dept/production/report"
        extraAction={<ProductionDeptHeaderActions />}
      />

      <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
        <section
          className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm ring-1 ${CARD_THEME.violet.shell}`}
        >
          <div
            className={`pointer-events-none absolute rounded-full blur-2xl ${CARD_THEME.violet.blur}`}
            aria-hidden
          />
          <CornerTotal n={card1Total} className={CARD_THEME.violet.total} />
          <div className="mb-4 flex items-start gap-3 pr-14">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${CARD_THEME.violet.iconBg}`}
            >
              <Factory className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0 pt-0.5">
              <h2 className="text-lg font-bold text-slate-900">งานผลิต</h2>
              <p className="text-xs font-medium text-slate-500">
                Production & plan
              </p>
            </div>
          </div>
          <div className="mb-3 grid grid-cols-2 gap-2.5">
            <MiniStat title="Production" count={0} />
            <MiniStat title="Plan" count={0} />
          </div>
          <div className="flex flex-col gap-2">
            {bands.map((b) => (
              <DayBandRow key={b.label} {...b} />
            ))}
          </div>
        </section>

        <section
          className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm ring-1 ${CARD_THEME.amber.shell}`}
        >
          <div
            className={`pointer-events-none absolute rounded-full blur-2xl ${CARD_THEME.amber.blur}`}
            aria-hidden
          />
          <CornerTotal n={card2Total} className={CARD_THEME.amber.total} />
          <div className="mb-4 flex items-start gap-3 pr-14">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${CARD_THEME.amber.iconBg}`}
            >
              <Wrench className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0 pt-0.5">
              <h2 className="text-lg font-bold text-slate-900">งานซ่อม</h2>
              <p className="text-xs font-medium text-slate-500">
                Internal & production repair
              </p>
            </div>
          </div>
          <div className="mb-3 grid grid-cols-2 gap-2.5">
            <MiniStat title="ซ่อมภายใน" count={0} />
            <MiniStat title="ซ่อมผลิต" count={5} />
          </div>
          <div className="mb-3 flex flex-col gap-2">
            {bands.map((b) => (
              <DayBandRow key={`r-${b.label}`} {...b} />
            ))}
          </div>
          <button
            type="button"
            className="w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-red-700"
          >
            <span className="inline-flex w-full items-center justify-between px-1">
              <span>ทดสอบไม่ผ่าน</span>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 tabular-nums">
                0
              </span>
            </span>
          </button>
        </section>

        <section
          className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm ring-1 sm:col-span-2 ${CARD_THEME.sky.shell}`}
        >
          <div
            className={`pointer-events-none absolute rounded-full blur-2xl ${CARD_THEME.sky.blur}`}
            aria-hidden
          />
          <CornerTotal n={card3Total} className={CARD_THEME.sky.total} />
          <div className="mb-4 flex items-start gap-3 pr-14">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${CARD_THEME.sky.iconBg}`}
            >
              <LayoutGrid className="h-6 w-6" aria-hidden />
            </span>
            <div className="min-w-0 pt-0.5">
              <h2 className="text-lg font-bold text-slate-900">โปรเจ็ค</h2>
              <p className="text-xs font-medium text-slate-500">Project pipeline</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:max-w-3xl">
            {bands.map((b) => (
              <DayBandRow key={`p-${b.label}`} {...b} />
            ))}
          </div>
        </section>
      </div>

      <p className="pb-1 pt-2 text-center text-sm font-medium text-slate-500">
        Time line
      </p>
    </DeptPageFrame>
  );
}
