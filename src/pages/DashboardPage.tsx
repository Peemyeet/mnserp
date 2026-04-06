import { Bell, CalendarDays } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { canAccessDepartment } from "../auth/deptAccess";
import { receivesItAdminAlerts } from "../auth/itAdminAlerts";
import { SummaryCards } from "../components/SummaryCards";
import { WorkflowList } from "../components/WorkflowList";
import { buildSummaryStats, buildWorkflowStagesWithCounts } from "../data/dashboard";
import { useAuth } from "../context/AuthContext";
import { useItSupport } from "../context/ItSupportContext";
import { useJobs } from "../context/JobsContext";

function todayThai() {
  return new Intl.DateTimeFormat("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function DashboardPage() {
  const { jobs } = useJobs();
  const { user } = useAuth();
  const { unreadSubmissionCount, unreadRows } = useItSupport();
  const location = useLocation();
  const navigate = useNavigate();
  const [itBellOpen, setItBellOpen] = useState(false);
  const itBellRef = useRef<HTMLDivElement>(null);

  const showAdminItBell = user != null && receivesItAdminAlerts(user);

  useEffect(() => {
    if (!itBellOpen) return;
    const close = (e: MouseEvent) => {
      if (itBellRef.current && !itBellRef.current.contains(e.target as Node)) {
        setItBellOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [itBellOpen]);

  const summaryStats = useMemo(() => buildSummaryStats(jobs), [jobs]);
  const workflowStages = useMemo(
    () => buildWorkflowStagesWithCounts(jobs),
    [jobs]
  );

  const salesStageLinks =
    user != null && canAccessDepartment(user, "sales");

  const [accessDeniedNote] = useState(
    () =>
      Boolean(
        (location.state as { accessDenied?: boolean } | null)?.accessDenied
      )
  );

  useEffect(() => {
    if (!accessDeniedNote) return;
    navigate(location.pathname, { replace: true, state: {} });
  }, [accessDeniedNote, location.pathname, navigate]);

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-surface/90 px-6 py-4 backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              สวัสดีครับ ยินดีต้อนรับกลับมา
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              ภาพรวมงาน
            </h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays className="h-4 w-4 shrink-0" />
              {todayThai()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {showAdminItBell ? (
              <div className="relative" ref={itBellRef}>
                <button
                  type="button"
                  onClick={() => setItBellOpen((o) => !o)}
                  className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
                  aria-expanded={itBellOpen}
                  aria-label="แจ้งเตือนแจ้งปัญหา IT"
                >
                  <Bell className="h-5 w-5" />
                  {unreadSubmissionCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadSubmissionCount > 99 ? "99+" : unreadSubmissionCount}
                    </span>
                  )}
                </button>
                {itBellOpen && (
                  <div className="absolute right-0 top-full z-30 mt-2 w-80 rounded-xl border border-slate-200 bg-white py-2 shadow-lg ring-1 ring-slate-100">
                    <p className="border-b border-slate-100 px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      แจ้งปัญหา IT
                    </p>
                    {unreadRows.length === 0 ? (
                      <p className="px-3 py-4 text-sm text-slate-500">
                        ไม่มีเรื่องใหม่จากผู้ใช้
                      </p>
                    ) : (
                      <ul className="max-h-56 overflow-y-auto">
                        {unreadRows.map((r) => (
                          <li
                            key={r.id}
                            className="border-b border-slate-50 px-3 py-2.5 last:border-0"
                          >
                            <p className="text-sm font-semibold text-slate-900">
                              {r.subject}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {r.reporter} · {r.openDate} · {r.queueId}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link
                      to="/it/report"
                      className="mt-1 block px-3 py-2.5 text-center text-sm font-semibold text-violet-700 no-underline hover:bg-violet-50"
                      onClick={() => setItBellOpen(false)}
                    >
                      เปิดคิวแจ้งปัญหา IT
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
                aria-label="การแจ้งเตือน"
              >
                <Bell className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-8 p-6">
        {accessDeniedNote && (
          <div
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="status"
          >
            คุณไม่มีสิทธิ์เข้าหน้านั้น — แสดงเฉพาะเมนูและข้อมูลตามแผนกของคุณ
          </div>
        )}
        <section aria-labelledby="summary-heading">
          <div className="mb-4">
            <h2
              id="summary-heading"
              className="text-base font-semibold text-slate-900"
            >
              สรุปจำนวนงาน
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              ตัวเลขคำนวณจากงานชุดเดียวกับที่ฝ่ายขายบันทึก
            </p>
          </div>
          <SummaryCards stats={summaryStats} />
        </section>

        <WorkflowList
          stages={workflowStages}
          totalInSystem={jobs.length}
          stageLinksEnabled={salesStageLinks}
        />
      </main>
    </>
  );
}
