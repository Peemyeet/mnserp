import { NavLink } from "react-router-dom";
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
import { ChartCardShell } from "../../components/dept/ChartCardShell";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";

const wip = [
  { name: "สัปดาห์ 1", plan: 4, actual: 3 },
  { name: "สัปดาห์ 2", plan: 5, actual: 5 },
  { name: "สัปดาห์ 3", plan: 6, actual: 4 },
  { name: "สัปดาห์ 4", plan: 5, actual: 6 },
];

const headerBtn =
  "rounded-xl px-4 py-2 text-sm font-semibold transition no-underline";

export function ProductionDeptLanding() {
  return (
    <DeptPageFrame>
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            ฝ่ายผลิต
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">Production Department</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          <NavLink
            to="/dept/production/work"
            className={`${headerBtn} min-h-[42px] inline-flex items-center justify-center bg-violet-600 text-white shadow-md hover:bg-violet-700`}
          >
            ทำงาน
          </NavLink>
          <NavLink
            to="/dept/production/report"
            className="text-sm font-semibold text-violet-700 no-underline hover:text-violet-900"
          >
            รีพอร์ต
          </NavLink>
        </div>
      </header>

      <ChartCardShell title="สรุปงานผลิตตามแผน (ภาพรวม)">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={wip}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="plan"
              name="แผน"
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="actual"
              name="ทำได้จริง"
              fill="#14b8a6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCardShell>
    </DeptPageFrame>
  );
}
