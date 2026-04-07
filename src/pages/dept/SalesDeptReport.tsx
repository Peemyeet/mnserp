import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SalesDeptKpiTable } from "../../components/dept/SalesDeptKpiTable";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptPageHeader } from "../../components/dept/DeptPageHeader";
import {
  SalesDeptOverviewCharts,
  type SalesReportPeriod,
} from "../../components/dept/SalesDeptOverviewCharts";
import { hasFullDepartmentAccess } from "../../auth/deptAccess";
import { useAuth } from "../../context/AuthContext";
import { useMnsConnection } from "../../context/MnsConnectionContext";
import { useMnsDeptReport } from "../../hooks/useMnsDeptReport";
import { mnsFetch } from "../../services/mnsApi";
import { isSalesDeptUser } from "../../utils/salesDeptUsers";

export function SalesDeptReport() {
  const { user } = useAuth();
  const conn = useMnsConnection();
  const full = user ? hasFullDepartmentAccess(user) : false;
  const [period, setPeriod] = useState<SalesReportPeriod>("month");
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [filterUserId, setFilterUserId] = useState<number | null>(null);
  const [adminUserOptions, setAdminUserOptions] = useState<
    { user_id: number; label: string }[]
  >([]);

  const { loading, fromDb, data } = useMnsDeptReport("sales", {
    username: full ? undefined : user?.username,
    period,
    year,
    filterUserId: full ? filterUserId : null,
  });
  const salesPayload = data && "sales" in data ? data.sales : null;

  useEffect(() => {
    if (!full || !conn.ready || !conn.apiOk || !conn.db) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await mnsFetch<{
          ok?: boolean;
          rows?: {
            user_id: number;
            fname: string;
            lname: string;
            user_gid?: number;
            group_name?: string;
          }[];
        }>("/users");
        if (cancelled || !res?.rows?.length) return;
        const salesOnly = res.rows.filter(isSalesDeptUser);
        setAdminUserOptions(
          salesOnly.map((r) => ({
            user_id: r.user_id,
            label:
              `${String(r.fname ?? "").trim()} ${String(r.lname ?? "").trim()}`.trim() ||
              `ผู้ใช้ ${r.user_id}`,
          }))
        );
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [full, conn.ready, conn.apiOk, conn.db]);

  return (
    <DeptPageFrame>
      <DeptPageHeader
        deptId="sales"
        titleTh="รีพอร์ต — ฝ่ายขาย"
        titleEn="Sales report"
        dashboardPath="/dept/sales/dashboard"
        workPath="/dept/sales/work"
        reportPath="/dept/sales/report"
      />

      <div className="space-y-8">
        <section>
          <h2 className="mb-1 text-base font-bold text-slate-900">
            ภาพรวมยอดขาย
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            {loading && (
              <span className="text-violet-600">กำลังโหลดข้อมูลจากเซิร์ฟเวอร์…</span>
            )}
            {!loading && fromDb && (
              <span className="text-emerald-700">เชื่อมฐานข้อมูลแล้ว — แสดงยอดจริง</span>
            )}
            {!loading && !fromDb && (
              <span>โหมดตัวอย่าง — ยังไม่ได้เชื่อม MySQL หรือไม่มีข้อมูล</span>
            )}
          </p>
          {full && fromDb && (
            <div className="mb-4 flex flex-wrap items-end gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 text-sm">
              <span className="w-full font-medium text-indigo-950 sm:w-auto">
                ผู้ดูแลระบบ — กรองตามพนักงาน (กราฟและ KPI)
              </span>
              <label className="min-w-[200px] text-slate-700">
                <span className="mb-1 block text-xs text-slate-500">ชื่อพนักงาน</span>
                <select
                  value={filterUserId ?? ""}
                  onChange={(e) =>
                    setFilterUserId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                >
                  <option value="">ทั้งหมด / ทีมขาย</option>
                  {adminUserOptions.map((o) => (
                    <option key={o.user_id} value={o.user_id}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {adminUserOptions.length === 0 ? (
                  <p className="mt-1 text-xs text-amber-700">
                    ยังไม่มีผู้ใช้ในกลุ่มพนักงานขาย / Support Sale / ผู้จัดการฝ่ายขาย
                    — ตรวจสอบกลุ่มใน user_group
                  </p>
                ) : null}
              </label>
            </div>
          )}
          <SalesDeptOverviewCharts
            liveSales={
              fromDb && salesPayload
                ? {
                    lineSeries: salesPayload.lineSeries ?? [],
                    workgroupJobCounts: salesPayload.workgroupJobCounts ?? [],
                  }
                : null
            }
            period={period}
            year={year}
            onPeriodChange={setPeriod}
            onYearChange={setYear}
          />
        </section>

        <section className="mx-auto max-w-6xl">
          <h2 className="mb-1 text-base font-bold text-slate-900">
            KPI รายคน — เทียบเป้าหมาย (บาท)
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            พนักขายเห็นเฉพาะเป้าของตนเอง — ผู้ดูแลภาพรวมเห็นทุกคน หากยังไม่ถึงเป้าจะแสดง % ของเป้าที่เหลือและจำนวนเงิน (บาท)
            {" "}
            เป้าหมาย (บาท) กำหนดได้ที่{" "}
            <Link
              to="/settings/users"
              className="font-semibold text-indigo-600 underline-offset-2 hover:underline"
            >
              ตั้งค่าผู้ใช้
            </Link>
            — ถ้าไม่ระบุ ระบบใช้สูตรประมาณจากยอดใบเสนอราคา
          </p>
          <SalesDeptKpiTable
            liveKpi={fromDb ? (salesPayload?.kpi ?? []) : undefined}
          />
        </section>
      </div>
    </DeptPageFrame>
  );
}
