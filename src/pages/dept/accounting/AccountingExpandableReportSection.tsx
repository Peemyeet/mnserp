import { Bell, ChevronDown, Maximize2 } from "lucide-react";
import type { MenuSubItem } from "./accountingReportMenuData";

export function AccountingExpandableReportSection({
  label,
  open,
  onToggle,
  items,
  activeItemId,
  onSelectItem,
  onFullscreen,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  items: readonly MenuSubItem[];
  activeItemId: string | null;
  onSelectItem: (itemId: string) => void;
  onFullscreen: (itemId: string) => void;
}) {
  return (
    <li className="space-y-1">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-1 text-left text-sm font-medium text-violet-600 hover:text-violet-800"
      >
        <span className="select-none">-</span>
        <span className="flex-1">{label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-300 ease-out ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>
      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0">
          <ul className="mb-1 space-y-2 border-l-2 border-violet-100 pl-4 pt-1">
            {items.map((row) => {
              const active = activeItemId === row.id;
              return (
                <li key={row.id}>
                  <div
                    className={`flex items-stretch gap-1 rounded-xl transition-colors duration-200 ${
                      active ? "bg-violet-50 ring-1 ring-violet-200/80" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectItem(row.id)}
                      className="flex min-w-0 flex-1 items-start gap-3 rounded-xl px-2 py-2 text-left hover:bg-slate-50/90"
                    >
                      <span
                        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${row.iconWrap}`}
                      >
                        <Bell
                          className={`h-5 w-5 ${row.iconClass}`}
                          aria-hidden
                        />
                      </span>
                      <span className="min-w-0 pt-0.5">
                        <span className="block text-sm font-semibold text-slate-900">
                          {row.titleTh}
                        </span>
                        <span className="text-xs text-slate-500">{row.titleEn}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFullscreen(row.id);
                      }}
                      className="flex shrink-0 items-center justify-center rounded-lg px-2 text-slate-400 transition hover:bg-violet-100/80 hover:text-violet-700"
                      title="ดูแบบเต็มหน้าจอ"
                      aria-label={`เต็มหน้าจอ — ${row.titleTh}`}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </li>
  );
}
