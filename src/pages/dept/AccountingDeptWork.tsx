import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CircleDollarSign,
  FileSpreadsheet,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { loadExpenseClaims } from "../../data/expenseClaimStorage";
import { AuditPendingChoiceModal } from "../../components/dept/AuditPendingChoiceModal";
import { CreditorChoiceModal } from "../../components/dept/CreditorChoiceModal";
import { PaymentPendingChoiceModal } from "../../components/dept/PaymentPendingChoiceModal";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptPageHeader } from "../../components/dept/DeptPageHeader";
import { useMnsConnection } from "../../context/MnsConnectionContext";
import { mnsFetch } from "../../services/mnsApi";

export type AccountingWorkSummary = {
  ok: boolean;
  invoice: { count: number; totalBaht: number };
  billNote: { count: number; totalBaht: number };
  receipt: {
    totalCount: number;
    notDue: { count: number; baht: number };
    overdue: { count: number; baht: number };
  };
  payin: { pendingCount: number; totalBaht: number };
  verify: { count: number; totalBaht: number };
  approvePending: {
    totalCount: number;
    management: { count: number; baht: number };
    production: { count: number; baht: number };
  };
  unpaidPo: {
    waiting: { count: number; baht: number };
    unpaid: { count: number; baht: number };
    totalCount: number;
  };
};

function emptySummary(): AccountingWorkSummary {
  return {
    ok: true,
    invoice: { count: 0, totalBaht: 0 },
    billNote: { count: 0, totalBaht: 0 },
    receipt: {
      totalCount: 0,
      notDue: { count: 0, baht: 0 },
      overdue: { count: 0, baht: 0 },
    },
    payin: { pendingCount: 0, totalBaht: 0 },
    verify: { count: 0, totalBaht: 0 },
    approvePending: {
      totalCount: 0,
      management: { count: 0, baht: 0 },
      production: { count: 0, baht: 0 },
    },
    unpaidPo: {
      waiting: { count: 0, baht: 0 },
      unpaid: { count: 0, baht: 0 },
      totalCount: 0,
    },
  };
}

