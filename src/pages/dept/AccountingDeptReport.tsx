import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptPageHeader } from "../../components/dept/DeptPageHeader";
import { useMnsDeptReport } from "../../hooks/useMnsDeptReport";

const DATA_FALLBACK = [
  { name: "สินทรัพย์", value: 3200000, color: "#6366f1" },
  { name: "หนี้สิน", value: 1800000, color: "#f97316" },
  { name: "ทุน", value: 1400000, color: "#14b8a6" },
  { name: "รายได้", value: 950000, color: "#22c55e" },
  { name: "ค่าใช้จ่าย", value: 620000, color: "#ec4899" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(n);

export function AccountingDeptReport() {
  const { loading, fromDb, data } = useMnsDeptReport("accounting");
  const acc = data && "accounting" in data ? data.accounting : null;
  const pieData =
    fromDb && acc?.pie && acc.pie.length > 0 ? acc.pie : DATA_FALLBACK;

  return (
    <DeptPageFrame>
      <DeptPageHeader
        deptId="accounting"
        titleTh="รีพอร์ต — แผนกบัญชี"
        titleEn="Accounting financial overview"
      />

      <p className="mb-4 text-sm text-slate-600">
        {loading && (
          <span className="text-violet-600">กำลังโหลดข้อมูลจากเซิร์ฟเวอร์…</span>
        )}
        {!loading && fromDb && (
          <span className="text-emerald-700">
            เชื่อมฐานข้อมูลแล้ว — สรุปจากเอกสาร (ใบเสนอราคา ใบแจ้งหนี้ ฯลฯ)
          </span>
        )}
        {!loading && !fromDb && (
          <span>โหมดตัวอย่าง — ยังไม่ได้เชื่อม MySQL หรือไม่มีข้อมูล</span>
        )}
      </p>

      {fromDb && acc?.raw && (
        <ul className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <li className="rounded-xl border border-slate-200/90 bg-slate-50 px-4 py-3 text-sm">
            <span className="text-slate-500">ยอดใบเสนอราคารวม</span>
            <p className="font-semibold tabular-nums text-slate-900">
              {fmt(acc.raw.quotaSum)} บาท
            </p>
          </li>
          <li className="rounded-xl border border-slate-200/90 bg-slate-50 px-4 py-3 text-sm">
            <span className="text-slate-500">ใบแจ้งหนี้ / ใบสั่งซื้อ</span>
            <p className="font-semibold text-slate-900">
              {fmt(acc.raw.invoiceCount)} / {fmt(acc.raw.orderCount)} ใบ
            </p>
          </li>
          <li className="rounded-xl border border-slate-200/90 bg-slate-50 px-4 py-3 text-sm">
            <span className="text-slate-500">เงินล่วงหน้า (รับของ) · RFQ</span>
            <p className="font-semibold tabular-nums text-slate-900">
              {fmt(acc.raw.receiveAdvanceSum)} บาท · {fmt(acc.raw.rfqCount)} รายการ
            </p>
          </li>
        </ul>
      )}

      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-100/80 sm:p-8">
        <h2 className="text-center text-lg font-semibold text-slate-900">
          {fromDb && acc?.pie && acc.pie.length > 0
            ? "สัดส่วนมูลค่าจากเอกสาร (ประมาณการ)"
            : "ผังบัญชี 5 หมวด (ตัวอย่าง)"}
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">
          {fromDb && acc?.pie && acc.pie.length > 0
            ? "รวมยอดใบเสนอราคา จำนวนเอกสาร และเงินล่วงหน้า — ใช้ดูภาพรวมเชิงปริมาณ"
            : "สินทรัพย์ · หนี้สิน · ทุน · รายได้ · ค่าใช้จ่าย"}
        </p>

        <div className="mt-6 h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={2}
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [fmt(value), "บาท"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={48}
                formatter={(value) => (
                  <span className="text-sm text-slate-700">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {pieData.map((row) => (
            <li
              key={row.name}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-2 text-sm"
            >
              <span className="flex items-center gap-2 font-medium text-slate-800">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: row.color }}
                />
                {row.name}
              </span>
              <span className="tabular-nums text-slate-600">
                {fmt(row.value)} บ.
              </span>
            </li>
          ))}
        </ul>
      </div>
    </DeptPageFrame>
  );
}
