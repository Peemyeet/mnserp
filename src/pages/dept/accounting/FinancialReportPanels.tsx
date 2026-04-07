import { useState, type ReactNode } from "react";
import {
  Factory,
  Layers,
  Maximize2,
  MessageSquare,
  Package,
  TrendingUp,
  Wallet,
  Wrench,
} from "lucide-react";
import { AccountingStubReportPanel } from "./AccountingStubReportPanel";

type CashflowTabId =
  | "report"
  | "pay-production"
  | "pay-office"
  | "pay-support"
  | "pay-sales"
  | "receive-po";

const CASHFLOW_TABS: {
  id: CashflowTabId;
  label: string;
  kind: "report" | "pay" | "receive";
}[] = [
  { id: "report", label: "Report", kind: "report" },
  { id: "pay-production", label: "แผนจ่าย (ผลิต)", kind: "pay" },
  { id: "pay-office", label: "แผนจ่าย (ออฟฟิศ)", kind: "pay" },
  { id: "pay-support", label: "แผนจ่าย (ซัพพอร์ต)", kind: "pay" },
  { id: "pay-sales", label: "แผนจ่าย (ขาย)", kind: "pay" },
  { id: "receive-po", label: "แผนรับ (PO)", kind: "receive" },
];

const PRODUCTION_CATEGORIES: {
  titleTh: string;
  titleEn: string;
  Icon: typeof Factory;
  border: string;
  iconWrap: string;
  wave: string;
}[] = [
  {
    titleTh: "ผลิต",
    titleEn: "Production",
    Icon: Factory,
    border: "border-violet-200/80",
    iconWrap: "bg-violet-100 text-violet-700 ring-violet-200/60",
    wave: "text-violet-300/90",
  },
  {
    titleTh: "ซ่อม",
    titleEn: "Repair",
    Icon: Wrench,
    border: "border-cyan-200/80",
    iconWrap: "bg-cyan-100 text-cyan-700 ring-cyan-200/60",
    wave: "text-cyan-300/90",
  },
  {
    titleTh: "พัฒนา",
    titleEn: "Develop",
    Icon: TrendingUp,
    border: "border-amber-200/80",
    iconWrap: "bg-amber-100 text-amber-800 ring-amber-200/60",
    wave: "text-amber-300/90",
  },
  {
    titleTh: "เครื่องมือ",
    titleEn: "Equipment",
    Icon: Package,
    border: "border-rose-200/80",
    iconWrap: "bg-rose-100 text-rose-700 ring-rose-200/60",
    wave: "text-rose-300/90",
  },
  {
    titleTh: "งบประมาณ",
    titleEn: "Budget",
    Icon: Wallet,
    border: "border-indigo-200/80",
    iconWrap: "bg-indigo-100 text-indigo-700 ring-indigo-200/60",
    wave: "text-indigo-300/90",
  },
];

