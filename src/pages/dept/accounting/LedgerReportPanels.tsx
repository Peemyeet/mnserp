import { useState } from "react";
import { Box, Maximize2, MessageCircle } from "lucide-react";

const journalBookOptions = [
  { value: "all", label: "ทั้งหมด" },
  { value: "purchase", label: "สมุดบัญชีซื้อ" },
  { value: "sales", label: "สมุดบัญชีขาย" },
  { value: "receipt", label: "สมุดบัญชีรับ" },
  { value: "payment", label: "สมุดบัญชีจ่าย" },
  { value: "general", label: "สมุดบัญชีทั่วไป" },
] as const;

function SortArrows() {
  return (
    <span className="ml-0.5 inline-flex flex-col text-[9px] leading-none text-slate-400">
      <span aria-hidden>▲</span>
      <span aria-hidden>▼</span>
    </span>
  );
}

/** รูปแรก — สรุปบัญชีรับ */
export function AccountsReceivableSummaryPanel() {
  return (
    <div className="w-full max-w-[1680px] space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">สรุปบัญชีรับ</h2>
        <p className="text-sm text-slate-500">Accounts Receivable Summary</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80 sm:p-5">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {(["Copy", "Excel", "CSV", "PDF"] as const).map((t) => (
              <button
                key={t}
                type="button"
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">Search:</span>
            <input
              type="search"
              className="rounded border border-slate-200 px-2 py-1.5 text-sm sm:w-56"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="whitespace-nowrap px-2 py-2.5">
                  เลขที่ใบส่งของ <SortArrows />
                </th>
                <th className="whitespace-nowrap px-2 py-2.5">
                  เลข JOB <SortArrows />
                </th>
                <th className="whitespace-nowrap px-2 py-2.5">
                  เลขที่ใบกำกับ <SortArrows />
                </th>
                <th className="whitespace-nowrap px-2 py-2.5">
                  เลขที่ใบวางบิล <SortArrows />
                </th>
                <th className="whitespace-nowrap px-2 py-2.5">
                  เลขที่ใบเสร็จ <SortArrows />
                </th>
                <th className="whitespace-nowrap px-2 py-2.5">
                  เลขที่ใบ PAY-IN <SortArrows />
                </th>
                <th className="whitespace-nowrap px-2 py-2.5">
                  ยืนยัน <SortArrows />
                </th>
                <th className="px-2 py-2.5 text-center">CHAT JOB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/80">
                <td className="whitespace-nowrap px-2 py-3 font-mono font-medium text-violet-600">
                  MNS-TS-6407013
                </td>
                <td className="whitespace-nowrap px-2 py-3 font-mono font-medium text-orange-600">
                  MNSGR64041449
                </td>
                <td className="whitespace-nowrap px-2 py-3 font-mono font-medium text-teal-600">
                  IVG063193
                </td>
                <td className="whitespace-nowrap px-2 py-3 font-mono font-medium text-violet-600">
                  IVG063193
                </td>
                <td className="whitespace-nowrap px-2 py-3 font-mono font-bold text-slate-900">
                  REG063116
                </td>
                <td className="whitespace-nowrap px-2 py-3 font-mono text-slate-600">
                  REG063116
                </td>
                <td className="whitespace-nowrap px-2 py-3 font-medium text-teal-600">
                  ยืนยันยอด 6760 บาท
                </td>
                <td className="px-2 py-3 text-center">
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-500 text-white shadow-sm hover:bg-teal-600"
                    aria-label="CHAT JOB"
                  >
                    <MessageCircle className="h-4 w-4" strokeWidth={2} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/** รูปสอง/สาม — สมุดบัญชี 5 เล่ม (Journal) */
export function JournalFiveBooksPanel({
  onRequestFullscreen,
}: {
  onRequestFullscreen?: () => void;
} = {}) {
  const [book, setBook] = useState<string>("all");

  return (
    <div className="w-full max-w-[1680px] space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
              <Box className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Journal</h2>
          </div>
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
            <label className="flex min-w-[12rem] flex-col gap-1 text-xs font-medium text-slate-600">
              <span>สมุดบัญชี</span>
              <select
                value={book}
                onChange={(e) => setBook(e.target.value)}
                className="rounded-lg border-2 border-violet-400 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
              >
                {journalBookOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-[8rem] flex-col gap-1 text-xs font-medium text-slate-600">
              <span>ปี</span>
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option>2026</option>
                <option>2025</option>
              </select>
            </label>
            <label className="flex min-w-[8rem] flex-col gap-1 text-xs font-medium text-slate-600">
              <span>เดือน</span>
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option>ทั้งหมด</option>
              </select>
            </label>
            {onRequestFullscreen ? (
              <button
                type="button"
                onClick={onRequestFullscreen}
                className="inline-flex items-center gap-1.5 self-end rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-800 hover:bg-violet-100 lg:ml-auto"
              >
                <Maximize2 className="h-3.5 w-3.5" aria-hidden />
                เต็มหน้าจอ
              </button>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-slate-500" aria-hidden />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">Search:</span>
              <input
                type="search"
                className="rounded border border-slate-200 px-2 py-1.5 text-sm sm:w-56"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <tr>
                  <th className="px-3 py-2.5">
                    # <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    Date <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    Number <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    Product Name <SortArrows />
                  </th>
                  <th className="px-3 py-2.5 text-right">
                    Debit <SortArrows />
                  </th>
                  <th className="px-3 py-2.5 text-right">
                    Credit <SortArrows />
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-4 text-center text-slate-400">—</td>
                  <td className="px-3 py-4 text-center text-slate-400">—</td>
                  <td className="px-3 py-4 text-center text-slate-400">—</td>
                  <td className="px-3 py-4 text-center text-slate-400">—</td>
                  <td className="px-3 py-4 text-center text-slate-400">—</td>
                  <td className="px-3 py-4 text-center text-slate-400">—</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-500">Showing 1 to 1 of 1 entries</p>
        </div>
      </div>
    </div>
  );
}

export type LedgerSubView = "income-summary" | "five-books";

export function LedgerReportPanel({
  itemId,
  onRequestFullscreen,
}: {
  itemId: LedgerSubView;
  onRequestFullscreen?: () => void;
}) {
  if (itemId === "income-summary") {
    return <AccountsReceivableSummaryPanel />;
  }
  return (
    <JournalFiveBooksPanel onRequestFullscreen={onRequestFullscreen} />
  );
}
