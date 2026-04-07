import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Briefcase,
  Building2,
  ChevronDown,
  Cog,
  Landmark,
  ShoppingCart,
} from "lucide-react";
import { DEPARTMENTS, type DepartmentId } from "../data/departments";

const ICONS: Record<DepartmentId, typeof Briefcase> = {
  sales: Briefcase,
  production: Cog,
  purchase: ShoppingCart,
  accounting: Landmark,
};

function linkClass(isActive: boolean) {
  return `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-indigo-100 text-indigo-800"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;
}

export function DepartmentNavSection({
  allowedDepartmentIds,
}: {
  allowedDepartmentIds: DepartmentId[];
}) {
  const loc = useLocation();
  const [open, setOpen] = useState(() =>
    loc.pathname.startsWith("/dept")
  );

  useEffect(() => {
    if (loc.pathname.startsWith("/dept")) setOpen(true);
  }, [loc.pathname]);

  const onDeptPath = loc.pathname.startsWith("/dept");

  const visible = useMemo(() => {
    const set = new Set(allowedDepartmentIds);
    return DEPARTMENTS.filter((d) => set.has(d.id));
  }, [allowedDepartmentIds]);

  if (visible.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-700 transition hover:bg-white/80"
        aria-expanded={open}
      >
        <Building2
          className={`h-5 w-5 shrink-0 ${onDeptPath ? "text-indigo-600" : "text-slate-400"}`}
        />
        <span className="min-w-0 flex-1 text-sm font-semibold">แผนก</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="space-y-0.5 border-t border-slate-100/80 px-2 py-2">
          {visible.map((d, i) => {
            const Icon = ICONS[d.id];
            return (
              <li key={d.id}>
                <NavLink
                  to={
                    d.id === "sales"
                      ? "/dept/sales/dashboard"
                      : `/dept/${d.id}`
                  }
                  className="block no-underline"
                  onClick={() => setOpen(true)}
                >
                  {({ isActive }) => (
                    <span className={linkClass(isActive)}>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                        {i + 1}
                      </span>
                      <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{d.labelEn}</span>
                        <span className="block truncate text-xs font-normal text-slate-500">
                          {d.labelTh}
                        </span>
                      </span>
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
