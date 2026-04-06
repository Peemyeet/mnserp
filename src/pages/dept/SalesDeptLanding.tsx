import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartCardShell } from "../../components/dept/ChartCardShell";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";

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

const headerBtn =
  "rounded-xl px-4 py-2 text-sm font-semibold transition no-underline";

export function SalesDeptLanding() {
  const [year, setYear] = useState("2022");
  const [salesTeam, setSalesTeam] = useState("");

  return (
    <DeptPageFrame>
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Dashboard Sale
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">Sales department</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <NavLink
            to="/dept/sales/work"
            className={`${headerBtn} min-h-[42px] inline-flex items-center justify-center bg-violet-600 text-white shadow-md hover:bg-violet-700`}
          >
            ทำงาน
          </NavLink>
          <NavLink
            to="/dept/sales/report"
            className="text-sm font-semibold text-violet-700 no-underline hover:text-violet-900"
          >
            รีพอร์ต
          </NavLink>
        </div>
      </header>

      <div className="space-y-6">
        <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80 sm:p-5">
          <label className="text-sm text-slate-600">
            <span className="mb-1 block font-medium">ปี :</span>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
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
    </DeptPageFrame>
  );
}
