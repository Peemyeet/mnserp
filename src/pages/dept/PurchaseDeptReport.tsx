import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptPageHeader } from "../../components/dept/DeptPageHeader";
import { ChartCardShell } from "../../components/dept/ChartCardShell";
import { useMnsDeptReport } from "../../hooks/useMnsDeptReport";

const trendFallback = [
  { x: "W1", v: 12 },
  { x: "W2", v: 18 },
  { x: "W3", v: 15 },
  { x: "W4", v: 22 },
  { x: "W5", v: 20 },
  { x: "W6", v: 28 },
];

function fmt(n: number) {
  return new Intl.NumberFormat("th-TH").format(n);
}

export function PurchaseDeptReport() {
  const { loading, fromDb, data } = useMnsDeptReport("purchase");
  const purchase = data && "purchase" in data ? data.purchase : null;
  const trendData =
    fromDb && purchase?.trend && purchase.trend.length > 0
      ? purchase.trend
      : trendFallback;

  return (
    <DeptPageFrame>
      <DeptPageHeader
        deptId="purchase"
        titleTh="รีพอร์ต — ฝ่ายจัดซื้อ"
        titleEn="Purchase report"
        workPath="/dept/purchase/work"
        reportPath="/dept/purchase/report"
      />
      <p className="mb-4 text-sm text-slate-600">
        {loading && (
          <span className="text-violet-600">กำลังโหลดข้อมูลจากเซิร์ฟเวอร์…</span>
        )}
        {!loading && fromDb && (
          <span className="text-emerald-700">
            เชื่อมฐานข้อมูลแล้ว — แนวโน้มจาก bill_order รายเดือน
          </span>
        )}
        {!loading && !fromDb && (
          <span>โหมดตัวอย่าง — ยังไม่ได้เชื่อม MySQL หรือไม่มีข้อมูล</span>
        )}
      </p>

      {fromDb && purchase != null && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium text-slate-500">PR ทั้งหมด</p>
            <p className="text-2xl font-semibold tabular-nums text-slate-900">
              {fmt(purchase.prCount)}
            </p>
            <p className="text-xs text-slate-400">จากตาราง pr_data</p>
          </div>
          <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium text-slate-500">ใบสั่งซื้อทั้งหมด</p>
            <p className="text-2xl font-semibold tabular-nums text-slate-900">
              {fmt(purchase.orderCount)}
            </p>
            <p className="text-xs text-slate-400">จากตาราง bill_order</p>
          </div>
        </div>
      )}

      <ChartCardShell
        title={
          fromDb && purchase?.trend && purchase.trend.length > 0
            ? "จำนวนใบสั่งซื้อต่อเดือน (bill_order)"
            : "แนวโน้มการสั่งซื้อ (ตัวอย่าง)"
        }
      >
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="x" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="v"
              name={fromDb ? "จำนวน PO ต่อเดือน" : "จำนวน PO"}
              stroke="#7c3aed"
              fill="#c4b5fd"
              fillOpacity={0.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCardShell>
    </DeptPageFrame>
  );
}
