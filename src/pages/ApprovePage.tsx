import { useState } from "react";
import { Filter } from "lucide-react";
import {
  ApproveAuditPaymentPanel,
  ApproveCreatePoPanel,
  ApproveLeavePanel,
  ApprovePaymentSummaryPanel,
  ApprovePrNoJobPanel,
  ApproveVehiclePanel,
} from "../components/approve/ApproveTablePanels";
import { DocumentCategoryCards } from "../components/approve/DocumentCategoryCards";
import {
  APPROVAL_DOC_CATEGORIES,
  type ApprovalDocKind,
} from "../data/approvalCategories";

type ApproveView = "payment-summary" | ApprovalDocKind;

const VIEW_OPTIONS: { value: ApproveView; labelTh: string }[] = [
  { value: "payment-summary", labelTh: "ทั้งหมด" },
  ...APPROVAL_DOC_CATEGORIES.map((c) => ({
    value: c.id,
    labelTh: `${c.order}. ${c.labelTh}`,
  })),
];

export function ApprovePage() {
  const [activeView, setActiveView] = useState<ApproveView>("payment-summary");

  const selectView = (v: ApproveView) => setActiveView(v);

  return (
    <div className="min-h-full bg-slate-100/80">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/80 bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">อนุมัติ</h1>
          <p className="mt-1 text-sm font-semibold text-violet-800">
            อนุมัติรายการจ่าย
          </p>
          <p className="text-xs text-slate-500">
            เลือกประเภทเอกสารตามการ์ด 1–5 หรือมุมมองรวมจากเมนูด้านล่าง
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-violet-300"
        >
          <Filter className="h-4 w-4 text-violet-600" />
          Filter
        </button>
      </header>

      <div className="p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <label className="text-sm text-slate-700">
            <span className="mb-1 block font-medium">มุมมอง</span>
            <select
              value={activeView}
              onChange={(e) => selectView(e.target.value as ApproveView)}
              className="min-w-[240px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm"
            >
              {VIEW_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.labelTh}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          ประเภทเอกสาร (เรียง 1–5)
        </p>
        <div className="mb-8">
          <DocumentCategoryCards
            variant="approve"
            activeView={activeView}
            onSelect={selectView}
          />
        </div>

        {activeView === "payment-summary" && <ApprovePaymentSummaryPanel />}
        {activeView === "pr-no-job" && <ApprovePrNoJobPanel />}
        {activeView === "leave" && <ApproveLeavePanel />}
        {activeView === "vehicle" && <ApproveVehiclePanel />}
        {activeView === "audit-payment" && <ApproveAuditPaymentPanel />}
        {activeView === "create-po" && <ApproveCreatePoPanel />}
      </div>
    </div>
  );
}
