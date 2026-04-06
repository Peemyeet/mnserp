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
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptPageHeader } from "../../components/dept/DeptPageHeader";
import { ChartCardShell } from "../../components/dept/ChartCardShell";

const wip = [
  { name: "สัปดาห์ 1", plan: 4, actual: 3 },
  { name: "สัปดาห์ 2", plan: 5, actual: 5 },
  { name: "สัปดาห์ 3", plan: 6, actual: 4 },
  { name: "สัปดาห์ 4", plan: 5, actual: 6 },
];

export function ProductionDeptReport() {
  return (
    <DeptPageFrame>
      <DeptPageHeader
        deptId="production"
        titleTh="รีพอร์ต — ฝ่ายผลิต"
        titleEn="Production report"
        workPath="/dept/production/work"
        reportPath="/dept/production/report"
      />
      <ChartCardShell title="สรุปงานผลิตตามแผน">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={wip}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="plan" name="แผน" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="ทำได้จริง" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
      </ChartCardShell>
    </DeptPageFrame>
  );
}
