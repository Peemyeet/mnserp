import { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Car,
  ClipboardList,
  Home,
  LineChart,
  LogOut,
  MessageCircle,
  Monitor,
  PenLine,
  Settings,
  UserCircle,
  X,
} from "lucide-react";
import {
  allowedDepartmentIds,
  canAccessDepartment,
  defaultHomePath,
  hasFullDepartmentAccess,
} from "../auth/deptAccess";
import { receivesItAdminAlerts } from "../auth/itAdminAlerts";
import { ALL_WAREHOUSE_KINDS } from "../data/warehouseNav";
import { useItSupport } from "../context/ItSupportContext";
import { useAuth } from "../context/AuthContext";
import { DepartmentNavSection } from "./DepartmentNavSection";
import { DocumentsNavSection } from "./DocumentsNavSection";
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
  mobileOpen = false,
  onCloseMobile,
}: {
  onOpenSettings?: () => void;
  /** บนมือถือ: true = แสดง drawer เมนู */
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { unreadSubmissionCount } = useItSupport();

  useEffect(() => {
    onCloseMobile?.();
  }, [location.pathname, location.search, onCloseMobile]);

  const deptIds = user ? allowedDepartmentIds(user) : [];
  const fullAccess = user ? hasFullDepartmentAccess(user) : true;
  const showSalesMenu = user ? canAccessDepartment(user, "sales") : true;

  const slideClass = mobileOpen ? "translate-x-0" : "-translate-x-full";

  return (
    <aside
      className={`print:hidden fixed inset-y-0 left-0 z-50 flex h-[100dvh] min-h-0 w-[min(18rem,calc(100vw-2rem))] max-w-[min(18rem,85vw)] shrink-0 flex-col border-r border-slate-200/80 bg-white shadow-lg shadow-slate-300/25 transition-transform duration-200 ease-out md:relative md:z-auto md:h-screen md:w-64 md:max-w-none md:shadow-sm ${slideClass} md:translate-x-0`}
    >
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-100 px-3">
        <NavLink
          to={user ? defaultHomePath(user) : "/"}
          className="flex min-w-0 flex-1 items-center gap-3 py-2 pl-2 no-underline"
          onClick={() => onCloseMobile?.()}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25">
            <span className="text-sm font-bold tracking-tight">M</span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              ERP MNS
            </p>
            <p className="truncate text-xs text-slate-500">แดชบอร์ดงาน</p>
          </div>
        </NavLink>
        <button
          type="button"
          className="touch-manipulation flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 md:hidden"
          onClick={() => onCloseMobile?.()}
          aria-label="ปิดเมนู"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
        <button
          type="button"
          className="flex w-full min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-600 transition hover:bg-slate-50"
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
        <NavLink
          to={user ? defaultHomePath(user) : "/"}
          end
          className="block rounded-xl no-underline"
        >
          {({ isActive }) => (
            <span
              className={`flex w-full min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${sidebarLinkContent(isActive)}`}
            >
              <Home
                className={`h-5 w-5 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
              />
              <span className="min-w-0 flex-1 truncate">หน้าหลัก</span>
            </span>
          )}
        </NavLink>
        <NavLink
          to="/forms/expense"
          end
          className="block rounded-xl no-underline"
        >
          {({ isActive }) => (
            <span
              className={`flex w-full min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${sidebarLinkContent(isActive)}`}
            >
              <ClipboardList
                className={`h-5 w-5 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
              />
              <span className="min-w-0 flex-1 truncate">เอกสารขอเบิก</span>
            </span>
          )}
        </NavLink>
        {showSalesMenu && (
          <NavLink to="/sales" className="block rounded-xl no-underline">
            {({ isActive }) => (
              <span
                className={`flex w-full min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${sidebarLinkContent(isActive)}`}
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
              className={`flex w-full min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${sidebarLinkContent(isActive)}`}
            >
              <Monitor
                className={`h-5 w-5 shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
              />
              <span className="min-w-0 flex-1 truncate">IT</span>
            </span>
          )}
        </NavLink>

        {fullAccess && <DocumentsNavSection />}

        {otherNav.map(({ icon: Icon, label, badge }) => (
          <button
            key={label}
            type="button"
            className="group flex w-full min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
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

      <div className="shrink-0 border-t border-slate-100 p-3">
        <button
          type="button"
          onClick={() => {
            onCloseMobile?.();
            onOpenSettings?.();
          }}
          className="flex w-full min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-600 transition hover:bg-slate-50"
        >
          <Settings className="h-5 w-5 shrink-0 text-slate-400" />
          <span className="text-sm font-medium">ตั้งค่า</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onCloseMobile?.();
            logout();
            navigate("/login", { replace: true });
          }}
          className="mt-1 flex w-full min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-left text-rose-600 transition hover:bg-rose-50"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}
