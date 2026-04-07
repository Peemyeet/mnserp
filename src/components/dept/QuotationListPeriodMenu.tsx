import { useRef } from "react";
import { Menu } from "lucide-react";

export type QuotationListPeriod = "day" | "month" | "quarter" | "year";

type Props = {
  period: QuotationListPeriod;
  year: number;
  month: number;
  quarter: number;
  onPeriodChange: (p: QuotationListPeriod) => void;
  onYearChange: (y: number) => void;
  onMonthChange: (m: number) => void;
  onQuarterChange: (q: number) => void;
};

export function QuotationListPeriodMenu({
  period,
  year,
  month,
  quarter,
  onPeriodChange,
  onYearChange,
  onMonthChange,
  onQuarterChange,
}: Props) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const showYear = period !== "day";
  const showMonth = period === "month";
  const showQuarter = period === "quarter";
  const cy = new Date().getFullYear();
  const yearOptions: number[] = [];
  for (let y = cy + 1; y >= cy - 12; y--) yearOptions.push(y);

  const jumpFullYearThisYear = () => {
    onPeriodChange("year");
    onYearChange(new Date().getFullYear());
    if (detailsRef.current) detailsRef.current.open = false;
  };

  return (
    <details ref={detailsRef} className="group relative">
      <summary className="flex cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
        <Menu className="h-4 w-4" aria-hidden />
        <span className="sr-only">ช่วงเวลา</span>
      </summary>
      <div
        className="absolute right-0 z-30 mt-1 w-60 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <label className="block text-xs font-medium text-slate-600">ช่วงเวลา</label>
        <select
          value={period}
          onChange={(e) =>
            onPeriodChange(e.target.value as QuotationListPeriod)
          }
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
        >
          <option value="day">รายวัน (วันนี้)</option>
          <option value="month">รายเดือน</option>
          <option value="quarter">รายไตรมาส</option>
          <option value="year">รายปี</option>
        </select>
        {showYear ? (
          <>
            <label className="mt-2 block text-xs font-medium text-slate-600">
              ปี (ค.ศ.)
            </label>
            <select
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </>
        ) : null}
        {showMonth ? (
          <>
            <label className="mt-2 block text-xs font-medium text-slate-600">
              เดือน
            </label>
            <select
              value={month}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </>
        ) : null}
        {showQuarter ? (
          <>
            <label className="mt-2 block text-xs font-medium text-slate-600">
              ไตรมาส
            </label>
            <select
              value={quarter}
              onChange={(e) => onQuarterChange(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
            >
              {[1, 2, 3, 4].map((q) => (
                <option key={q} value={q}>
                  Q{q}
                </option>
              ))}
            </select>
          </>
        ) : null}
        <button
          type="button"
          onClick={jumpFullYearThisYear}
          className="mt-3 w-full rounded-lg border border-violet-200 bg-violet-50/90 px-2 py-2 text-left text-xs font-medium text-violet-950 hover:bg-violet-100"
        >
          ดูทั้งปีนี้ (รายปี)
        </button>
      </div>
    </details>
  );
}

function parseModified(raw: string): Date | null {
  if (!raw?.trim()) return null;
  const d = new Date(raw.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function quotationRowInPeriod(
  modifiedRaw: string,
  period: QuotationListPeriod,
  year: number,
  month: number,
  quarter: number
): boolean {
  const d = parseModified(modifiedRaw);
  if (!d) return true;
  const now = new Date();
  switch (period) {
    case "day": {
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    }
    case "month":
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    case "quarter": {
      const q = Math.min(4, Math.max(1, quarter));
      const startM = (q - 1) * 3;
      return (
        d.getFullYear() === year &&
        d.getMonth() >= startM &&
        d.getMonth() <= startM + 2
      );
    }
    case "year":
      return d.getFullYear() === year;
    default:
      return true;
  }
}
