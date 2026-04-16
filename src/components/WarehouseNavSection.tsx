import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Box, ChevronDown, Factory, Package, Store } from "lucide-react";
import { WAREHOUSE_NAV_ITEMS } from "../data/warehouseNav";
import type { WarehouseKind } from "../types/orgSettings";

const ICONS: Record<WarehouseKind, typeof Package> = {
  spare: Package,
  production: Factory,
  sales: Store,
};

function linkClass(isActive: boolean) {
  return `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-indigo-100 text-indigo-800"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;
}

export function WarehouseNavSection({
  allowedKinds,
}: {
  allowedKinds: WarehouseKind[];
}) {
  const loc = useLocation();
  const [open, setOpen] = useState(() =>
    loc.pathname.startsWith("/warehouse")
  );

  useEffect(() => {
    if (loc.pathname.startsWith("/warehouse")) setOpen(true);
  }, [loc.pathname]);

  const onWarehousePath = loc.pathname.startsWith("/warehouse");

  const visible = useMemo(() => {
    const set = new Set(allowedKinds);
    return WAREHOUSE_NAV_ITEMS.filter((w) => set.has(w.id));
  }, [allowedKinds]);

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
        <Box
          className={`h-5 w-5 shrink-0 ${onWarehousePath ? "text-indigo-600" : "text-slate-400"}`}
        />
        <span className="min-w-0 flex-1 text-sm font-semibold">คลังสินค้า</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <ul
          className={`min-h-0 space-y-0.5 transition-all duration-300 ease-out ${
            open
              ? "translate-y-0 border-t border-slate-100/80 px-2 py-2 opacity-100"
              : "-translate-y-1 border-t-0 px-2 py-0 opacity-0"
          }`}
        >
          {visible.map((w, i) => {
            const Icon = ICONS[w.id];
            return (
              <li key={w.id}>
                <NavLink
                  to={`/warehouse/${w.id}`}
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
                        <span className="block truncate">{w.labelEn}</span>
                        <span className="block truncate text-xs font-normal text-slate-500">
                          {w.labelTh}
                        </span>
                      </span>
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
