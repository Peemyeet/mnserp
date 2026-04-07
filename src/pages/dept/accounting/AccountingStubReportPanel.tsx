import { useMemo } from "react";
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

const fmt = (n: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(n);

/** รีพอร์ตตัวอย่างสำหรับเมนูที่ยังไม่ได้ต่อ API — โครงสร้างคล้ายรีพอร์ตอื่นในระบบ */
export function AccountingStubReportPanel({
  sectionLabel,
  titleTh,
  titleEn,
}: {
  sectionLabel: string;
  titleTh: string;
  titleEn: string;
}) {
  const data = useMemo(
    () =>
      ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย."].map((m, i) => ({
        name: m,
        ค่า: Math.round(12000 + ((i * 173 + 11) % 180) * 900),
      })),
    []
  );

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 sm:p-6">
      <div className="border-b border-slate-100 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-600/90">
          {sectionLabel}
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">{titleTh}</h2>
        <p className="text-sm text-slate-500">{titleEn}</p>
      </div>

      <p className="mt-4 text-sm text-slate-600">
        พื้นที่รีพอร์ต (ข้อมูลตัวอย่าง) — เชื่อม API จริงในขั้นถัดไป
      </p>

      <div className="mt-4 h-[300px] w-full rounded-xl border border-slate-100 bg-slate-50/50 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => fmt(Number(v))} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Legend />
            <Bar dataKey="ค่า" fill="#7c3aed" radius={[4, 4, 0, 0]} name="สรุป (ตัวอย่าง)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
