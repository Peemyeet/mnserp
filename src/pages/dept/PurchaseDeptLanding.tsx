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

const shop = [{ name: "ข้อมูล", hasPo: 0.8, noPo: 1.0 }];
const overdue = [
  { g: "Graph", prod: 0.9, repair: 1.1, project: 0.7, equip: 0.85 },
];

const headerBtn =
  "rounded-xl px-4 py-2 text-sm font-semibold transition no-underline";

export function PurchaseDeptLanding() {
  return (
    <DeptPageFrame>
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            จัดหา
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">Purchase Department</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <NavLink
            to="/dept/purchase/work"
            className={`${headerBtn} min-h-[42px] inline-flex items-center justify-center bg-violet-600 text-white shadow-md hover:bg-violet-700`}
          >
            ทำงาน
          </NavLink>
          <NavLink
            to="/dept/purchase/report"
            className="text-sm font-semibold text-violet-700 no-underline hover:text-violet-900"
          >
            รีพอร์ต
          </NavLink>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-1">
          <ChartCardShell title="หาร้านค้า">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={shop}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={[0, 2]}
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "ใบ",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 11 },
                  }}
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="hasPo"
                  name="มี PO แล้ว"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="noPo"
                  name="ไม่มี PO"
                  fill="#14b8a6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCardShell>
        </div>
        <div className="lg:col-span-2">
          <ChartCardShell title="ค้างชำระ">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={overdue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="g" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={[0, 2]}
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
                  dataKey="prod"
                  name="Production"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="repair"
                  name="Repair"
                  stroke="#14b8a6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="project"
                  name="Project"
                  stroke="#eab308"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="equip"
                  name="Equipment"
                  stroke="#f97316"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCardShell>
        </div>
      </div>
    </DeptPageFrame>
  );
}
