import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Package } from "lucide-react";

export function PurchaseDeptSettingsMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:bg-white"
      >
        <Package className="h-4 w-4 text-slate-500" aria-hidden />
        ตั้งค่า
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-30 mt-1 min-w-[220px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-100"
          role="menu"
        >
          <Link
            to="/dept/purchase"
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-slate-700 no-underline hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            สรุป
          </Link>
          <Link
            to="/approve"
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-slate-700 no-underline hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            Approve PR ไม่มี Job
          </Link>
          <Link
            to="/approve"
            role="menuitem"
            className="block px-4 py-2.5 text-sm text-slate-700 no-underline hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            อนุมัติรายการอะไหล่
          </Link>
        </div>
      )}
    </div>
  );
}
