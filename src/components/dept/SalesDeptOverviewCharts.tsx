import { useRef, useState } from "react";
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

const barSale = [{ name: "ข้อมูล", notReady: 0.6, ready: 1.1 }];
const barRepair = [{ name: "ข้อมูล", notReady: 2, ready: 3 }];

const overview = [
  { m: "Jan", target: 1.1, due: 0.9, sales: 1.0, invoice: 0.85, po: 0.7, q: 0.95 },
  { m: "Feb", target: 1.15, due: 0.95, sales: 1.05, invoice: 0.9, po: 0.75, q: 1.0 },
  { m: "Mar", target: 1.2, due: 1.0, sales: 1.1, invoice: 0.95, po: 0.8, q: 1.05 },
  { m: "Apr", target: 1.2, due: 1.0, sales: 1.08, invoice: 0.92, po: 0.82, q: 1.0 },
  { m: "May", target: 1.25, due: 1.05, sales: 1.12, invoice: 0.98, po: 0.85, q: 1.08 },
  { m: "Jun", target: 1.25, due: 1.08, sales: 1.15, invoice: 1.0, po: 0.88, q: 1.1 },
  { m: "Jul", target: 1.3, due: 1.1, sales: 1.18, invoice: 1.02, po: 0.9, q: 1.12 },
  { m: "Aug", target: 1.3, due: 1.12, sales: 1.2, invoice: 1.05, po: 0.92, q: 1.15 },
  { m: "Sep", target: 1.35, due: 1.15, sales: 1.22, invoice: 1.08, po: 0.95, q: 1.18 },
  { m: "Oct", target: 1.35, due: 1.18, sales: 1.25, invoice: 1.1, po: 0.98, q: 1.2 },
  { m: "Nov", target: 1.4, due: 1.2, sales: 1.28, invoice: 1.12, po: 1.0, q: 1.22 },
  { m: "Dec", target: 1.45, due: 1.25, sales: 1.32, invoice: 1.15, po: 1.05, q: 1.25 },
];

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
  const [demoYear, setDemoYear] = useState("2022");
  const [salesTeam, setSalesTeam] = useState("");
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80 sm:p-5">
        <label className="text-sm text-slate-600">
          <span className="mb-1 block font-medium">ปี :</span>
          <select
            value={demoYear}
            onChange={(e) => setDemoYear(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            {["2022", "2023", "2024", "2025", "2026"].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-[200px] text-sm text-slate-600">
          <span className="mb-1 block font-medium">ฝ่ายขาย :</span>
          <select
            value={salesTeam}
            onChange={(e) => setSalesTeam(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">เลือกฝ่ายขาย</option>
            <option value="1">ทีมกรุงเทพ</option>
            <option value="2">ทีมภูมิภาค</option>
            <option value="3">ทีมโครงการ</option>
          </select>
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="flex flex-col gap-4 lg:col-span-1">
          <ChartCardShell title="ขาย">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barSale}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={[0, 2]}
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "ชิ้น",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 11 },
                  }}
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="notReady"
                  name="ของยังไม่พร้อมส่ง"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="ready"
                  name="ของพร้อมส่ง"
                  fill="#14b8a6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCardShell>
          <ChartCardShell title="ซ่อม">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barRepair}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={[0, 5]}
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "ชิ้น",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 11 },
                  }}
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="notReady"
                  name="ของยังไม่พร้อมส่ง"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="ready"
                  name="ของพร้อมส่ง"
                  fill="#14b8a6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCardShell>
        </div>
        <div className="lg:col-span-2">
          <ChartCardShell title="ภาพรวม" className="h-full min-h-[480px]">
            <ResponsiveContainer width="100%" height={420}>
              <LineChart data={overview}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="m" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={[0.4, 2]}
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "$ (thousands)",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 11 },
                  }}
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="target"
                  name="เป้าหมาย"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="due"
                  name="ที่ครบกำหนดรับเงิน"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  name="ยอดขาย"
                  stroke="#eab308"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="invoice"
                  name="ใบวางบิล"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="po"
                  name="PO ใบสั่งซื้อ"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="q"
                  name="ใบเสนอราคา"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCardShell>
        </div>
      </div>
    </div>
  );
}