function ProductionPayPanel() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-violet-100/80 bg-gradient-to-br from-violet-50/80 via-white to-slate-50/90 p-4 shadow-inner ring-1 ring-violet-100/60 sm:p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
              แผนจ่าย · ผลิต
            </p>
            <h3 className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
              สรุปรายจ่ายตามหมวด
            </h3>
            <p className="text-sm text-slate-500">
              แยกมุมมอง Production / Repair / Develop / Equipment / Budget
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PRODUCTION_CATEGORIES.map((c) => (
            <div
              key={c.titleTh}
              className={`group relative flex min-h-[148px] flex-col overflow-hidden rounded-2xl border bg-gradient-to-b from-white to-slate-50/90 p-5 shadow-md shadow-slate-200/35 ring-1 ring-slate-100/80 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-200/25 ${c.border}`}
            >
              <div className="relative z-10 flex flex-1 flex-col">
                <div
                  className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ring-2 ring-white/80 ${c.iconWrap}`}
                >
                  <c.Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                </div>
                <h4 className="text-lg font-bold tracking-tight text-slate-900">
                  {c.titleTh}
                </h4>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {c.titleEn}
                </p>
              </div>
              <svg
                viewBox="0 0 400 64"
                className={`pointer-events-none absolute bottom-0 left-0 h-16 w-full ${c.wave}`}
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  fill="currentColor"
                  fillOpacity={0.45}
                  d="M0,64 L0,34 C80,12 160,40 200,28 C260,12 320,48 400,22 L400,64 Z"
                />
                <path
                  fill="currentColor"
                  fillOpacity={0.2}
                  d="M0,64 L0,42 C100,24 200,52 280,36 C330,26 360,44 400,38 L400,64 Z"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md shadow-slate-200/30 ring-1 ring-slate-100/80">
        <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50/90 via-white to-teal-50/40 px-4 py-3">
          <p className="text-sm font-semibold text-slate-800">
            รายละเอียดรายสัปดาห์
          </p>
          <p className="text-xs text-slate-500">
            PRODUCTION · REPAIR · DEVELOP · EQUIPMENT · BUDGET
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs text-slate-600 sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/95">
                <th className="whitespace-nowrap px-3 py-3.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  ลำดับ WEEK
                </th>
                <th className="whitespace-nowrap px-3 py-3.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  ระหว่างวันที่
                </th>
                <th className="whitespace-nowrap px-3 py-3.5 text-[11px] font-bold uppercase tracking-wide text-violet-700">
                  PRODUCTION
                </th>
                <th className="whitespace-nowrap px-3 py-3.5 text-[11px] font-bold uppercase tracking-wide text-cyan-700">
                  REPAIR
                </th>
                <th className="whitespace-nowrap px-3 py-3.5 text-[11px] font-bold uppercase tracking-wide text-amber-700">
                  DEVELOP
                </th>
                <th className="whitespace-nowrap px-3 py-3.5 text-[11px] font-bold uppercase tracking-wide text-rose-700">
                  EQUIPMENT
                </th>
                <th className="whitespace-nowrap px-3 py-3.5 text-[11px] font-bold uppercase tracking-wide text-indigo-700">
                  BUDGET
                </th>
                <th className="whitespace-nowrap px-3 py-3.5 text-[11px] font-bold uppercase tracking-wide text-slate-700">
                  ยอดเงินรวม/WEEK
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  className="px-3 py-12 text-center text-sm text-slate-400"
                  colSpan={8}
                >
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs text-slate-500 ring-1 ring-slate-100">
                    ยังไม่มีข้อมูล — เลือกช่วงวันที่หรือเชื่อม API
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[640px] text-left text-xs text-slate-500 sm:text-sm">
        {children}
      </table>
    </div>
  );
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tbody>
      <tr>
        <td
          className="px-3 py-10 text-center text-slate-400"
          colSpan={colSpan}
        >
          —
        </td>
      </tr>
    </tbody>
  );
}

function CashflowV2Panel({
  onRequestFullscreen,
}: {
  onRequestFullscreen?: () => void;
}) {
  const [tab, setTab] = useState<CashflowTabId>("report");

  const tabTextClass = (t: (typeof CASHFLOW_TABS)[number], active: boolean) => {
    if (!active) return "text-slate-500";
    if (t.kind === "report") return "text-violet-700";
    if (t.kind === "receive") return "text-amber-700";
    return "text-teal-700";
  };

  const iconClass = (t: (typeof CASHFLOW_TABS)[number], active: boolean) => {
    if (!active) return "text-slate-400";
    if (t.kind === "report") return "text-violet-600";
    if (t.kind === "receive") return "text-amber-600";
    return "text-teal-600";
  };

  let tableContent: ReactNode;
  switch (tab) {
    case "report":
      tableContent = (
        <TableShell>
          <thead className="border-b border-slate-200 bg-slate-50/90">
            <tr>
              <th className="whitespace-nowrap px-2 py-2.5 font-semibold">
                ลำดับ WEEK
              </th>
              <th className="whitespace-nowrap px-2 py-2.5 font-semibold">
                ระหว่างวันที่
              </th>
              <th className="whitespace-nowrap px-2 py-2.5 font-semibold">
                รับ (ใบวางบิล)
              </th>
              <th className="whitespace-nowrap px-2 py-2.5 font-semibold">
                แผนจ่าย
              </th>
              <th className="whitespace-nowrap px-2 py-2.5 font-semibold">
                สามารถใช้ได้
              </th>
              <th className="whitespace-nowrap px-2 py-2.5 font-semibold">
                ยืม
              </th>
            </tr>
          </thead>
          <EmptyRow colSpan={6} />
        </TableShell>
      );
      break;
    case "pay-production":
      tableContent = <ProductionPayPanel />;
      break;
    case "pay-office":
      tableContent = (
        <TableShell>
          <thead className="border-b border-slate-200 bg-slate-50/90">
            <tr>
              <th className="min-w-[5rem] whitespace-nowrap px-2 py-2.5 font-semibold">
                ลำดับ WEEK
              </th>
              <th className="min-w-[6rem] whitespace-nowrap px-2 py-2.5 font-semibold">
                ระหว่างวันที่
              </th>
              <th className="min-w-[7rem] whitespace-nowrap px-2 py-2.5 font-semibold">
                บริหารสำนักงาน
              </th>
              <th className="min-w-[7rem] whitespace-nowrap px-2 py-2.5 font-semibold">
                สวัสดิการพนักงาน
              </th>
              <th className="min-w-[8rem] whitespace-nowrap px-2 py-2.5 font-semibold">
                ค่าภาษี-เบี้ยประกันต่างๆ
              </th>
              <th className="min-w-[10rem] whitespace-nowrap px-2 py-2.5 font-semibold">
                เช่าซื้อ/เงินกู้ธนาคาร/เงินกู้บุคคล
              </th>
              <th className="min-w-[9rem] whitespace-nowrap px-2 py-2.5 font-semibold">
                งบ MAINTENANCE อาคาร-สถานที่
              </th>
              <th className="min-w-[8rem] whitespace-nowrap px-2 py-2.5 font-semibold">
                งบ MAINTENANCE รถยนต์
              </th>
              <th className="min-w-[5rem] whitespace-nowrap px-2 py-2.5 font-semibold">
                งบอื่นๆ
              </th>
              <th className="min-w-[8rem] whitespace-nowrap px-2 py-2.5 font-semibold">
                รวมรายจ่ายงบทั้งหมด
              </th>
              <th className="min-w-[7rem] whitespace-nowrap px-2 py-2.5 font-semibold">
                ยอดเงินรวม/WEEK
              </th>
            </tr>
          </thead>
          <EmptyRow colSpan={11} />
        </TableShell>
      );
      break;
    case "pay-support":
      tableContent = (
        <TableShell>
          <thead className="border-b border-slate-200 bg-slate-50/90">
            <tr>
              <th className="whitespace-nowrap px-2 py-2.5 font-semibold">
                ลำดับ WEEK
              </th>
              <th className="whitespace-nowrap px-2 py-2.5 font-semibold">
                ระหว่างวันที่
              </th>
              <th className="whitespace-nowrap px-2 py-2.5 font-semibold">
                ซัพพอร์ต
              </th>
              <th className="whitespace-nowrap px-2 py-2.5 font-semibold">
                ซัพพอร์ต ( IT )
              </th>
              <th className="whitespace-nowrap px-2 py-2.5 font-semibold">
                ยอดเงินรวม/WEEK
              </th>
            </tr>
          </thead>
          <EmptyRow colSpan={5} />
        </TableShell>
      );
      break;
    case "pay-sales":
      tableContent = (
        <TableShell>
          <thead className="border-b border-slate-200 bg-slate-50/90">
            <tr>
              <th className="whitespace-nowrap px-2 py-2.5 font-semibold">
                ลำดับ WEEK
              </th>
              <th className="whitespace-nowrap px-2 py-2.5 font-semibold">
                ระหว่างวันที่
              </th>
              <th className="whitespace-nowrap px-2 py-2.5 font-semibold">ขาย</th>
              <th className="whitespace-nowrap px-2 py-2.5 font-semibold">
                ยอดเงินรวม/WEEK
              </th>
            </tr>
          </thead>
          <EmptyRow colSpan={4} />
        </TableShell>
      );
      break;
    case "receive-po":
      tableContent = (
        <TableShell>
          <thead className="border-b border-slate-200 bg-slate-50/90">
            <tr>
              <th className="whitespace-nowrap px-2 py-2.5 font-semibold">
                ลำดับ WEEK
              </th>
              <th className="whitespace-nowrap px-2 py-2.5 font-semibold">
                ระหว่างวันที่
              </th>
              <th className="whitespace-nowrap px-2 py-2.5 font-semibold">SALE</th>
              <th className="whitespace-nowrap px-2 py-2.5 font-semibold">
                REPAIR
              </th>
              <th className="whitespace-nowrap px-2 py-2.5 font-semibold">
                PROJECT
              </th>
              <th className="whitespace-nowrap px-2 py-2.5 font-semibold">
                ยอดเงินรวม/WEEK
              </th>
            </tr>
          </thead>
          <EmptyRow colSpan={6} />
        </TableShell>
      );
      break;
    default:
      tableContent = null;
  }

  return (
    <div className="w-full max-w-[1680px] space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Cashflow V2</h2>
          <p className="text-sm text-slate-500">Report Cashflow</p>
        </div>
        {onRequestFullscreen ? (
          <button
            type="button"
            onClick={onRequestFullscreen}
            className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-800 hover:bg-violet-100"
          >
            <Maximize2 className="h-3.5 w-3.5" aria-hidden />
            เต็มหน้าจอ
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80">
        <div className="flex flex-wrap gap-1 border-b border-slate-100 p-2 sm:gap-2">
          {CASHFLOW_TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  active ? "bg-violet-100 shadow-sm" : "hover:bg-slate-50"
                }`}
              >
                {t.kind === "report" ? (
                  <MessageSquare
                    className={`h-4 w-4 shrink-0 ${iconClass(t, active)}`}
                    aria-hidden
                  />
                ) : (
                  <Layers
                    className={`h-4 w-4 shrink-0 ${iconClass(t, active)}`}
                    aria-hidden
                  />
                )}
                <span className={tabTextClass(t, active)}>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          {tableContent}
        </div>
      </div>
    </div>
  );
}

export type FinancialSubView = "cashflow-v2" | "trial-balance";

export function FinancialReportPanel({
  itemId,
  onRequestFullscreen,
}: {
  itemId: FinancialSubView;
  onRequestFullscreen?: () => void;
}) {
  if (itemId === "trial-balance") {
    return (
      <AccountingStubReportPanel
        sectionLabel="งบการเงิน"
        titleTh="งบทดลอง"
        titleEn="Trial Balance"
      />
    );
  }
  return <CashflowV2Panel onRequestFullscreen={onRequestFullscreen} />;
}
