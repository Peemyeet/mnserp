import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Menu, MessageCircle } from "lucide-react";

const fmtBaht = (n: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(n);

const fmtAxis = (n: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(n);

export type IncomeExpenseSubView = "real" | "plan" | "result";

const MONTHS_ORDER = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function patchRealData(): { month: string; รายรับ: number; รายจ่าย: number }[] {
  return [];
}

type ReportTab = "summary" | "monthly" | "outcome";

function RealIncomeExpensePanel() {
  const [year, setYear] = useState(2026);
  const [tab, setTab] = useState<ReportTab>("summary");
  const data = useMemo(() => patchRealData(), []);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">กราฟยืนยันการรับเงิน</h2>
          <p className="text-sm text-slate-500">Report Confirm</p>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-wrap justify-center gap-2">
            {(
              [
                ["summary", "Report รับ - จ่าย"],
                ["monthly", "Report รับ - จ่าย รายเดือน"],
                ["outcome", "Report ผลลัพธ์"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  tab === id
                    ? "bg-violet-600 text-white shadow-md"
                    : "bg-violet-100 text-violet-800 hover:bg-violet-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span className="sr-only">ปี</span>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-800 shadow-sm"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {tab === "summary" && "มุมมองสรุปรับ–จ่าย — เลือกแท็บอื่นเพื่อเปลี่ยนโฟกัสรายงาน"}
        {tab === "monthly" && "รายงานรายเดือน — กราฟแท่งจัดกลุ่ม"}
        {tab === "outcome" && "ผลลัพธ์เชิงยืนยัน (โฟกัสเดียวกับแท็บนี้ในต้นฉบับ)"}
      </p>

      {data.length === 0 ? (
        <p className="relative mt-4 flex min-h-[380px] items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
          ยังไม่มีข้อมูลรับ–จ่ายจากฐานข้อมูล — เชื่อม API รายงานบัญชีในขั้นถัดไป
        </p>
      ) : (
        <div className="relative mt-4 h-[380px] w-full rounded-xl border border-slate-100 bg-slate-50/50 p-2">
          <button
            type="button"
            className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600"
            aria-label="เมนูกราฟ"
          >
            <Menu className="h-5 w-5" />
          </button>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 16, right: 12, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(v) => fmtAxis(Number(v) / 1000) + "k"}
                tick={{ fontSize: 11 }}
                label={{
                  value: "$ (thousands)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 11, fill: "#64748b" },
                }}
              />
              <Tooltip
                formatter={(v: number) => [fmtBaht(v), ""]}
                labelFormatter={(l) => `เดือน ${l}`}
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
              />
              <Legend
                formatter={(v) => <span className="text-sm text-slate-700">{v}</span>}
              />
              <Bar dataKey="รายจ่าย" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="รายรับ" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="mt-2 text-center text-xs text-slate-400">ปี {year}</p>
    </div>
  );
}

type PlanWeekRow = {
  week: number;
  range: string;
  income: number;
  expense: number;
  incDone: number;
  incPlan: number;
  expDone: number;
  expPlan: number;
};

const PLAN_WEEKS_SAMPLE: PlanWeekRow[] = [];

function PlanIncomeExpensePanel() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState("all");
  const [expCat, setExpCat] = useState("all");
  const [graphMode, setGraphMode] = useState<"week" | "month">("week");

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">สรุปรายการ รับ - จ่าย</h2>
          <p className="text-sm text-slate-500">Report Expenditure</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            ตั้งค่า
            <span className="text-slate-400">▾</span>
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm"
          >
            {[2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm"
          >
            <option value="all">ทั้งหมด</option>
            {MONTHS_ORDER.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={expCat}
            onChange={(e) => setExpCat(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm"
          >
            <option value="all">ประเภทรายจ่าย (บริหาร) — ทั้งหมด</option>
            <option value="admin">บริหาร</option>
            <option value="ops">ปฏิบัติการ</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setGraphMode("week")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition ${
              graphMode === "week"
                ? "bg-amber-400 text-amber-950"
                : "border border-amber-200/80 bg-amber-50 text-amber-900 hover:bg-amber-100"
            }`}
          >
            <BarChart3 className="h-4 w-4 shrink-0" aria-hidden />
            กราฟ Week
          </button>
          <button
            type="button"
            onClick={() => setGraphMode("month")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition ${
              graphMode === "month"
                ? "bg-violet-600 text-white"
                : "bg-violet-100 text-violet-800 hover:bg-violet-200"
            }`}
          >
            <BarChart3 className="h-4 w-4 shrink-0" aria-hidden />
            กราฟ Month
          </button>
        </div>
      </div>

      {graphMode === "week" ? (
        <p className="mt-3 text-xs text-slate-500">แสดงตารางรายสัปดาห์</p>
      ) : PLAN_WEEKS_SAMPLE.length === 0 ? (
        <p className="mt-4 flex min-h-[280px] items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center text-sm text-slate-500">
          ยังไม่มีข้อมูลสำหรับกราฟรายเดือน
        </p>
      ) : (
        <div className="mt-4 h-[280px] rounded-xl border border-slate-100 bg-slate-50/50 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={PLAN_WEEKS_SAMPLE.map((w) => ({
                name: `W${w.week}`,
                รายรับ: w.income,
                รายจ่าย: w.expense,
              }))}
              margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => fmtAxis(Number(v))} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => fmtBaht(v)} />
              <Legend />
              <Bar dataKey="รายจ่าย" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="รายรับ" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3">ลำดับ WEEK</th>
              <th className="px-3 py-3">ระหว่างวันที่</th>
              <th className="px-3 py-3 text-right">เงินรับ</th>
              <th className="px-3 py-3 text-right">เงินจ่าย</th>
              <th className="px-3 py-3">รายละเอียด</th>
              <th className="px-3 py-3 w-14">CHAT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {PLAN_WEEKS_SAMPLE.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-10 text-center text-sm text-slate-500"
                >
                  ไม่มีข้อมูลรายสัปดาห์
                </td>
              </tr>
            ) : (
              PLAN_WEEKS_SAMPLE.map((row) => (
                <tr key={row.week} className="bg-white hover:bg-slate-50/80">
                  <td className="px-3 py-3 font-medium text-slate-800">{row.week}</td>
                  <td className="px-3 py-3 text-slate-600">{row.range}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-800">{fmtBaht(row.income)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-800">{fmtBaht(row.expense)}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                        {row.incDone}/{row.incPlan}
                      </span>
                      <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                        {row.expDone}/{row.expPlan}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-violet-600"
                      aria-label="แชท"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function buildQuarterSeries(
  _startWeek: number,
  _endWeek: number,
  _seed: number
): { week: string; รายรับ: number; รายจ่ายที่อนุมัติแล้ว: number }[] {
  return [];
}

function QuarterChart({
  title,
  startWeek,
  endWeek,
  seed,
}: {
  title: string;
  startWeek: number;
  endWeek: number;
  seed: number;
}) {
  const data = useMemo(
    () => buildQuarterSeries(startWeek, endWeek, seed),
    [startWeek, endWeek, seed]
  );

  return (
    <div className="relative flex min-h-[300px] flex-col rounded-xl border border-slate-100 bg-slate-50/40 p-3">
      <button
        type="button"
        className="absolute right-2 top-2 rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-600"
        aria-label="เมนูกราฟ"
      >
        <Menu className="h-4 w-4" />
      </button>
      <div className="mb-1 text-center text-xs font-bold text-slate-700">{title}</div>
      <div className="min-h-[260px] flex-1">
        {data.length === 0 ? (
          <p className="flex h-full items-center justify-center px-2 text-center text-xs text-slate-500">
            ไม่มีข้อมูล
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 32 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" tick={{ fontSize: 9 }} angle={-35} textAnchor="end" height={48} interval={0} />
              <YAxis
                width={48}
                tickFormatter={(v) => fmtAxis(Number(v))}
                tick={{ fontSize: 10 }}
                label={{
                  value: title,
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 10, fill: "#64748b" },
                }}
              />
              <Tooltip formatter={(v: number) => fmtBaht(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="รายจ่ายที่อนุมัติแล้ว" fill="#f43f5e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="รายรับ" fill="#14b8a6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function ResultIncomeExpensePanel() {
  const [tab, setTab] = useState<ReportTab>("summary");

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">สรุปผลลัพธ์ รับ - จ่าย</h2>
          <p className="text-sm text-slate-500">Report result</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {(
            [
              ["summary", "Report รับ - จ่าย"],
              ["monthly", "Report รับ - จ่าย รายเดือน"],
              ["outcome", "Report ผลลัพธ์"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === id
                  ? "bg-violet-600 text-white shadow-md"
                  : "bg-violet-100 text-violet-800 hover:bg-violet-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {tab === "summary" && "มุมมองสรุปรับ–จ่าย — กราฟไตรมาศ"}
        {tab === "monthly" && "มุมมองรายเดือนในหัวข้อผลลัพธ์"}
        {tab === "outcome" && "เน้นผลลัพธ์ — กราฟเปรียบเทียบรายรับกับรายจ่ายที่อนุมัติแล้ว รายสัปดาห์"}
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <QuarterChart title="Quarter 1" startWeek={1} endWeek={12} seed={11} />
        <QuarterChart title="Quarter 2" startWeek={13} endWeek={26} seed={23} />
        <QuarterChart title="Quarter 3" startWeek={27} endWeek={39} seed={37} />
        <QuarterChart title="Quarter 4" startWeek={40} endWeek={52} seed={41} />
      </div>
    </div>
  );
}

export function IncomeExpenseReportPanel({ view }: { view: IncomeExpenseSubView }) {
  if (view === "real") return <RealIncomeExpensePanel />;
  if (view === "plan") return <PlanIncomeExpensePanel />;
  return <ResultIncomeExpensePanel />;
}
