import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { FileSpreadsheet, Maximize2, X } from "lucide-react";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptPageHeader } from "../../components/dept/DeptPageHeader";
import {
  IncomeExpenseReportPanel,
  type IncomeExpenseSubView,
} from "./accounting/IncomeExpenseReportPanels";
import { AccountingStubReportPanel } from "./accounting/AccountingStubReportPanel";
import {
  ArApReportPanel,
  type ArApSubView,
} from "./accounting/ArApReportPanels";
import {
  LedgerReportPanel,
  type LedgerSubView,
} from "./accounting/LedgerReportPanels";
import { CommissionReportPanel } from "./accounting/CommissionReportPanels";
import { TaxReportPanel, type TaxSubView } from "./accounting/TaxReportPanels";
import {
  FinancialReportPanel,
  type FinancialSubView,
} from "./accounting/FinancialReportPanels";
import { AccountingExpandableReportSection } from "./accounting/AccountingExpandableReportSection";
import {
  accountingReportSubMenus,
  activeReportTitle,
  incomeExpenseLabel,
  incomeExpenseSubs,
  type ActiveAccountingReport,
  type ReportSectionKey,
} from "./accounting/accountingReportMenuData";

type LineKind = "link" | "stub" | "muted";

function MenuLine({
  children,
  kind,
  to,
}: {
  children: ReactNode;
  kind: LineKind;
  to?: string;
}) {
  const bullet = <span className="mr-2 select-none text-current">-</span>;
  if (kind === "muted") {
    return (
      <li className="flex items-baseline text-sm text-slate-400">
        {bullet}
        <span>{children}</span>
      </li>
    );
  }
  if (kind === "link" && to) {
    return (
      <li className="flex items-baseline text-sm">
        {bullet}
        <Link
          to={to}
          className="font-medium text-violet-600 hover:text-violet-800 hover:underline"
        >
          {children}
        </Link>
      </li>
    );
  }
  return (
    <li className="flex items-baseline text-sm text-violet-600">
      {bullet}
      <button
        type="button"
        className="text-left font-medium hover:text-violet-800 hover:underline"
        onClick={() =>
          alert(
            "ฟีเจอร์นี้จะเชื่อมเมนูเต็มรูปแบบในขั้นถัดไป — ใช้รีพอร์ตแผนกจากแท็บด้านบนได้ก่อน"
          )
        }
      >
        {children}
      </button>
    </li>
  );
}

function ActiveReportPanel({
  active,
  onRequestFullscreen,
}: {
  active: ActiveAccountingReport;
  onRequestFullscreen?: () => void;
}) {
  if (active.section === "income-expense") {
    return <IncomeExpenseReportPanel view={active.itemId} />;
  }
  if (active.section === "ar-ap") {
    return (
      <ArApReportPanel
        itemId={active.itemId as ArApSubView}
        onRequestFullscreen={onRequestFullscreen}
      />
    );
  }
  if (active.section === "ledger") {
    return (
      <LedgerReportPanel
        itemId={active.itemId as LedgerSubView}
        onRequestFullscreen={onRequestFullscreen}
      />
    );
  }
  if (active.section === "commission") {
    return (
      <CommissionReportPanel onRequestFullscreen={onRequestFullscreen} />
    );
  }
  if (active.section === "tax") {
    return (
      <TaxReportPanel
        itemId={active.itemId as TaxSubView}
        onRequestFullscreen={onRequestFullscreen}
      />
    );
  }
  if (active.section === "financial") {
    return (
      <FinancialReportPanel
        itemId={active.itemId as FinancialSubView}
        onRequestFullscreen={onRequestFullscreen}
      />
    );
  }
  const meta = activeReportTitle(active);
  return (
    <AccountingStubReportPanel
      sectionLabel={meta.sectionLabel}
      titleTh={meta.itemTitleTh}
      titleEn={meta.itemTitleEn}
    />
  );
}

