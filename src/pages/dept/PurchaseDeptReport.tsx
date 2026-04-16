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

function fmt(n: number) {
  return new Intl.NumberFormat("th-TH").format(n);
}

export function PurchaseDeptReport() {
  const { loading, fromDb, data } = useMnsDeptReport("purchase");
  const purchase = data && "purchase" in data ? data.purchase : null;
  const trendData =
    fromDb && purchase?.trend && purchase.trend.length > 0
      ? purchase.trend
      : [];

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
          <span>
            ยังไม่มีข้อมูลจากฐานข้อมูล — import <code className="rounded bg-slate-100 px-1 text-xs">mns_pm_2021.sql</code> แล้วลองใหม่
          </span>
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
          trendData.length > 0
            ? "จำนวนใบสั่งซื้อต่อเดือน (bill_order)"
            : "จำนวนใบสั่งซื้อต่อเดือน"
        }
      >
        {trendData.length === 0 ? (
          <p className="py-16 text-center text-sm text-slate-500">
            ไม่มีข้อมูลแนวโน้ม — ตรวจสอบ bill_order หลังนำเข้าฐานข้อมูล
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="x" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="v"
                name="จำนวน PO ต่อเดือน"
                stroke="#7c3aed"
                fill="#c4b5fd"
                fillOpacity={0.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCardShell>
    </DeptPageFrame>
  );
}
