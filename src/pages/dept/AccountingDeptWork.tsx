import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptPageHeader } from "../../components/dept/DeptPageHeader";

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute right-3 top-3 flex h-7 min-w-[1.75rem] items-center justify-center rounded-full bg-white/90 px-2 text-xs font-bold text-slate-700 shadow-sm">
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

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="space-y-5">
          <div className="rounded-2xl bg-teal-50/90 px-4 py-4 text-sm font-semibold text-teal-900 shadow-sm ring-1 ring-teal-100/80">
            <div className="flex items-center gap-2">
              <ArrowDownRight className="h-5 w-5 shrink-0" />
              แผนกบัญชีฝ่ายรับ / Receiving Account
            </div>
            <p className="mt-2 text-xs font-normal text-teal-800/90">
              ภาพรวมฝ่ายรับแยกจากบัญชีจ่ายตามการ์ดด้านล่าง
            </p>
          </div>

          <Link
            to="/dept/accounting/invoice"
            className="relative block rounded-2xl bg-violet-100 p-4 pt-10 shadow-sm ring-1 ring-violet-200/70 no-underline transition hover:-translate-y-0.5 hover:ring-violet-400 hover:shadow-md"
          >
            <Badge n={2} />
            <p className="text-xs font-semibold text-violet-800">
              BILL INVOICE / ใบกำกับภาษี
            </p>
            <p className="mt-2 text-2xl font-bold text-violet-950">41,944.00</p>
          </Link>

          <Link
            to="/dept/accounting/bill-note"
            className="relative block rounded-2xl bg-orange-100 p-4 pt-10 shadow-sm ring-1 ring-orange-200/70 no-underline transition hover:-translate-y-0.5 hover:ring-orange-300 hover:shadow-md"
          >
            <Badge n={0} />
            <p className="text-xs font-semibold text-orange-900">
              BILL NOTE / ใบวางบิล
            </p>
            <p className="mt-2 text-2xl font-bold text-orange-950">0.00</p>
          </Link>

          <div className="relative rounded-2xl bg-violet-50 p-4 shadow-sm ring-1 ring-violet-100/90">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">
                ใบเสร็จรับเงิน
              </span>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold">
                8
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/dept/accounting/receipt?scope=not-due"
                className="block rounded-xl bg-teal-500 p-3 text-white no-underline transition hover:ring-2 hover:ring-white/40"
              >
                <p className="text-xs opacity-90">ยังไม่เลยกำหนด</p>
                <p className="mt-1 text-lg font-bold">978,545.00</p>
                <span className="mt-1 inline-block rounded-full bg-white/20 px-2 text-xs">
                  6
                </span>
              </Link>
              <Link
                to="/dept/accounting/receipt?scope=overdue"
                className="block rounded-xl bg-red-500 p-3 text-white no-underline transition hover:ring-2 hover:ring-white/40"
              >
                <p className="text-xs opacity-90">เลยกำหนด</p>
                <p className="mt-1 text-lg font-bold">149,425.50</p>
                <span className="mt-1 inline-block rounded-full bg-white/20 px-2 text-xs">
                  2
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-2 rounded-2xl bg-rose-50/90 px-4 py-4 text-sm font-semibold text-rose-900 shadow-sm ring-1 ring-rose-100/80">
            <ArrowUpRight className="h-5 w-5" />
            แผนกบัญชีฝ่ายจ่าย / Paying Account
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
            >
              เอกสารจากจัดหา / PO
            </button>
            <button
              type="button"
              className="relative rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
            >
              ตั้งเจ้าหนี้
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-violet-700">
                0
              </span>
            </button>
          </div>

          <div className="relative rounded-2xl bg-violet-100 p-4 pt-10 shadow-sm ring-1 ring-violet-200/70 transition hover:shadow-md">
            <Badge n={4} />
            <p className="text-xs font-semibold text-violet-800">
              CHECK / VERIFY / รอตรวจสอบ
            </p>
            <p className="mt-2 text-2xl font-bold text-violet-950">4,798.00</p>
          </div>

          <div className="relative rounded-2xl bg-violet-50 p-4 shadow-sm ring-1 ring-violet-100/90">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">
                รออนุมัติ
              </span>
              <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                212
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-orange-500 p-3 text-white">
                <p className="text-xs opacity-90">บริหาร</p>
                <p className="mt-1 text-sm font-bold leading-tight">
                  27,344,387.60
                </p>
                <span className="mt-1 inline-block rounded-full bg-white/20 px-2 text-xs">
                  207
                </span>
              </div>
              <div className="rounded-xl bg-violet-600 p-3 text-white">
                <p className="text-xs opacity-90">ผลิต</p>
                <p className="mt-1 text-lg font-bold">136,782.45</p>
                <span className="mt-1 inline-block rounded-full bg-white/20 px-2 text-xs">
                  5
                </span>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl bg-violet-50 p-4 shadow-sm ring-1 ring-violet-100/90">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800">
                ยังไม่ชำระ
              </span>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold">
                155
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-teal-500 p-3 text-sm text-white">
                <p className="text-xs opacity-90">รอชำระ</p>
                <p className="mt-1 font-bold">0.00</p>
                <span className="text-xs opacity-80">0</span>
              </div>
              <div className="rounded-xl bg-red-500 p-3 text-sm text-white">
                <p className="text-xs opacity-90">ยังไม่ชำระ</p>
                <p className="mt-1 font-bold">376,301.82</p>
                <span className="text-xs opacity-80">155</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DeptPageFrame>
  );
}