function fmtBaht(n: number) {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function Badge({
  n,
  tone = "neutral",
  showZero = false,
}: {
  n: number;
  tone?: "neutral" | "receive" | "pay";
  /** ถ้า true จะแสดง 0 เมื่อไม่มีรายการ (เช่น นับเอกสาร) */
  showZero?: boolean;
}) {
  if (n <= 0 && !showZero) return null;
  const cls =
    tone === "receive"
      ? "bg-emerald-800/90 text-white"
      : tone === "pay"
        ? "bg-rose-800/90 text-white"
        : "bg-white/90 text-slate-700";
  return (
    <span
      className={`absolute right-3 top-3 flex h-7 min-w-[1.75rem] items-center justify-center rounded-full px-2 text-xs font-bold shadow-sm ${cls}`}
    >
      {n}
    </span>
  );
}

export function AccountingDeptWork() {
  const conn = useMnsConnection();
  const [summary, setSummary] = useState<AccountingWorkSummary>(emptySummary);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [creditorModalOpen, setCreditorModalOpen] = useState(false);
  const [paymentPendingModalOpen, setPaymentPendingModalOpen] = useState(false);
  const creditorPendingCount = 0;
  const [expenseClaimCount, setExpenseClaimCount] = useState(() =>
    typeof window !== "undefined" ? loadExpenseClaims().length : 0,
  );

  useEffect(() => {
    if (!conn.ready) return;
    if (!conn.apiOk || !conn.db) {
      setSummary(emptySummary());
      setSummaryLoading(false);
      return;
    }
    let cancelled = false;
    setSummaryLoading(true);
    (async () => {
      try {
        const data = await mnsFetch<AccountingWorkSummary>(
          "/accounting/work-summary",
          { cache: "no-store" }
        );
        if (cancelled) return;
        setSummary(data?.ok ? data : emptySummary());
      } catch {
        if (!cancelled) setSummary(emptySummary());
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conn.ready, conn.apiOk, conn.db]);

  /** ระหว่างโหลดแสดง 0 ตามที่ต้องการ — ไม่แสดงตัวเลขจำลอง */
  const baht = (v: number) =>
    summaryLoading ? fmtBaht(0) : fmtBaht(v);
  const countStr = (v: number) => (summaryLoading ? "0" : String(v));

  useEffect(() => {
    const refresh = () =>
      setExpenseClaimCount(
        typeof window !== "undefined" ? loadExpenseClaims().length : 0,
      );
    refresh();
    window.addEventListener("mns-expense-claims-changed", refresh);
    return () =>
      window.removeEventListener("mns-expense-claims-changed", refresh);
  }, []);

  return (
    <DeptPageFrame>
      <DeptPageHeader
        deptId="accounting"
        titleTh="แผนกบัญชี"
        titleEn="Accounting Department"
      />

      {conn.ready && (!conn.apiOk || !conn.db) ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950">
          เชื่อมฐานข้อมูลไม่ได้ — ตัวเลขด้านล่างแสดงเป็น 0 จนกว่าจะตั้ง{" "}
          <code className="rounded bg-white/80 px-1 text-xs">DATABASE_URL</code> แบบ{" "}
          <code className="rounded bg-white/80 px-1 text-xs">mysql://</code> และ API พร้อม
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ฝ่ายรับ — โทนเขียว / เงินเข้า / ขอบซ้าย */}
        <div
          className="relative space-y-5 rounded-3xl border border-emerald-200/80 border-l-[8px] border-l-emerald-500 bg-gradient-to-br from-emerald-50/95 via-cyan-50/40 to-white p-5 shadow-md shadow-emerald-900/5 ring-1 ring-emerald-100/60"
          aria-label="บัญชีฝ่ายรับ"
        >
          <span className="absolute left-3 top-3 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            รับ · IN
          </span>
          <div className="mt-8 rounded-2xl bg-white/80 px-4 py-4 shadow-sm ring-1 ring-emerald-200/60 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                <ArrowDownToLine className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <div>
                <p className="text-sm font-bold text-emerald-950">
                  แผนกบัญชีฝ่ายรับ / Receiving
                </p>
                <p className="mt-1 text-xs font-normal leading-relaxed text-emerald-900/85">
                  เอกสารรับรู้รายได้ ใบกำกับ ใบวางบิล ใบเสร็จรับเงิน — โทนสี{" "}
                  <strong className="font-semibold">เขียว</strong> ทั้งคอลัมน์นี้
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <Link
              to="/dept/accounting/invoice"
              className="block rounded-2xl bg-gradient-to-br from-sky-100 to-emerald-100/90 p-4 pt-10 shadow-sm ring-2 ring-sky-200/90 no-underline transition hover:-translate-y-0.5 hover:ring-sky-400 hover:shadow-lg"
            >
              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-950">
                <CircleDollarSign className="h-3.5 w-3.5 shrink-0 opacity-80" />
                BILL INVOICE / ใบกำกับภาษี
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-950">
                {baht(summary.invoice.totalBaht)}
              </p>
            </Link>
            <Link
              to="/dept/accounting/invoice"
              className="absolute right-3 top-3 z-10 flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-emerald-800/90 px-2 text-xs font-bold text-white shadow-sm no-underline ring-2 ring-white/40 hover:bg-emerald-900"
              aria-label={`จำนวนใบกำกับภาษี ${summary.invoice.count} รายการ`}
              title="ไปหน้า BILL INVOICE"
            >
              {summary.invoice.count}
            </Link>
          </div>

          <div className="relative">
            <Link
              to="/dept/accounting/bill-note"
              className="block rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-100/80 p-4 pt-10 shadow-sm ring-2 ring-teal-200/80 no-underline transition hover:-translate-y-0.5 hover:ring-teal-400 hover:shadow-lg"
            >
              <p className="text-xs font-semibold text-teal-950">
                BILL NOTE / ใบวางบิล
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-teal-950">
                {baht(summary.billNote.totalBaht)}
              </p>
            </Link>
            <Link
              to="/dept/accounting/bill-note"
              className="absolute right-3 top-3 z-10 flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-emerald-800/90 px-2 text-xs font-bold text-white shadow-sm no-underline ring-2 ring-white/40 hover:bg-emerald-900"
              aria-label={`จำนวนใบวางบิล ${summary.billNote.count} รายการ`}
              title="ไปหน้า BILL NOTE"
            >
              {summary.billNote.count}
            </Link>
          </div>

          <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-2 ring-emerald-200/70">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-emerald-950">
                ใบเสร็จรับเงิน
              </span>
              <span className="rounded-full bg-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-900">
                {countStr(summary.receipt.totalCount)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/dept/accounting/receipt?scope=not-due"
                className="block rounded-xl bg-emerald-600 p-3 text-white no-underline shadow-md transition hover:ring-2 hover:ring-emerald-300"
              >
                <p className="text-xs opacity-95">ยังไม่เลยกำหนด</p>
                <p className="mt-1 text-lg font-bold tabular-nums">
                  {baht(summary.receipt.notDue.baht)}
                </p>
                <span className="mt-1 inline-block rounded-full bg-white/25 px-2 text-xs font-semibold">
                  {countStr(summary.receipt.notDue.count)}
                </span>
              </Link>
              <Link
                to="/dept/accounting/receipt?scope=overdue"
                className="block rounded-xl bg-red-600 p-3 text-white no-underline shadow-md transition hover:ring-2 hover:ring-red-300"
              >
                <p className="text-xs opacity-95">เลยกำหนด</p>
                <p className="mt-1 text-lg font-bold tabular-nums">
                  {baht(summary.receipt.overdue.baht)}
                </p>
                <span className="mt-1 inline-block rounded-full bg-white/25 px-2 text-xs font-semibold">
                  {countStr(summary.receipt.overdue.count)}
                </span>
              </Link>
            </div>
          </div>

          {/* ยืนยันการรับเงิน — แบนเนอร์ฟ้าอ่อม + ปุ่ม teal */}
          <div
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-100/90 via-sky-50/95 to-white py-7 pl-4 pr-6 shadow-sm ring-1 ring-cyan-200/60"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 1.75rem) 0, 100% 100%, 0 100%)",
            }}
          >
            <div className="flex justify-center">
              <Link
                to="/dept/accounting/payin"
                className="flex min-w-[11.5rem] flex-col items-center justify-center rounded-xl bg-teal-500 px-8 py-3.5 text-white no-underline shadow-md shadow-teal-900/15 transition hover:bg-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2"
                aria-label="ไปหน้ายืนยันการรับเงิน (Pay-In)"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                  CONFIRM
                </span>
                <span className="mt-1.5 text-sm font-semibold leading-tight">
                  ยืนยันการรับเงิน
                </span>
                <span className="mt-1 text-xl font-bold tabular-nums tracking-tight">
                  {baht(summary.payin.totalBaht)}
                </span>
                {summary.payin.pendingCount > 0 ? (
                  <span className="mt-1 text-[11px] font-medium opacity-90">
                    รอยืนยัน {countStr(summary.payin.pendingCount)} รายการ
                  </span>
                ) : null}
              </Link>
            </div>
          </div>
        </div>

        {/* ฝ่ายจ่าย — โทนแดง-ส้ม / เงินออก / ขอบขวา */}
        <div
          className="relative space-y-5 rounded-3xl border border-rose-200/80 border-r-[8px] border-r-rose-600 bg-gradient-to-bl from-rose-50/95 via-amber-50/50 to-white p-5 shadow-md shadow-rose-900/5 ring-1 ring-rose-100/70"
          aria-label="บัญชีฝ่ายจ่าย"
        >
          <span className="absolute right-3 top-3 rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            จ่าย · OUT
          </span>
          <div className="mt-8 rounded-2xl bg-white/85 px-4 py-4 shadow-sm ring-1 ring-rose-200/60 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md">
                <ArrowUpFromLine className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <div>
                <p className="text-sm font-bold text-rose-950">
                  แผนกบัญชีฝ่ายจ่าย / Paying
                </p>
                <p className="mt-1 text-xs font-normal leading-relaxed text-rose-900/85">
                  ตรวจสอบ อนุมัติจ่าย เจ้าหนี้ — โทนสี{" "}
                  <strong className="font-semibold">แดง-ส้ม</strong> ทั้งคอลัมน์นี้
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/dept/accounting/purchase-docs"
              className="rounded-xl border-2 border-amber-400 bg-amber-500 px-4 py-2 text-sm font-bold text-white no-underline shadow-sm transition hover:bg-amber-600"
            >
              เอกสารจากจัดหา / PO
            </Link>
            <button
              type="button"
              onClick={() => setCreditorModalOpen(true)}
              className="relative rounded-xl border-2 border-rose-700 bg-rose-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-rose-800"
            >
              ตั้งเจ้าหนี้
              {creditorPendingCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-rose-950 shadow">
                  {creditorPendingCount}
                </span>
              ) : null}
            </button>
          </div>

          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setAuditModalOpen(true)}
              className="relative w-full cursor-pointer rounded-2xl bg-gradient-to-br from-rose-100 to-amber-100 p-4 pt-10 text-left shadow-sm ring-2 ring-rose-200/80 transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            >
              <Badge n={summary.verify.count} tone="pay" showZero />
              <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-950">
                <Wallet className="h-3.5 w-3.5 shrink-0 opacity-90" />
                CHECK / VERIFY / รอตรวจสอบ
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-rose-950">
                {baht(summary.verify.totalBaht)}
              </p>
            </button>
            <Link
              to="/dept/accounting/expense-claim-summary"
              className="absolute right-3 top-3 z-10 flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-rose-800/90 px-2 text-xs font-bold text-white shadow-sm no-underline ring-2 ring-white/40 hover:bg-rose-900"
              aria-label={`สรุปใบขอเบิก ${expenseClaimCount} ใบ`}
              title="สรุปใบขอเบิก"
            >
              {expenseClaimCount}
            </Link>
          </div>

          <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-2 ring-rose-200/70">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-rose-950">รออนุมัติ</span>
              <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white">
                {countStr(summary.approvePending.totalCount)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/dept/accounting/approve-expense?kind=management"
                className="rounded-xl bg-amber-500 p-3 text-white no-underline shadow-md transition hover:bg-amber-600"
              >
                <p className="text-xs font-medium opacity-95">บริหาร</p>
                <p className="mt-1 text-sm font-bold tabular-nums leading-tight">
                  {baht(summary.approvePending.management.baht)}
                </p>
                <span className="mt-1 inline-block rounded-full bg-white/25 px-2 text-xs font-semibold">
                  {countStr(summary.approvePending.management.count)}
                </span>
              </Link>
              <Link
                to="/dept/accounting/approve-expense?kind=production"
                className="rounded-xl bg-rose-700 p-3 text-white no-underline shadow-md transition hover:bg-rose-800"
              >
                <p className="text-xs font-medium opacity-95">ผลิต</p>
                <p className="mt-1 text-lg font-bold tabular-nums">
                  {baht(summary.approvePending.production.baht)}
                </p>
                <span className="mt-1 inline-block rounded-full bg-white/25 px-2 text-xs font-semibold">
                  {countStr(summary.approvePending.production.count)}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setAuditModalOpen(true)}
                className="col-span-2 rounded-xl border border-rose-200 bg-rose-50/90 px-3 py-2.5 text-center text-sm font-semibold text-rose-900 shadow-sm transition hover:bg-rose-100"
              >
                คำขอเบิกจากฟอร์ม — รอตรวจสอบ
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-2 ring-amber-200/80">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-amber-950">ยังไม่ชำระ</span>
              <span className="rounded-full bg-amber-600 px-2.5 py-0.5 text-xs font-bold text-white">
                {countStr(summary.unpaidPo.totalCount)}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentPendingModalOpen(true)}
                className="rounded-xl bg-slate-600 p-3 text-left text-sm text-white shadow-md transition hover:bg-slate-700"
              >
                <p className="text-xs font-medium opacity-95">รอชำระ</p>
                <p className="mt-1 font-bold tabular-nums">
                  {baht(summary.unpaidPo.waiting.baht)}
                </p>
                <span className="text-xs opacity-90">
                  {countStr(summary.unpaidPo.waiting.count)}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentPendingModalOpen(true)}
                className="rounded-xl bg-red-600 p-3 text-left text-sm text-white shadow-md transition hover:bg-red-700"
              >
                <p className="text-xs font-medium opacity-95">ยังไม่ชำระ</p>
                <p className="mt-1 font-bold tabular-nums">
                  {baht(summary.unpaidPo.unpaid.baht)}
                </p>
                <span className="text-xs opacity-90">
                  {countStr(summary.unpaidPo.unpaid.count)}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <AuditPendingChoiceModal
        open={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
      />
      <CreditorChoiceModal
        open={creditorModalOpen}
        onClose={() => setCreditorModalOpen(false)}
      />
      <PaymentPendingChoiceModal
        open={paymentPendingModalOpen}
        onClose={() => setPaymentPendingModalOpen(false)}
      />

      <div className="mt-10 border-t border-slate-200 pt-8">
        <div className="flex flex-col items-center gap-3">
          <Link
            to="/dept/accounting/account-report"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition hover:bg-violet-700 hover:shadow-lg"
          >
            <FileSpreadsheet className="h-5 w-5 shrink-0" aria-hidden />
            รีพอร์ตแอคเคาท์
            <span className="font-normal text-violet-200">/ Account report</span>
          </Link>
          <p className="max-w-md text-center text-xs text-slate-500">
            เปิดเมนูหัวข้อรายงานบัญชี (แผนรับจ่าย สมุดบัญชี ภาษี ฯลฯ)
          </p>
        </div>
      </div>
    </DeptPageFrame>
  );
}
