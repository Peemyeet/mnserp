import { NavLink } from "react-router-dom";
import type { DepartmentId } from "../../data/departments";

export function DeptPageHeader({
  deptId,
  titleTh,
  titleEn,
  extraAction,
  dashboardPath,
  workPath: workPathProp,
  reportPath: reportPathProp,
}: {
  deptId: DepartmentId;
  titleTh: string;
  titleEn: string;
  extraAction?: React.ReactNode;
  /** แท็บแดชบอร์ดก่อนทำงาน (เช่น `/dept/sales/dashboard`) */
  dashboardPath?: string;
  workPath?: string;
  reportPath?: string;
}) {
  const base =
    "rounded-xl px-4 py-2 text-sm font-semibold transition no-underline";
  const workPath = workPathProp ?? `/dept/${deptId}`;
  const reportPath = reportPathProp ?? `/dept/${deptId}/report`;
  const workLinkEnd = dashboardPath == null;

  return (
    <header className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {titleTh}
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">{titleEn}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {extraAction}
        {dashboardPath ? (
          <NavLink
            to={dashboardPath}
            end
            className={({ isActive }) =>
              `${base} min-h-[42px] items-center justify-center sm:inline-flex ${
                isActive
                  ? "bg-violet-600 text-white shadow-md ring-2 ring-violet-200/80"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50/50 hover:text-violet-800"
              }`
            }
          >
            แดชบอร์ด
          </NavLink>
        ) : null}
        <NavLink
          to={workPath}
          end={workLinkEnd}
          className={({ isActive }) =>
            `${base} min-h-[42px] items-center justify-center sm:inline-flex ${
              isActive
                ? "bg-violet-600 text-white shadow-md ring-2 ring-violet-200/80"
                : "border border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50/50 hover:text-violet-800"
            }`
          }
        >
          ทำงาน
        </NavLink>
        <NavLink
          to={reportPath}
          className={({ isActive }) =>
            `${base} min-h-[42px] items-center justify-center sm:inline-flex ${
              isActive
                ? "bg-violet-600 text-white shadow-md ring-2 ring-violet-200/80"
                : "border border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50/50 hover:text-violet-800"
            }`
          }
        >
          รีพอร์ต
        </NavLink>
      </div>
    </header>
  );
}
