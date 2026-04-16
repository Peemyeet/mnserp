import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Target, TrendingUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useMnsConnection } from "../../context/MnsConnectionContext";
import { mnsFetch } from "../../services/mnsApi";

type DashboardJob = {
  job_id: number;
  service_id: string;
  product_name: string;
  modified: string;
  job_status: number;
  customer_name: string | null;
  ws_name: string | null;
};

type SalesDashboardPayload = {
  ok?: boolean;
  mnsUserId?: number | null;
  displayName?: string | null;
  kpi?: {
    targetBaht: number;
    actualBaht: number;
    name: string;
  } | null;
  jobsTodo: DashboardJob[];
  jobsBacklog: DashboardJob[];
};

function formatBaht(n: number) {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 0 });
}

function formatShortDate(raw: string | undefined) {
  if (!raw?.trim()) return "—";
  const d = new Date(raw.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return raw.slice(0, 10);
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

function kpiProgress(target: number, actual: number) {
  if (target <= 0) return { pct: actual > 0 ? 100 : 0, met: actual > 0 };
  const pct = Math.min(100, (actual / target) * 100);
  return { pct, met: actual >= target };
}

function JobRows({
  jobs,
  emptyLabel,
}: {
  jobs: DashboardJob[];
  emptyLabel: string;
}) {
  if (jobs.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-500">
        {emptyLabel}
      </p>
    );
  }
  return (
    <ul className="max-h-[min(420px,55vh)] space-y-2 overflow-y-auto pr-1">
      {jobs.map((j) => (
        <li
          key={j.job_id}
          className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="min-w-0 font-semibold text-violet-800">
              {j.service_id || `#${j.job_id}`}
            </p>
            <span className="shrink-0 text-[11px] text-slate-500">
              {formatShortDate(j.modified)}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-700">
            {j.product_name || "—"}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500">
            {j.customer_name?.trim() || "—"} ·{" "}
            <span className="text-violet-700">
              {(j.ws_name ?? "").replace(/^N\d+(?:\.\d+)?\.?\s*/i, "") ||
                `สถานะ ${j.job_status}`}
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}

export function SalesMyWorkDashboard() {
  const { user } = useAuth();
  const conn = useMnsConnection();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [data, setData] = useState<SalesDashboardPayload | null>(null);

  useEffect(() => {
    if (!conn.ready || !user?.username) {
      setLoading(false);
      setLoadError(false);
      return;
    }
    if (!conn.apiOk || !conn.db) {
      setData(null);
      setLoadError(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const res = await mnsFetch<SalesDashboardPayload>(
          `/sales/dashboard?username=${encodeURIComponent(user.username)}`
        );
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) {
          setData(null);
          setLoadError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conn.ready, conn.apiOk, conn.db, user?.username]);

  if (!user?.username) {
    return null;
  }

  const kpi = data?.kpi;
  const prog = kpi ? kpiProgress(kpi.targetBaht, kpi.actualBaht) : null;

  const greetName =
    data?.displayName?.trim() ||
    user.displayNameTh?.trim() ||
    user.username;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          แดชบอร์ด สวัสดี{" "}
          <span className="text-violet-800">{greetName}</span>
        </h2>
        <p className="text-sm text-slate-500">
          งานและ KPI ตามบัญชีที่ล็อกอิน (
          <span className="font-medium text-slate-700">{user.username}</span>
          {user.displayNameTh && user.displayNameTh.trim() !== user.username
            ? ` · ${user.displayNameTh}`
            : null}
          )
        </p>
      </div>

      {!conn.apiOk || !conn.db ? (
        <p className="rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
          โหมดออฟไลน์หรือยังไม่เชื่อมฐานข้อมูล — แสดงข้อมูลได้เมื่อ API และฐานข้อมูลพร้อม
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-violet-600">กำลังโหลดแดชบอร์ด…</p>
      ) : loadError ? (
        <p className="rounded-xl border border-rose-100 bg-rose-50/80 px-4 py-3 text-sm text-rose-800">
          โหลดแดชบอร์ดไม่สำเร็จ — ลองรีเฟรชหรือตรวจสอบ API
        </p>
      ) : data?.mnsUserId == null ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">ยังเชื่อมบัญชี ERP กับฐานข้อมูล MNS ไม่ได้</p>
          <p className="mt-1 text-amber-900/90">
            ใช้ <strong className="font-semibold">username</strong> ล็อกอินให้ตรงกับค่าใน
            ตาราง <code className="rounded bg-white/80 px-1">user_data.username</code>{" "}
            ของ API จึงจะดึงรายการงานและ KPI ส่วนตัวได้
          </p>
        </div>
      ) : null}

      {data?.mnsUserId != null && kpi ? (
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-4 shadow-sm ring-1 ring-violet-100/60">
            <div className="flex items-center gap-2 text-violet-700">
              <Target className="h-5 w-5 shrink-0" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wide">
                เป้าหมาย (บาท)
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
              {formatBaht(kpi.targetBaht)}
            </p>
          </div>
          <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-4 shadow-sm ring-1 ring-teal-100/60">
            <div className="flex items-center gap-2 text-teal-700">
              <TrendingUp className="h-5 w-5 shrink-0" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wide">
                ยอดจริงสะสม (บาท)
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
              {formatBaht(kpi.actualBaht)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-1">
            <div className="flex items-center gap-2 text-slate-600">
              <ClipboardList className="h-5 w-5 shrink-0" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wide">
                ความคืบหน้า
              </span>
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all ${
                  prog?.met ? "bg-emerald-500" : "bg-violet-500"
                }`}
                style={{ width: `${Math.round(prog?.pct ?? 0)}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {prog?.met ? (
                <span className="font-medium text-emerald-700">ถึงเป้าแล้ว</span>
              ) : (
                <>
                  คิดเป็น{" "}
                  <span className="font-semibold tabular-nums text-slate-800">
                    {Math.round(prog?.pct ?? 0)}%
                  </span>{" "}
                  ของเป้า
                </>
              )}
            </p>
          </div>
        </section>
      ) : data?.mnsUserId != null && !kpi ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          ยังไม่มีข้อมูลยอด quota สำหรับบัญชีนี้ — KPI จะแสดงเมื่อมีรายการใน bill_quota
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900">งานค้าง</h3>
              <p className="text-xs text-slate-500">
                รอ PO เดินงานต่อ / หลังเสนอราคา — สถานะ N07–N17 และเคลมที่เปิดอยู่
              </p>
            </div>
            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-sm font-bold tabular-nums text-orange-900">
              {data?.jobsBacklog?.length ?? 0}
            </span>
          </div>
          <JobRows
            jobs={data?.jobsBacklog ?? []}
            emptyLabel="ไม่มีงานค้างในคิวของคุณ"
          />
        </section>

        <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900">งานที่ต้องทำ</h3>
              <p className="text-xs text-slate-500">
                ขั้นเสนอราคาและตรวจสอบ — สถานะ N01–N06
              </p>
            </div>
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-sm font-bold tabular-nums text-violet-900">
              {data?.jobsTodo?.length ?? 0}
            </span>
          </div>
          <JobRows
            jobs={data?.jobsTodo ?? []}
            emptyLabel="ไม่มีงานที่ต้องดำเนินการในขั้นเสนอราคา"
          />
        </section>
      </div>

      <p className="text-center text-xs text-slate-400">
        กรองงานตาม{" "}
        <strong className="font-medium text-slate-600">ผู้รับผิดชอบขาย</strong> ในฟิลด์{" "}
        <code className="rounded bg-slate-100 px-1">sale_id</code> /{" "}
        <code className="rounded bg-slate-100 px-1">user_id</code>{" "}
        ของงาน — ดูรายงานเต็มที่{" "}
        <Link
          to="/dept/sales/report"
          className="font-medium text-violet-700 hover:underline"
        >
          รีพอร์ตฝ่ายขาย
        </Link>
      </p>
    </div>
  );
}
