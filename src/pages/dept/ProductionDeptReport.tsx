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
import { useMnsDeptReport } from "../../hooks/useMnsDeptReport";

export function ProductionDeptReport() {
  const { loading, fromDb, data } = useMnsDeptReport("production");
  const chart =
    data && "production" in data ? data.production.chart : null;
  const chartData = fromDb && chart && chart.length > 0 ? chart : [];

  return (
    <DeptPageFrame>
      <DeptPageHeader
        deptId="production"
        titleTh="รีพอร์ต — ฝ่ายผลิต"
        titleEn="Production report"
        workPath="/dept/production/work"
        reportPath="/dept/production/report"
      />
      <p className="mb-4 text-sm text-slate-600">
        {loading && (
          <span className="text-violet-600">กำลังโหลดข้อมูลจากเซิร์ฟเวอร์…</span>
        )}
        {!loading && fromDb && (
          <span className="text-emerald-700">
            เชื่อมฐานข้อมูลแล้ว — นับงานจาก job_data ตาม workgroup
          </span>
        )}
        {!loading && !fromDb && (
          <span>
            ยังไม่มีข้อมูลจากฐานข้อมูล — import <code className="rounded bg-slate-100 px-1 text-xs">mns_pm_2021.sql</code> แล้วลองใหม่
          </span>
        )}
      </p>
      <ChartCardShell
        title={
          chartData.length > 0
            ? "สรุปงานผลิตตาม workgroup (แผนเทียบจริงโดยประมาณ)"
            : "สรุปงานผลิตตาม workgroup"
        }
      >
        {chartData.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-500">
            ไม่มีข้อมูลงานผลิต — ตรวจสอบ job_data หลังนำเข้าฐานข้อมูล
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="plan"
                name="แผน (ประมาณ)"
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
        )}
      </ChartCardShell>
    </DeptPageFrame>
  );
}
