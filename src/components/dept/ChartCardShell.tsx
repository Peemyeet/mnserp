import type { ReactNode } from "react";

export function ChartCardShell({
  title,
  children,
  className = "",
  menu,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  /** เมนูมุมขวา (เช่นเลือกช่วงเวลา) — ถ้าไม่ส่งจะไม่แสดงปุ่ม */
  menu?: ReactNode;
}) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80 transition-shadow hover:shadow-md ${className}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100/90 bg-slate-50/40 px-4 py-3">
        <h3 className="min-w-0 flex-1 text-sm font-semibold text-slate-800">
          {title}
        </h3>
        {menu ? <div className="shrink-0">{menu}</div> : null}
      </div>
      <div className="min-h-[200px] flex-1 p-4">{children}</div>
    </div>
  );
}
