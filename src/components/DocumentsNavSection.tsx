import { useEffect, useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { APPROVAL_DOC_CATEGORIES } from "../data/approvalCategories";
import {
  countForApprovalKind,
  useApproveCounts,
} from "../hooks/useApproveCounts";

function linkClass(isActive: boolean) {
  return `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-indigo-100 text-indigo-800"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;
}

export function DocumentsNavSection() {
  const counts = useApproveCounts();
  const loc = useLocation();
  const [open, setOpen] = useState(
    () => loc.pathname.startsWith("/documents") || loc.pathname.startsWith("/approve"),
  );

  useEffect(() => {
    if (loc.pathname.startsWith("/documents") || loc.pathname.startsWith("/approve")) {
      setOpen(true);
    }
  }, [loc.pathname]);

  const onDocsPath =
    loc.pathname.startsWith("/documents") || loc.pathname.startsWith("/approve");
  const summaryCount = counts.paymentSummary;
  const categoryCounts = Object.fromEntries(
    APPROVAL_DOC_CATEGORIES.map((c) => [c.id, countForApprovalKind(c.id, counts)]),
  ) as Record<(typeof APPROVAL_DOC_CATEGORIES)[number]["id"], number>;
  const totalBadge =
    summaryCount +
    APPROVAL_DOC_CATEGORIES.reduce((sum, c) => sum + categoryCounts[c.id], 0);

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-700 transition hover:bg-white/80"
        aria-expanded={open}
      >
        <FileText
          className={`h-5 w-5 shrink-0 ${onDocsPath ? "text-indigo-600" : "text-slate-400"}`}
        />
        <span className="min-w-0 flex-1 text-sm font-semibold">เอกสาร</span>
        {totalBadge > 0 ? (
          <span className="flex h-6 min-w-[1.5rem] shrink-0 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-semibold text-white">
            {totalBadge}
          </span>
        ) : null}
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
          <li>
            <NavLink
              to="/approve?view=payment-summary"
              className="block no-underline"
              onClick={() => setOpen(true)}
            >
              {({ isActive }) => (
                <span className={linkClass(isActive && loc.search.includes("payment-summary"))}>
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="min-w-0 flex-1 truncate">อนุมัติรายจ่าย</span>
                  {summaryCount > 0 ? (
                    <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-rose-100 px-1.5 text-xs font-semibold text-rose-500">
                      {summaryCount}
                    </span>
                  ) : null}
                </span>
              )}
            </NavLink>
          </li>
          {APPROVAL_DOC_CATEGORIES.map((c) => (
            <li key={c.id}>
              <NavLink
                to={`/approve?view=${c.id}`}
                className="block no-underline"
                onClick={() => setOpen(true)}
              >
                {({ isActive }) => (
                  <span className={linkClass(isActive && loc.search.includes(c.id))}>
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="min-w-0 flex-1 truncate">{c.labelTh}</span>
                    {categoryCounts[c.id] > 0 ? (
                      <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-rose-100 px-1.5 text-xs font-semibold text-rose-500">
                        {categoryCounts[c.id]}
                      </span>
                    ) : null}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
