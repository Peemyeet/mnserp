import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CircleDollarSign,
  FileSpreadsheet,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptPageHeader } from "../../components/dept/DeptPageHeader";

function Badge({
  n,
  tone = "neutral",
}: {
  n: number;
  tone?: "neutral" | "receive" | "pay";
}) {
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
  return (
    <DeptPageFrame>
      <DeptPageHeader
        deptId="accounting"
        titleTh="แผนกบัญชี"
        titleEn="Accounting Department"
      />

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

          <Link
            to="/dept/accounting/invoice"
            className="relative block rounded-2xl bg-gradient-to-br from-sky-100 to-emerald-100/90 p-4 pt-10 shadow-sm ring-2 ring-sky-200/90 no-underline transition hover:-translate-y-0.5 hover:ring-sky-400 hover:shadow-lg"
          >
            <Badge n={2} tone="receive" />
            <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-950">
              <CircleDollarSign className="h-3.5 w-3.5 shrink-0 opacity-80" />
              BILL INVOICE / ใบกำกับภาษี
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-950">
              41,944.00
            </p>
          </Link>

          <Link
            to="/dept/accounting/bill-note"
            className="relative block rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-100/80 p-4 pt-10 shadow-sm ring-2 ring-teal-200/80 no-underline transition hover:-translate-y-0.5 hover:ring-teal-400 hover:shadow-lg"
          >
            <Badge n={0} tone="receive" />
            <p className="text-xs font-semibold text-teal-950">
              BILL NOTE / ใบวางบิล
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-teal-950">
              0.00
            </p>
          </Link>

          <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-2 ring-emerald-200/70">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-emerald-950">
                ใบเสร็จรับเงิน
              </span>
              <span className="rounded-full bg-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-900">
                8
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/dept/accounting/receipt?scope=not-due"
                className="block rounded-xl bg-emerald-600 p-3 text-white no-underline shadow-md transition hover:ring-2 hover:ring-emerald-300"
              >
                <p className="text-xs opacity-95">ยังไม่เลยกำหนด</p>
                <p className="mt-1 text-lg font-bold tabular-nums">978,545.00</p>
                <span className="mt-1 inline-block rounded-full bg-white/25 px-2 text-xs font-semibold">
                  6
                </span>
              </Link>
              <Link
                to="/dept/accounting/receipt?scope=overdue"
                className="block rounded-xl bg-red-600 p-3 text-white no-underline shadow-md transition hover:ring-2 hover:ring-red-300"
              >
                <p className="text-xs opacity-95">เลยกำหนด</p>
                <p className="mt-1 text-lg font-bold tabular-nums">149,425.50</p>
                <span className="mt-1 inline-block rounded-full bg-white/25 px-2 text-xs font-semibold">
                  2
                </span>
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
            <button
              type="button"
              className="rounded-xl border-2 border-amber-400 bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600"
            >
              เอกสารจากจัดหา / PO
            </button>
            <button
              type="button"
              className="relative rounded-xl border-2 border-rose-700 bg-rose-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-rose-800"
            >
              ตั้งเจ้าหนี้
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-rose-950 shadow">
                0
              </span>
            </button>
          </div>

          <div className="relative rounded-2xl bg-gradient-to-br from-rose-100 to-amber-100 p-4 pt-10 shadow-sm ring-2 ring-rose-200/80 transition hover:shadow-md">
            <Badge n={4} tone="pay" />
            <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-950">
              <Wallet className="h-3.5 w-3.5 shrink-0 opacity-90" />
              CHECK / VERIFY / รอตรวจสอบ
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-rose-950">
              4,798.00
            </p>
          </div>

          <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-2 ring-rose-200/70">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-rose-950">รออนุมัติ</span>
              <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white">
                212
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-amber-500 p-3 text-white shadow-md">
                <p className="text-xs font-medium opacity-95">บริหาร</p>
                <p className="mt-1 text-sm font-bold tabular-nums leading-tight">
                  27,344,387.60
                </p>
                <span className="mt-1 inline-block rounded-full bg-white/25 px-2 text-xs font-semibold">
                  207
                </span>
              </div>
              <div className="rounded-xl bg-rose-700 p-3 text-white shadow-md">
                <p className="text-xs font-medium opacity-95">ผลิต</p>
                <p className="mt-1 text-lg font-bold tabular-nums">136,782.45</p>
                <span className="mt-1 inline-block rounded-full bg-white/25 px-2 text-xs font-semibold">
                  5
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/90 p-4 shadow-sm ring-2 ring-amber-200/80">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-amber-950">ยังไม่ชำระ</span>
              <span className="rounded-full bg-amber-600 px-2.5 py-0.5 text-xs font-bold text-white">
                155
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-slate-600 p-3 text-sm text-white shadow-md">
                <p className="text-xs font-medium opacity-95">รอชำระ</p>
                <p className="mt-1 font-bold tabular-nums">0.00</p>
                <span className="text-xs opacity-90">0</span>
              </div>
              <div className="rounded-xl bg-red-600 p-3 text-sm text-white shadow-md">
                <p className="text-xs font-medium opacity-95">ยังไม่ชำระ</p>
                <p className="mt-1 font-bold tabular-nums">376,301.82</p>
                <span className="text-xs opacity-90">155</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
