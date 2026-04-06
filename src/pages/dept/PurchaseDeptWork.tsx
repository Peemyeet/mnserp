import {
  FileText,
  Package,
  ShoppingBasket,
  Wallet,
} from "lucide-react";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptPageHeader } from "../../components/dept/DeptPageHeader";
import { PurchaseDeptSettingsMenu } from "../../components/dept/PurchaseDeptSettingsMenu";

/** ตัวอย่าง — ต่อ API จริงได้ภายหลัง */
const COUNTS = {
  storefront: { hasPo: 0, noPo: 0 },
  openPo: { normal: 0, express: 0, urgent: 0 },
  overdue: { prod: 0, repair: 0, dev: 0, tools: 0 },
  waiting: { normal: 0, express: 0, urgent: 4 },
};

function CornerTotal({ n, className }: { n: number; className: string }) {
  return (
    <span
      className={`absolute right-3 top-3 flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-bold text-white shadow ${className}`}
    >
      {n}
    </span>
  );
}

function BadgeOnButton({ n }: { n: number }) {
  return (
    <span className="absolute right-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-white/90 px-1.5 text-xs font-bold text-slate-800 shadow-sm ring-1 ring-black/5">
      {n}
    </span>
  );
}

export function PurchaseDeptWork() {
  const sf = COUNTS.storefront;
  const sfTotal = sf.hasPo + sf.noPo;
  const po = COUNTS.openPo;
  const poTotal = po.normal + po.express + po.urgent;
  const od = COUNTS.overdue;
  const odTotal = od.prod + od.repair + od.dev + od.tools;
  const w = COUNTS.waiting;
  const wTotal = w.normal + w.express + w.urgent;

  return (
    <DeptPageFrame>
      <DeptPageHeader
        deptId="purchase"
        titleTh="จัดหา"
        titleEn="Purchase Department"
        workPath="/dept/purchase/work"
        reportPath="/dept/purchase/report"
        extraAction={<PurchaseDeptSettingsMenu />}
      />

      <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
        {/* หน้าร้านค้า */}
        <section className="relative overflow-hidden rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-100/90 via-violet-50 to-white p-5 shadow-sm ring-1 ring-violet-100/60">
          <div
            className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-violet-200/40 blur-2xl"
            aria-hidden
          />
          <CornerTotal n={sfTotal} className="bg-violet-600" />
          <div className="mb-4 flex items-center gap-3 pr-14">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500 text-white shadow-md">
              <ShoppingBasket className="h-6 w-6" aria-hidden />
            </span>
            <h2 className="text-lg font-bold text-slate-900">หน้าร้านค้า</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="relative rounded-xl bg-teal-500 py-6 text-center text-sm font-bold text-white shadow-md transition hover:bg-teal-600"
            >
              <BadgeOnButton n={sf.hasPo} />
              มี PO
            </button>
            <button
              type="button"
              className="relative rounded-xl bg-red-500 py-6 text-center text-sm font-bold text-white shadow-md transition hover:bg-red-600"
            >
              <BadgeOnButton n={sf.noPo} />
              ไม่มี PO
            </button>
          </div>
        </section>

        {/* เปิดใบสั่งซื้อ */}
        <section className="relative overflow-hidden rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-100/90 via-cyan-50/80 to-white p-5 shadow-sm ring-1 ring-teal-100/60">
          <div
            className="pointer-events-none absolute -right-6 -top-10 h-36 w-36 rounded-full bg-teal-200/35 blur-2xl"
            aria-hidden
          />
          <CornerTotal n={poTotal} className="bg-teal-600" />
          <div className="mb-4 flex items-center gap-3 pr-14">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500 text-white shadow-md">
              <FileText className="h-6 w-6" aria-hidden />
            </span>
            <h2 className="text-lg font-bold text-slate-900">เปิดใบสั่งซื้อ</h2>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { k: "normal" as const, label: "Normal (1 - 7 Days)" },
              { k: "express" as const, label: "Express (8 - 15 Days)" },
              { k: "urgent" as const, label: "Urgent (16+ Days)" },
            ].map(({ k, label }) => (
              <button
                key={k}
                type="button"
                className="flex items-center justify-between rounded-xl bg-sky-100/90 px-4 py-3 text-left text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-sky-200/60 transition hover:bg-sky-100"
              >
                <span>{label}</span>
                <span className="tabular-nums text-slate-600">{po[k]}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ค้างชำระเงิน */}
        <section className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-100/90 via-yellow-50 to-white p-5 shadow-sm ring-1 ring-amber-100/60">
          <div
            className="pointer-events-none absolute -right-8 -bottom-8 h-36 w-36 rounded-full bg-amber-200/35 blur-2xl"
            aria-hidden
          />
          <CornerTotal n={odTotal} className="bg-amber-500" />
          <div className="mb-4 flex items-center gap-3 pr-14">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
              <Wallet className="h-6 w-6" aria-hidden />
            </span>
            <h2 className="text-lg font-bold text-slate-900">ค้างชำระเงิน</h2>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              className="rounded-xl bg-teal-500 py-4 text-center text-xs font-bold leading-tight text-white shadow-md hover:bg-teal-600 sm:text-sm"
            >
              ผลิต
              <br />
              <span className="tabular-nums text-[0.95em] opacity-95">
                {od.prod.toFixed(2)}
              </span>
            </button>
            <button
              type="button"
              className="rounded-xl bg-orange-500 py-4 text-center text-xs font-bold leading-tight text-white shadow-md hover:bg-orange-600 sm:text-sm"
            >
              ซ่อม
              <br />
              <span className="tabular-nums text-[0.95em] opacity-95">
                {od.repair.toFixed(2)}
              </span>
            </button>
            <button
              type="button"
              className="rounded-xl bg-red-500 py-4 text-center text-xs font-bold leading-tight text-white shadow-md hover:bg-red-600 sm:text-sm"
            >
              พัฒนา
              <br />
              <span className="tabular-nums text-[0.95em] opacity-95">
                {od.dev.toFixed(2)}
              </span>
            </button>
            <button
              type="button"
              className="rounded-xl bg-violet-600 py-4 text-center text-xs font-bold leading-tight text-white shadow-md hover:bg-violet-700 sm:text-sm"
            >
              เครื่องมือ
              <br />
              <span className="tabular-nums text-[0.95em] opacity-95">
                {od.tools.toFixed(2)}
              </span>
            </button>
          </div>
        </section>

        {/* รอรับของ */}
        <section className="relative overflow-hidden rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-100/90 via-pink-50 to-white p-5 shadow-sm ring-1 ring-rose-100/60">
          <div
            className="pointer-events-none absolute -left-6 -top-8 h-32 w-32 rounded-full bg-rose-200/40 blur-2xl"
            aria-hidden
          />
          <CornerTotal n={wTotal} className="bg-rose-600" />
          <div className="mb-4 flex items-center gap-3 pr-14">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md">
              <Package className="h-6 w-6" aria-hidden />
            </span>
            <h2 className="text-lg font-bold text-slate-900">รอรับของ</h2>
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="flex items-center justify-between rounded-xl bg-teal-500 px-4 py-3 text-left text-sm font-semibold text-white shadow-md hover:bg-teal-600"
            >
              <span>Normal (1 - 7 Days)</span>
              <span className="tabular-nums">{w.normal}</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-between rounded-xl bg-orange-500 px-4 py-3 text-left text-sm font-semibold text-white shadow-md hover:bg-orange-600"
            >
              <span>Express (8 - 15 Days)</span>
              <span className="tabular-nums">{w.express}</span>
            </button>
            <button
              type="button"
              className="flex items-center justify-between rounded-xl bg-red-500 px-4 py-3 text-left text-sm font-semibold text-white shadow-md hover:bg-red-600"
            >
              <span>Urgent (16+ Days)</span>
              <span className="tabular-nums">{w.urgent}</span>
            </button>
          </div>
        </section>
      </div>
    </DeptPageFrame>
  );
}
