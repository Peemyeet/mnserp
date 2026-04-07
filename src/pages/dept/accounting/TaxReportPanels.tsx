import { Layers, Maximize2, MessageSquare } from "lucide-react";

const fmtBaht = (n: number) =>
  new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

function SortArrows() {
  return (
    <span className="ml-0.5 inline-flex flex-col text-[9px] leading-none text-slate-400">
      <span aria-hidden>▲</span>
      <span aria-hidden>▼</span>
    </span>
  );
}

function ExportCopyRow({
  searchId,
}: {
  searchId?: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-1.5">
        {(["Copy", "Excel", "CSV", "PDF"] as const).map((t) => (
          <button
            key={t}
            type="button"
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-600">Search:</span>
        <input
          id={searchId}
          type="search"
          className="rounded border border-slate-200 px-2 py-1.5 text-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 sm:w-56"
        />
      </div>
    </div>
  );
}

/** หัก ณ ที่จ่าย */
function WithholdingTaxPanel({
  onRequestFullscreen,
}: {
  onRequestFullscreen?: () => void;
}) {
  return (
    <div className="w-full max-w-[1680px] space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">หัก ณ ที่จ่าย</h2>
          <p className="text-sm text-slate-500">With Holding</p>
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
        <div className="flex items-center gap-2 rounded-t-xl bg-violet-600 px-4 py-3 text-white">
          <Layers className="h-5 w-5 shrink-0 opacity-95" aria-hidden />
          <span className="text-sm font-semibold">
            รายการ Exp( ทำหัก ณ ที่จ่ายแล้ว )
          </span>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <label className="flex max-w-xs flex-col gap-1 text-xs font-medium text-slate-600">
            <span>เลือกบริษัท</span>
            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition hover:border-slate-300 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200">
              <option>ทั้งหมด</option>
            </select>
          </label>

          <ExportCopyRow searchId="wht-search" />

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2.5">
                    # <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    เลขที่อ้างอิงเอกสาร <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    ประเภทการจ่าย <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    รายชื่อ <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    ร้านค้า <SortArrows />
                  </th>
                  <th className="px-3 py-2.5 text-right">
                    ราคา <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    วันครบกำหนด <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    ใบหัก ณ ที่จ่าย <SortArrows />
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-3 py-4 text-center text-slate-400" colSpan={8}>
                    —
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">Showing 1 to 1 of 1 entries</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400"
              >
                Previous
              </button>
              <span className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg bg-violet-600 px-2 text-xs font-semibold text-white">
                1
              </span>
              <button
                type="button"
                disabled
                className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** รายการภาษีขาย */
function SalesTaxPanel({
  onRequestFullscreen,
}: {
  onRequestFullscreen?: () => void;
}) {
  return (
    <div className="w-full max-w-[1680px] space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">รายการภาษีขาย</h2>
          <p className="text-sm text-slate-500">Tax sale</p>
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
        <div className="flex items-center gap-2 rounded-t-xl bg-violet-600 px-4 py-3 text-white">
          <MessageSquare className="h-5 w-5 shrink-0 opacity-95" aria-hidden />
          <span className="text-sm font-semibold">รายการ ภาษีขาย</span>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              <span>รหัสลูกหนี้</span>
              <input
                type="text"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              <span>ชื่อลูกหนี้</span>
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition hover:border-slate-300 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200">
                <option>ทั้งหมด</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              <span>ชื่อบริษัท</span>
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition hover:border-slate-300 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200">
                <option>ทั้งหมด</option>
              </select>
            </label>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                <span>เริ่มวันที่</span>
                <input
                  type="date"
                  defaultValue="2026-04-07"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                <span>สิ้นสุดวันที่</span>
                <input
                  type="date"
                  defaultValue="2026-04-07"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
              </label>
            </div>
            <button
              type="button"
              className="h-[42px] rounded-lg bg-red-500 px-8 text-sm font-bold text-white shadow-sm hover:bg-red-600 lg:ml-2"
            >
              GO
            </button>
          </div>

          <ExportCopyRow searchId="sales-tax-search" />

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-3 py-2.5">
                    # <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    บริษัท <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    TAX ID <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    เลขที่กำกับ <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    วันที่เปิดเอกสาร <SortArrows />
                  </th>
                  <th className="px-3 py-2.5 text-right">
                    ราคา <SortArrows />
                  </th>
                  <th className="px-3 py-2.5 text-right">
                    ภาษีขาย <SortArrows />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/80">
                  <td className="px-3 py-3 text-slate-700">1</td>
                  <td className="max-w-xs px-3 py-3 text-slate-800">
                    บริษัท สยาม มอดิฟายด์ สตาร์ช จำกัด (00001)
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-sm">
                    0105528024322
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono font-medium text-violet-600">
                    IVS063131
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">13/08/2021</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                    {fmtBaht(32000)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                    {fmtBaht(2240)}
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="px-3 py-3 text-slate-700">2</td>
                  <td className="max-w-xs px-3 py-3 text-slate-800">
                    Seagate Technology (Thailand) Ltd (สำนักงานใหญ่)
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-sm">
                    0105526042048
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono font-medium text-violet-600">
                    IVS063083
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">15/02/2021</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                    {fmtBaht(248000)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                    {fmtBaht(17360)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/** รายการภาษีซื้อ */
function PurchaseTaxPanel({
  onRequestFullscreen,
}: {
  onRequestFullscreen?: () => void;
}) {
  return (
    <div className="w-full max-w-[1680px] space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">รายการภาษีซื้อ</h2>
          <p className="text-sm text-slate-500">List Tax Purchase</p>
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
        <div className="flex items-center gap-2 rounded-t-xl bg-violet-600 px-4 py-3 text-white">
          <MessageSquare className="h-5 w-5 shrink-0 opacity-95" aria-hidden />
          <span className="text-sm font-semibold">รายการ ภาษีซื้อ</span>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              <span>รหัสเจ้าหนี้</span>
              <input
                type="text"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              <span>ชื่อเจ้าหนี้</span>
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition hover:border-slate-300 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200">
                <option>ทั้งหมด</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              <span>ชื่อบริษัท</span>
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition hover:border-slate-300 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200">
                <option>ทั้งหมด</option>
              </select>
            </label>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex flex-wrap gap-3">
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                <span>เริ่มวันที่</span>
                <input
                  type="date"
                  defaultValue="2026-04-07"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                <span>สิ้นสุดวันที่</span>
                <input
                  type="date"
                  defaultValue="2026-04-07"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
              </label>
            </div>
            <button
              type="button"
              className="h-[42px] rounded-lg bg-red-500 px-8 text-sm font-bold text-white shadow-sm hover:bg-red-600 lg:ml-2"
            >
              GO
            </button>
          </div>

          <ExportCopyRow searchId="purchase-tax-search" />

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-3 py-2.5">
                    # <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    บริษัท <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    TAX ID <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    เลขที่เอกสาร <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    วันที่เปิดเอกสาร <SortArrows />
                  </th>
                  <th className="px-3 py-2.5 text-right">
                    ก่อน VAT <SortArrows />
                  </th>
                  <th className="px-3 py-2.5 text-right">
                    VAT <SortArrows />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/80">
                  <td className="px-3 py-3 text-slate-700">1</td>
                  <td className="max-w-xs px-3 py-3 text-slate-800">
                    การไฟฟ้านครหลวง (สำนักงานใหญ่)
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-sm">
                    0994000165200
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono font-medium text-violet-600">
                    EXPM650054
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">02/05/2022</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                    {fmtBaht(21009.05)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                    {fmtBaht(1470.63)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export type TaxSubView = "withholding" | "sales" | "purchase";

export function TaxReportPanel({
  itemId,
  onRequestFullscreen,
}: {
  itemId: TaxSubView;
  onRequestFullscreen?: () => void;
}) {
  if (itemId === "sales") {
    return <SalesTaxPanel onRequestFullscreen={onRequestFullscreen} />;
  }
  if (itemId === "purchase") {
    return <PurchaseTaxPanel onRequestFullscreen={onRequestFullscreen} />;
  }
  return <WithholdingTaxPanel onRequestFullscreen={onRequestFullscreen} />;
}
