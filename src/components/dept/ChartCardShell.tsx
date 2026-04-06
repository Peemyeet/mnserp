import { Menu } from "lucide-react";

export function ChartCardShell({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80 transition-shadow hover:shadow-md ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-100/90 bg-slate-50/40 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <button
          type="button"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="เมนูกราฟ"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-[200px] flex-1 p-4">{children}</div>
    </div>
  );
}