/** เมนูรีพอร์ตบัญชี (Account report) — ตามโครงร่างระบบเดิม */
export function AccountingAccountReportPage() {
  const [openSection, setOpenSection] = useState<
    Partial<Record<ReportSectionKey, boolean>>
  >({});
  const [activeReport, setActiveReport] =
    useState<ActiveAccountingReport | null>(null);
  const [reportFullscreen, setReportFullscreen] = useState(false);

  const toggleSection = (key: ReportSectionKey) => {
    setOpenSection((s) => ({ ...s, [key]: !s[key] }));
  };

  const openFullscreen = (section: ReportSectionKey, itemId: string) => {
    if (section === "income-expense") {
      setActiveReport({
        section: "income-expense",
        itemId: itemId as IncomeExpenseSubView,
      });
    } else {
      setActiveReport({
        section,
        itemId,
      } as ActiveAccountingReport);
    }
    setOpenSection((s) => ({ ...s, [section]: true }));
    setReportFullscreen(true);
  };

  useEffect(() => {
    if (!reportFullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setReportFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [reportFullscreen]);

  useEffect(() => {
    if (activeReport == null) setReportFullscreen(false);
  }, [activeReport]);

  const fsMeta = activeReport ? activeReportTitle(activeReport) : null;

  const toolbarLine =
    activeReport?.section === "income-expense"
      ? `แผนรับจ่าย — ${incomeExpenseLabel(activeReport.itemId)}`
      : fsMeta?.breadcrumb ?? "";

  return (
    <DeptPageFrame>
      <DeptPageHeader
        deptId="accounting"
        titleTh="รีพอร์ตแอคเคาท์"
        titleEn="Account report"
      />

      <div
        className={`flex flex-col gap-6 lg:items-start ${activeReport ? "lg:flex-row" : ""}`}
      >
        <div
          className={`shrink-0 rounded-2xl border border-slate-100 bg-white p-8 shadow-sm ring-1 ring-slate-100/80 ${
            activeReport ? "w-full max-w-lg" : "mx-auto max-w-lg"
          }`}
        >
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <FileSpreadsheet className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-lg font-bold text-slate-900">บัญชี</p>
              <p className="text-xs text-slate-500">Accounting — เลือกหัวข้อด้านล่าง</p>
            </div>
          </div>

          <ul className="space-y-3.5">
            <AccountingExpandableReportSection
              label="แผน รับ / จ่าย"
              open={!!openSection["income-expense"]}
              onToggle={() => toggleSection("income-expense")}
              items={incomeExpenseSubs}
              activeItemId={
                activeReport?.section === "income-expense"
                  ? activeReport.itemId
                  : null
              }
              onSelectItem={(id) =>
                setActiveReport({
                  section: "income-expense",
                  itemId: id as IncomeExpenseSubView,
                })
              }
              onFullscreen={(id) => openFullscreen("income-expense", id)}
            />

            <AccountingExpandableReportSection
              label={accountingReportSubMenus["ar-ap"].label}
              open={!!openSection["ar-ap"]}
              onToggle={() => toggleSection("ar-ap")}
              items={accountingReportSubMenus["ar-ap"].items}
              activeItemId={
                activeReport?.section === "ar-ap" ? activeReport.itemId : null
              }
              onSelectItem={(id) =>
                setActiveReport({ section: "ar-ap", itemId: id })
              }
              onFullscreen={(id) => openFullscreen("ar-ap", id)}
            />

            <AccountingExpandableReportSection
              label={accountingReportSubMenus.ledger.label}
              open={!!openSection.ledger}
              onToggle={() => toggleSection("ledger")}
              items={accountingReportSubMenus.ledger.items}
              activeItemId={
                activeReport?.section === "ledger" ? activeReport.itemId : null
              }
              onSelectItem={(id) =>
                setActiveReport({ section: "ledger", itemId: id })
              }
              onFullscreen={(id) => openFullscreen("ledger", id)}
            />

            <AccountingExpandableReportSection
              label={accountingReportSubMenus.tax.label}
              open={!!openSection.tax}
              onToggle={() => toggleSection("tax")}
              items={accountingReportSubMenus.tax.items}
              activeItemId={
                activeReport?.section === "tax" ? activeReport.itemId : null
              }
              onSelectItem={(id) =>
                setActiveReport({ section: "tax", itemId: id })
              }
              onFullscreen={(id) => openFullscreen("tax", id)}
            />

            <AccountingExpandableReportSection
              label={accountingReportSubMenus.financial.label}
              open={!!openSection.financial}
              onToggle={() => toggleSection("financial")}
              items={accountingReportSubMenus.financial.items}
              activeItemId={
                activeReport?.section === "financial"
                  ? activeReport.itemId
                  : null
              }
              onSelectItem={(id) =>
                setActiveReport({ section: "financial", itemId: id })
              }
              onFullscreen={(id) => openFullscreen("financial", id)}
            />

            <AccountingExpandableReportSection
              label={accountingReportSubMenus.commission.label}
              open={!!openSection.commission}
              onToggle={() => toggleSection("commission")}
              items={accountingReportSubMenus.commission.items}
              activeItemId={
                activeReport?.section === "commission"
                  ? activeReport.itemId
                  : null
              }
              onSelectItem={(id) =>
                setActiveReport({ section: "commission", itemId: id })
              }
              onFullscreen={(id) => openFullscreen("commission", id)}
            />

            <MenuLine kind="muted">ระบบธนาคาร</MenuLine>

            <AccountingExpandableReportSection
              label={accountingReportSubMenus.statement.label}
              open={!!openSection.statement}
              onToggle={() => toggleSection("statement")}
              items={accountingReportSubMenus.statement.items}
              activeItemId={
                activeReport?.section === "statement"
                  ? activeReport.itemId
                  : null
              }
              onSelectItem={(id) =>
                setActiveReport({ section: "statement", itemId: id })
              }
              onFullscreen={(id) => openFullscreen("statement", id)}
            />

            <MenuLine kind="muted">รายงาน</MenuLine>
          </ul>

          <p className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-500">
            รีพอร์ตภาพรวมแผนก (กราฟ ERP) —{" "}
            <Link
              to="/dept/accounting/report"
              className="font-semibold text-violet-600 hover:underline"
            >
              ไปหน้ารีพอร์ตแผนกบัญชี
            </Link>
          </p>

          <p className="mt-4 text-center">
            <Link
              to="/dept/accounting"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
            >
              ← กลับหน้าแผนกบัญชี
            </Link>
          </p>
        </div>

        {activeReport ? (
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-500">{toolbarLine}</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReportFullscreen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800 shadow-sm transition hover:border-violet-300 hover:bg-violet-100"
                >
                  <Maximize2 className="h-3.5 w-3.5" aria-hidden />
                  เต็มหน้าจอ
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReport(null)}
                  className="text-xs font-semibold text-violet-600 hover:text-violet-800 hover:underline"
                >
                  ปิดรีพอร์ต
                </button>
              </div>
            </div>
            <ActiveReportPanel
              active={activeReport}
              onRequestFullscreen={() => setReportFullscreen(true)}
            />
          </div>
        ) : null}
      </div>

      {reportFullscreen && activeReport && fsMeta
        ? createPortal(
            <div
              className="fixed inset-0 z-[200] flex flex-col bg-slate-100/95 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
              aria-labelledby="accounting-report-fs-title"
            >
              <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200/90 bg-white/95 px-4 py-3 shadow-sm sm:px-6">
                <div className="min-w-0">
                  <h2
                    id="accounting-report-fs-title"
                    className="truncate text-base font-bold text-slate-900 sm:text-lg"
                  >
                    {fsMeta.sectionLabel} · {fsMeta.itemTitleTh}
                  </h2>
                  <p className="truncate text-xs text-slate-500 sm:text-sm">
                    {activeReport.section === "income-expense"
                      ? `${incomeExpenseLabel(activeReport.itemId)} · `
                      : ""}
                    กด Esc เพื่อปิด
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReportFullscreen(false)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <X className="h-4 w-4" aria-hidden />
                  ปิดเต็มหน้าจอ
                </button>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
                <div className="mx-auto max-w-[1680px]">
                  <ActiveReportPanel
                    active={activeReport}
                    onRequestFullscreen={() => setReportFullscreen(true)}
                  />
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </DeptPageFrame>
  );
}
