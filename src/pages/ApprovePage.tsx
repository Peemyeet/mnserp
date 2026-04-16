import { useEffect, useMemo, useState } from "react";
import { Boxes, Filter } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  ApproveAuditPaymentPanel,
  ApproveCreatePoPanel,
  ApproveLeavePanel,
  ApprovePaymentSummaryPanel,
  ApprovePrNoJobPanel,
  ApproveVehiclePanel,
} from "../components/approve/ApproveTablePanels";
import {
  APPROVAL_DOC_CATEGORIES,
  type ApprovalDocKind,
} from "../data/approvalCategories";
import { useApproveCounts } from "../hooks/useApproveCounts";

type ApproveView = "payment-summary" | ApprovalDocKind;

const VIEW_OPTIONS: { value: ApproveView; labelTh: string }[] = [
  { value: "payment-summary", labelTh: "ทั้งหมด" },
  ...APPROVAL_DOC_CATEGORIES.map((c) => ({
    value: c.id,
    labelTh: `${c.order}. ${c.labelTh}`,
  })),
];

export function ApprovePage() {
  const counts = useApproveCounts();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialView = useMemo<ApproveView>(() => {
    const view = searchParams.get("view");
    const allow = new Set<ApproveView>([
      "payment-summary",
      "pr-no-job",
      "leave",
      "vehicle",
      "audit-payment",
      "create-po",
    ]);
    return allow.has(view as ApproveView) ? (view as ApproveView) : "payment-summary";
  }, [searchParams]);
  const [activeView, setActiveView] = useState<ApproveView>("payment-summary");
  const [company, setCompany] = useState("ทั้งหมด");
  const [docMenuOpen, setDocMenuOpen] = useState(false);

  const selectView = (v: ApproveView) => {
    setActiveView(v);
    const next = new URLSearchParams(searchParams);
    next.set("view", v);
    setSearchParams(next, { replace: true });
  };
  const cardClass =
    "relative overflow-hidden rounded-xl px-5 py-4 text-white shadow-sm transition hover:brightness-105";
  const activeCard = "ring-2 ring-violet-300 ring-offset-2";

  useEffect(() => {
    setActiveView(initialView);
  }, [initialView]);

  return (
    <div className="min-h-full bg-white">
      <header className="border-b border-slate-100 bg-white px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">อนุมัติ</h1>
            <p className="text-xs text-slate-400">Approve</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDocMenuOpen((v) => !v)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              เอกสาร
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>

        <div className="mt-3">
          <label className="text-sm text-slate-700">
            <span className="mb-1 block font-medium">บริษัท</span>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="min-w-[190px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="ทั้งหมด">ทั้งหมด</option>
              <option value="บริษัท มณีสถิตย์ กรุ๊ป จำกัด">
                บริษัท มณีสถิตย์ กรุ๊ป จำกัด
              </option>
            </select>
          </label>
        </div>
      </header>

      <div className="p-4 sm:p-6">
        {docMenuOpen ? (
          <div className="mb-5 max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <ul className="space-y-2 text-[2rem] leading-tight text-violet-500">
              <DocMenuItem
                label="อนุมัติรายการจ่าย"
                count={counts.paymentSummary}
                active={activeView === "payment-summary"}
                onClick={() => selectView("payment-summary")}
              />
              <DocMenuItem
                label="รายการ PR ไม่มี JOB"
                count={counts.prNoJob}
                active={activeView === "pr-no-job"}
                onClick={() => selectView("pr-no-job")}
              />
              <DocMenuItem
                label="ใบลา"
                count={counts.leave}
                active={activeView === "leave"}
                onClick={() => selectView("leave")}
              />
              <DocMenuItem
                label="ใบเบิกรถ"
                count={counts.vehicle}
                active={activeView === "vehicle"}
                onClick={() => selectView("vehicle")}
              />
              <DocMenuItem
                label="ตรวจสอบรายการจ่าย"
                count={counts.auditPayment}
                active={activeView === "audit-payment"}
                onClick={() => selectView("audit-payment")}
              />
              <DocMenuItem
                label="ทำใบสั่งซื้อ"
                count={counts.createPo}
                active={activeView === "create-po"}
                onClick={() => selectView("create-po")}
              />
            </ul>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => selectView("pr-no-job")}
            className={`${cardClass} bg-cyan-500 ${activeView === "pr-no-job" ? activeCard : ""}`}
          >
            <span className="absolute right-2 top-2 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-white/70 px-1.5 text-xs font-bold text-slate-700">
              {counts.prNoJob}
            </span>
            <p className="text-4xl font-black leading-none opacity-15">1</p>
            <p className="mt-1 text-3xl font-semibold leading-tight">Production</p>
            <p className="text-sm opacity-90">ผลิต</p>
          </button>
          <button
            type="button"
            onClick={() => selectView("leave")}
            className={`${cardClass} bg-amber-500 ${activeView === "leave" ? activeCard : ""}`}
          >
            <span className="absolute right-2 top-2 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-white/70 px-1.5 text-xs font-bold text-slate-700">
              {counts.leave}
            </span>
            <p className="text-4xl font-black leading-none opacity-15">2</p>
            <p className="mt-1 text-3xl font-semibold leading-tight">Repair</p>
            <p className="text-sm opacity-90">ซ่อม</p>
          </button>
          <button
            type="button"
            onClick={() => selectView("vehicle")}
            className={`${cardClass} bg-rose-500 ${activeView === "vehicle" ? activeCard : ""}`}
          >
            <span className="absolute right-2 top-2 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-white/70 px-1.5 text-xs font-bold text-slate-700">
              {counts.vehicle}
            </span>
            <p className="text-4xl font-black leading-none opacity-15">3</p>
            <p className="mt-1 text-3xl font-semibold leading-tight">Develop</p>
            <p className="text-sm opacity-90">พัฒนา</p>
          </button>
          <button
            type="button"
            onClick={() => selectView("create-po")}
            className={`${cardClass} bg-violet-500 ${activeView === "create-po" ? activeCard : ""}`}
          >
            <span className="absolute right-2 top-2 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-white/70 px-1.5 text-xs font-bold text-slate-700">
              {counts.createPo}
            </span>
            <p className="text-4xl font-black leading-none opacity-15">5</p>
            <p className="mt-1 text-3xl font-semibold leading-tight">Equipment</p>
            <p className="text-sm opacity-90">เครื่องมือ</p>
          </button>
        </div>

        <div className="mb-5 mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-2 py-1 text-sm text-slate-700">
            <Boxes className="h-4 w-4" />
            <span>มุมรายการ</span>
            <select
              value={activeView}
              onChange={(e) => selectView(e.target.value as ApproveView)}
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
            >
              {VIEW_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.labelTh}
                </option>
              ))}
            </select>
          </div>
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

function DocMenuItem({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-3 text-left transition ${active ? "font-semibold" : ""}`}
      >
        <span className="inline-block h-4 w-4 rounded-full bg-amber-400" />
        <span>{label}</span>
        {count > 0 ? (
          <span className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full bg-rose-100 px-2 text-[1.8rem] leading-none text-rose-500">
            {count}
          </span>
        ) : null}
      </button>
    </li>
  );
}
