import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import type { WorkflowStage } from "../data/dashboard";

function formatNumber(n: number) {
  return new Intl.NumberFormat("th-TH").format(n);
}

function percentOfTotal(count: number, totalInSystem: number) {
  if (totalInSystem <= 0) return 0;
  return Math.round((count / totalInSystem) * 100);
}

export function WorkflowList({
  stages,
  totalInSystem,
  stageLinksEnabled = true,
}: {
  stages: WorkflowStage[];
  totalInSystem: number;
  /** false = ไม่ลิงก์ไป /stage (เช่น ผู้ใช้นอกแผนกขาย) */
  stageLinksEnabled?: boolean;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stages;
    return stages.filter(
      (s) =>
        s.code.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [stages, query]);

  const pipelineTotal = useMemo(
    () => stages.reduce((acc, s) => acc + s.count, 0),
    [stages]
  );

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-card">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            สถานะงานตามขั้นตอน
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            งานทั้งหมดในระบบ{" "}
            <span className="font-medium text-slate-700">
              {formatNumber(totalInSystem)}
            </span>{" "}
            งาน · รวมที่แสดงในขั้นตอน{" "}
            <span className="font-medium text-slate-700">
              {formatNumber(pipelineTotal)}
            </span>{" "}
            งาน · กดแถวเพื่อเปิดรายการในขั้นนั้น
          </p>
        </div>
        <label className="relative block sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="ค้นหาขั้นตอน..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-500/15"
          />
        </label>
      </div>

      <ul className="divide-y divide-slate-100">
        {filtered.map((stage) => {
          const pct = percentOfTotal(stage.count, totalInSystem);

          const inner = (
            <>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-semibold leading-snug text-slate-900">
                  {stage.code}. {stage.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {stage.description}
                </p>
              </div>

              <div className="flex w-full shrink-0 flex-col items-stretch sm:w-[min(100%,14rem)] sm:items-end">
                <div className="flex items-baseline justify-end gap-4">
                  <span
                    className="text-sm tabular-nums text-slate-400"
                    title="เปอร์เซ็นต์ต่องานทั้งหมดในระบบ"
                  >
                    {pct}%
                  </span>
                  <span className="text-lg font-semibold tabular-nums text-slate-900">
                    {formatNumber(stage.count)}
                  </span>
                </div>
                <div
                  className="mt-3 h-2 w-full max-w-[14rem] overflow-hidden rounded-full bg-slate-100 sm:ml-auto"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${stage.code} ${pct}%`}
                >
                  <div
                    className="h-full rounded-full bg-[#26C6DA] transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </>
          );

          return (
            <li key={stage.code}>
              {stageLinksEnabled ? (
                <Link
                  to={`/stage/${encodeURIComponent(stage.code)}`}
                  className="flex flex-col gap-3 p-4 no-underline transition hover:bg-slate-50/90 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:p-5"
                >
                  {inner}
                </Link>
              ) : (
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:p-5">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <p className="p-8 text-center text-sm text-slate-500">
          ไม่พบขั้นตอนที่ตรงกับคำค้น
        </p>
      )}
    </section>
  );
}
