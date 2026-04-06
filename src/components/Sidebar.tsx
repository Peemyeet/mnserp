import { NavLink, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Car,
  ClipboardCheck,
  FileText,
  Home,
  LineChart,
  LogOut,
  MessageCircle,
  Monitor,
  PenLine,
  Settings,
  UserCircle,
} from "lucide-react";
import {
  allowedDepartmentIds,
  canAccessDepartment,
  hasFullDepartmentAccess,
} from "../auth/deptAccess";
import { receivesItAdminAlerts } from "../auth/itAdminAlerts";
import { ALL_WAREHOUSE_KINDS } from "../data/warehouseNav";
import { useItSupport } from "../context/ItSupportContext";
import { useAuth } from "../context/AuthContext";
import { DepartmentNavSection } from "./DepartmentNavSection";
import { WarehouseNavSection } from "./WarehouseNavSection";

type NavItem = {
  icon: LucideIcon;
  label: string;
  badge?: number;
};

const otherNav: NavItem[] = [
  { icon: MessageCircle, label: "แชท", badge: 10 },
  { icon: BarChart3, label: "รายงาน" },
  { icon: Car, label: "โลจิสติกส์" },
  { icon: LineChart, label: "วิเคราะห์" },
];

function sidebarLinkContent(isActive: boolean) {
  return isActive
    ? "bg-indigo-50 text-indigo-700"
    : "text-slate-600 hover:bg-indigo-50/60 hover:text-indigo-700";
}

export function Sidebar({
  onOpenSettings,
}: {
  onOpenSettings?: () => void;
}) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { unreadSubmissionCount } = useItSupport();

  const deptIds = user ? allowedDepartmentIds(user) : [];
  const fullAccess = user ? hasFullDepartmentAccess(user) : true;
  const showSalesMenu = user ? canAccessDepartment(user, "sales") : true;

  return (
    <aside className="print:hidden flex w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white shadow-sm">
      <NavLink
        to="/"
        className="flex h-16 items-center gap-3 border-b border-slate-100 px-5 no-underline"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25">
          <span className="text-sm font-bold tracking-tight">M</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            ERP MNS
          </p>
          <p className="truncate text-xs text-slate-500">แดชบอร์ดงาน</p>
        </div>
      </NavLink>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-600 transition hover:bg-slate-50"
        >
          <UserCircle className="h-5 w-5 shrink-0 text-slate-400" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {user?.displayNameTh ?? "โปรไฟล์"}
            </span>
            {user?.username != null && (
              <span className="block truncate text-xs font-normal text-slate-500">
                @{user.username}
                {user.roleCode != null && user.roleCode !== ""
                  ? ` · ${user.roleCode}`
                  : ""}
              </span>
            )}
          </span>
        </button>

        <p className="px-3 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          เมนูหลัก
        </p>
        <NavLink to="/" end className="block rounded-xl no-underline">
          {({ isActive }) => (
            <span
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${sidebarLinkContent(isActive)}`}
            >
              <Home
                className={`h-5 w-5 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
              />
              <span className="min-w-0 flex-1 truncate">หน้าหลัก</span>
            </span>
          )}
        </NavLink>
        {showSalesMenu && (
          <NavLink to="/sales" className="block rounded-xl no-underline">
            {({ isActive }) => (
              <span
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${sidebarLinkContent(isActive)}`}
              >
                <PenLine
                  className={`h-5 w-5 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
                />
                <span className="min-w-0 flex-1 truncate">บันทึกงานขาย</span>
              </span>
            )}
          </NavLink>
        )}

        {fullAccess && (
          <div className="px-0 pt-2">
            <DepartmentNavSection allowedDepartmentIds={deptIds} />
          </div>
        )}

        <div className="px-0 pt-2">
          <WarehouseNavSection allowedKinds={ALL_WAREHOUSE_KINDS} />
        </div>

        {user != null &&
          receivesItAdminAlerts(user) &&
          unreadSubmissionCount > 0 && (
            <NavLink
              to="/it/report"
              className="mt-2 block rounded-xl border border-rose-200 bg-rose-50 no-underline"
            >
              <span className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-rose-800">
                <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs text-white">
                  {unreadSubmissionCount > 99 ? "99+" : unreadSubmissionCount}
                </span>
                แจ้งปัญหา IT รอดู
              </span>
            </NavLink>
          )}

        <NavLink
          to="/it"
          className="block rounded-xl no-underline"
          end={false}
        >
          {({ isActive }) => (
            <span
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${sidebarLinkContent(isActive)}`}
            >
              <Monitor
                className={`h-5 w-5 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
              />
              <span className="min-w-0 flex-1 truncate">IT</span>
            </span>
          )}
        </NavLink>

        {fullAccess && (
          <NavLink to="/approve" className="block rounded-xl no-underline">
            {({ isActive }) => (
              <span
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${sidebarLinkContent(isActive)}`}
              >
                <ClipboardCheck
                  className={`h-5 w-5 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
                />
                <span className="min-w-0 flex-1 truncate">อนุมัติ</span>
              </span>
            )}
          </NavLink>
        )}

        {fullAccess && (
          <NavLink to="/documents" className="block rounded-xl no-underline">
            {({ isActive }) => (
              <span
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${sidebarLinkContent(isActive)}`}
              >
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  <FileText
                    className={`h-5 w-5 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
                  />
                  <span className="truncate">เอกสาร</span>
                </span>
                <span className="flex h-6 min-w-[1.5rem] shrink-0 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-semibold text-white">
                  220
                </span>
              </span>
            )}
          </NavLink>
        )}

        {otherNav.map(({ icon: Icon, label, badge }) => (
          <button
            key={label}
            type="button"
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
          >
            <Icon className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:text-indigo-600" />
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {label}
            </span>
            {badge != null && badge > 0 && (
              <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-semibold text-white">
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={() => onOpenSettings?.()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-600 transition hover:bg-slate-50"
        >
          <Settings className="h-5 w-5 shrink-0 text-slate-400" />
          <span className="text-sm font-medium">ตั้งค่า</span>
        </button>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-rose-600 transition hover:bg-rose-50"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}
