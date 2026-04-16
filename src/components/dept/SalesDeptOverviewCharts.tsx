import { useRef } from "react";
import { Menu } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCardShell } from "./ChartCardShell";

export type SalesReportPeriod = "day" | "month" | "quarter" | "year";

function ReportPeriodMenu({
  period,
  year,
  onPeriodChange,
  onYearChange,
}: {
  period: SalesReportPeriod;
  year: number;
  onPeriodChange: (p: SalesReportPeriod) => void;
  onYearChange: (y: number) => void;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const showYear = period !== "day";
  const cy = new Date().getFullYear();
  const yearOptions: number[] = [];
  for (let y = cy + 1; y >= cy - 12; y--) yearOptions.push(y);

  const jumpFullYearThisYear = () => {
    onPeriodChange("month");
    onYearChange(new Date().getFullYear());
    if (detailsRef.current) detailsRef.current.open = false;
  };

  return (
    <details ref={detailsRef} className="group relative">
      <summary className="flex cursor-pointer list-none items-center justify-center rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 [&::-webkit-details-marker]:hidden">
        <Menu className="h-4 w-4" aria-hidden />
        <span className="sr-only">ตัวเลือกช่วงเวลา</span>
      </summary>
      <div
        className="absolute right-0 z-30 mt-1 w-56 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <label className="block text-xs font-medium text-slate-600">ช่วงเวลา</label>
        <select
          value={period}
          onChange={(e) =>
            onPeriodChange(e.target.value as SalesReportPeriod)
          }
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
        >
          <option value="day">รายวัน (60 วันล่าสุด)</option>
          <option value="month">รายเดือน</option>
          <option value="quarter">รายไตรมาส</option>
          <option value="year">รายปี (5 ปีย้อนหลัง)</option>
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
        <button
          type="button"
          onClick={jumpFullYearThisYear}
          className="mt-3 w-full rounded-lg border border-emerald-200 bg-emerald-50/90 px-2 py-2 text-left text-xs font-medium text-emerald-950 hover:bg-emerald-100"
        >
          ดูทั้งปีนี้ (รายเดือน 12 เดือน)
        </button>
      </div>
    </details>
  );
}

function quotationChartTitle(p: SalesReportPeriod): string {
  switch (p) {
    case "day":
      return "ยอดใบเสนอราคารายวัน (บาท) — 60 วันล่าสุด";
    case "quarter":
      return "ยอดใบเสนอราคารายไตรมาส (บาท)";
    case "year":
      return "ยอดใบเสนอราคารายปี (บาท)";
    default:
      return "ยอดใบเสนอราคารายเดือน (บาท)";
  }
}

/** จาก GET /api/reports/sales — แสดงแทนตัวอย่างเมื่อมีข้อมูลจริง */
export type LiveSalesCharts = {
  lineSeries: { m: string; q: number; n: number }[];
  workgroupJobCounts: { name: string; count: number }[];
};

function fmtBaht(n: number) {
  return new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(n);
}

function fmtInt(n: number) {
  return new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(n);
}

/** กราฟภาพรวม — ย้ายมาจากหน้า landing เดิม ใช้ในรีพอร์ตฝ่ายขาย */
export function SalesDeptOverviewCharts({
  liveSales,
  period = "month",
  year,
  onPeriodChange,
  onYearChange,
}: {
  liveSales?: LiveSalesCharts | null;
  period?: SalesReportPeriod;
  year?: number;
  onPeriodChange?: (p: SalesReportPeriod) => void;
  onYearChange?: (y: number) => void;
}) {
  const y = year ?? new Date().getFullYear();
  const p = period;
  const renderPeriodMenu = () =>
    onPeriodChange && onYearChange ? (
      <ReportPeriodMenu
        period={p}
        year={y}
        onPeriodChange={onPeriodChange}
        onYearChange={onYearChange}
      />
    ) : null;

  if (liveSales != null) {
    const wg = liveSales.workgroupJobCounts ?? [];
    const lines = liveSales.lineSeries ?? [];
    return (
      <div className="space-y-6">
        <p className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-2 text-sm text-emerald-900">
          แสดงข้อมูลจากฐานข้อมูล — ใช้เมนูมุมขวาเลือกช่วงเวลา หรือกด «ดูทั้งปีนี้»
          (ผู้ดูแลเลือกชื่อพนักงานได้ที่แถบด้านบน)
        </p>
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-1">
            <ChartCardShell
              title="จำนวนงานตาม workgroup"
              menu={renderPeriodMenu()}
            >
              {wg.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  ไม่มีงานในช่วงที่เลือก
                </p>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height={Math.min(480, 120 + wg.length * 28)}
                >
                  <BarChart
                    layout="vertical"
                    data={wg}
                    margin={{ left: 8, right: 28, top: 4, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip
                      formatter={(v: number) => [fmtInt(v), "งาน"]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar
                      dataKey="count"
                      name="จำนวนงาน"
                      fill="#6366f1"
                      radius={[0, 4, 4, 0]}
                    >
                      <LabelList
                        dataKey="count"
                        position="right"
                        fill="#475569"
                        fontSize={11}
                        formatter={(v: number) => fmtInt(Number(v))}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCardShell>
          </div>
          <div className="lg:col-span-2">
            <ChartCardShell
              title={quotationChartTitle(p)}
              className="h-full min-h-[400px]"
              menu={renderPeriodMenu()}
            >
              {lines.length === 0 ? (
                <p className="py-16 text-center text-sm text-slate-500">
                  ไม่มีใบเสนอราคาในช่วงที่เลือก
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={420}>
                  <LineChart data={lines}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="m" tick={{ fontSize: 11 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      domain={["auto", "auto"]}
                      tickFormatter={(v) => fmtBaht(Number(v))}
                    />
                    <Tooltip
                      formatter={(v: number, name: string) => {
                        if (name === "ยอดรวม (บาท)") return [fmtBaht(v), name];
                        return [fmtInt(v), name];
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="q"
                      name="ยอดรวม (บาท)"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="n"
                      name="จำนวนใบ"
                      stroke="#14b8a6"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCardShell>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-12 text-center text-sm text-slate-600">
      <p className="font-medium text-slate-800">ยังไม่มีกราฟจากฐานข้อมูล</p>
      <p className="mx-auto mt-2 max-w-xl text-xs text-slate-500">
        ตั้งค่า MySQL ใน <code className="rounded bg-white px-1">server/.env</code> (หรือ Railway{" "}
        <code className="rounded bg-white px-1">MYSQL*</code>) แล้ว import ข้อมูล เช่น{" "}
        <code className="rounded bg-white px-1">database/mns_pm_2021.sql</code> หรือ{" "}
        <code className="rounded bg-white px-1">database/db_mns.sql</code> — ดู{" "}
        <code className="rounded bg-white px-1">database/IMPORT.txt</code> แล้วรีเฟรชหน้านี้
      </p>
    </div>
  );
}
