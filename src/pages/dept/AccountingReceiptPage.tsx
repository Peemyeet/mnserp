import { useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { Banknote, FileSpreadsheet } from "lucide-react";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptSubPageHeader } from "../../components/dept/DeptSubPageHeader";
import { WarehouseExportToolbar } from "../../components/warehouse/WarehouseExportToolbar";
import type {
  BilledWaitingReceiptRow,
  CashReceiptRow,
} from "../../data/accountingReceiptSeed";

const PAGE = 10;

function usePaged<T>(list: T[], search: string, getBlob: (row: T) => string) {
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => getBlob(r).toLowerCase().includes(q));
  }, [list, search, getBlob]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const safe = Math.min(page, totalPages);
  const start = (safe - 1) * PAGE;
  const slice = filtered.slice(start, start + PAGE);
  return { filtered, slice, page: safe, totalPages, setPage, start };
}

function TableFooter({
  from,
  to,
  total,
  page,
  totalPages,
  setPage,
}: {
  from: number;
  to: number;
  total: number;
  page: number;
  totalPages: number;
  setPage: (n: number | ((p: number) => number)) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
      <span>
        {total === 0
          ? "Showing 0 to 0 of 0 entries"
          : `Showing ${from} to ${to} of ${total} entries`}
      </span>
      <div className="flex gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="rounded border border-slate-200 px-3 py-1 disabled:opacity-40"
        >
          Previous
        </button>
        <span className="flex items-center rounded bg-violet-600 px-3 py-1 text-white">
          {page}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="rounded border border-slate-200 px-3 py-1 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

type TabKey = "billed" | "receipt";

function Th({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={`whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-3 text-left text-xs font-semibold text-slate-600 ${className}`}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <span className="text-[10px] text-slate-400" aria-hidden>
          ↕
        </span>
      </span>
    </th>
  );
}

const MONTHS = [
  { v: "01", label: "01" },
  { v: "02", label: "02" },
  { v: "03", label: "03" },
  { v: "04", label: "04" },
  { v: "05", label: "05" },
  { v: "06", label: "06" },
  { v: "07", label: "07" },
  { v: "08", label: "08" },
  { v: "09", label: "09" },
  { v: "10", label: "10" },
  { v: "11", label: "11" },
  { v: "12", label: "12" },
];

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function AccountingReceiptPage() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<TabKey>("billed");
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("2026");
  const [month, setMonth] = useState("03");
  const [scope, setScope] = useState(() => {
    const s = searchParams.get("scope");
    if (s === "not-due") return "not-due";
    if (s === "overdue") return "overdue";
    return "all";
  });
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  const billedRowsAll: BilledWaitingReceiptRow[] = [];

  const billedRows = useMemo(() => {
    const t = todayIsoDate();
    if (scope === "all") return billedRowsAll;
    if (scope === "not-due") {
      return billedRowsAll.filter(
        (r) => !r.dueDate || r.dueDate === "0000-00-00" || r.dueDate >= t
      );
    }
    return billedRowsAll.filter(
      (r) => r.dueDate && r.dueDate !== "0000-00-00" && r.dueDate < t
    );
  }, [billedRowsAll, scope]);

  const receiptRows: CashReceiptRow[] = [];

  const billedPaged = usePaged(billedRows, search, (r: BilledWaitingReceiptRow) =>
    [r.billNo, r.customer, r.company, r.remark].join(" ")
  );

  const receiptPaged = usePaged(receiptRows, search, (r: CashReceiptRow) =>
    [
      r.receiptNo,
      r.billNoteNo,
      r.customer,
      r.company,
      r.salesPerson,
    ].join(" ")
  );

  const billedMatrix = {
    head: [
      "ลำดับ",
      "เลขที่ใบวางบิล",
      "วันที่",
      "ชื่อลูกค้า",
      "วันครบกำหนด",
      "จำนวน",
      "รวมทั้งสิ้น",
      "บริษัท",
      "หมายเหตุ",
    ],
    rows: billedPaged.filtered.map((r, i) => [
      String(i + 1),
      r.billNo,
      r.date,
      r.customer,
      r.dueDate,
      String(r.qty),
      r.grandTotal,
      r.company,
      r.remark,
    ]),
  };

  const receiptMatrix = {
    head: [
      "ลำดับ",
      "เลขที่ใบเสร็จรับเงิน",
      "วันที่",
      "ชื่อลูกค้า",
      "เลขที่ใบวางบิล",
      "วันที่ครบกำหนด",
      "จำนวน",
      "ราคารวม",
      "ส่วนลดรวม",
      "ราคาหลังหักส่วนลด",
      "ภาษี",
      "รวมทั้งสิ้น",
      "บริษัท",
      "ฝ่ายขาย",
    ],
    rows: receiptPaged.filtered.map((r, i) => [
      String(i + 1),
      r.receiptNo,
      r.date,
      r.customer,
      r.billNoteNo,
      r.dueDate,
      String(r.qty),
      r.totalPrice,
      r.totalDiscount,
      r.priceAfterDisc,
      r.tax,
      r.grandTotal,
      r.company,
      r.salesPerson,
    ]),
  };

  const activeMatrix = tab === "billed" ? billedMatrix : receiptMatrix;
  const activeBasename =
    tab === "billed" ? "receipt-billed-waiting" : "cash-receipt-list";

  const resetPages = () => {
    billedPaged.setPage(1);
    receiptPaged.setPage(1);
  };

  return (
    <DeptPageFrame>
      <DeptSubPageHeader
        backTo="/dept/accounting"
        backLabel="แผนกบัญชี"
        titleTh="แผนกบัญชีรับ ใบเสร็จรับเงิน"
        titleEn="Accounting Bill Receive"
      />

      <div className="space-y-4">
        <div>
          <div
            className="inline-flex rounded-xl bg-slate-100/90 p-1 ring-1 ring-slate-200/80"
            role="tablist"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "billed"}
              onClick={() => {
                setTab("billed");
                resetPages();
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                tab === "billed"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-white/80"
              }`}
            >
              <FileSpreadsheet className="h-4 w-4 shrink-0" />
              วางบิลแล้ว (รอเก็บเงิน)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "receipt"}
              onClick={() => {
                setTab("receipt");
                resetPages();
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                tab === "receipt"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-white/80"
              }`}
            >
              <Banknote className="h-4 w-4 shrink-0" />
              ใบเสร็จรับเงิน
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80">
          {tab === "receipt" && (
            <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 px-4 py-3">
              <label className="text-sm text-slate-600">
                <span className="mb-1 block font-medium">ปี:</span>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  {["2024", "2025", "2026", "2027"].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-slate-600">
                <span className="mb-1 block font-medium">เดือน:</span>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  {MONTHS.map((m) => (
                    <option key={m.v} value={m.v}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
              >
                GO
              </button>
            </div>
          )}

          {tab === "billed" && (
            <div className="border-b border-slate-100 px-4 py-3">
              <label className="text-sm text-slate-600">
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="not-due">ยังไม่เลยกำหนด</option>
                  <option value="overdue">เลยกำหนด</option>
                </select>
              </label>
            </div>
          )}

          <WarehouseExportToolbar
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              resetPages();
            }}
            matrixForExport={activeMatrix}
            exportBasename={activeBasename}
            extraEnd={
              tab === "billed" ? (
                <button
                  type="button"
                  className="w-full shrink-0 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-yellow-300 sm:w-auto"
                >
                  เปิดใบเสร็จรับเงิน
                </button>
              ) : undefined
            }
          />

          {tab === "billed" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse text-sm">
                <thead>
                  <tr>
                    <Th>ลำดับ</Th>
                    <Th>เลขที่ใบวางบิล</Th>
                    <Th>วันที่</Th>
                    <Th>ชื่อลูกค้า</Th>
                    <Th>วันครบกำหนด</Th>
                    <Th className="text-right">จำนวน</Th>
                    <Th className="text-right">รวมทั้งสิ้น</Th>
                    <Th>บริษัท</Th>
                    <Th>ไฟล์แนบ</Th>
                    <Th>หมายเหตุ</Th>
                  </tr>
                </thead>
                <tbody>
                  {billedPaged.slice.map((r, idx) => (
                    <tr
                      key={r.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                    >
                      <td className="border-b border-slate-100 px-3 py-2.5 tabular-nums">
                        {billedPaged.start + idx + 1}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        <button
                          type="button"
                          className="font-semibold text-yellow-600 hover:text-yellow-800 hover:underline"
                        >
                          {r.billNo}
                        </button>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-700">
                        {r.date}
                      </td>
                      <td className="max-w-[240px] border-b border-slate-100 px-3 py-2.5 text-slate-800">
                        {r.customer}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-700">
                        {r.dueDate}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right tabular-nums">
                        {r.qty}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right font-semibold tabular-nums">
                        {r.grandTotal}
                      </td>
                      <td className="max-w-[200px] border-b border-slate-100 px-3 py-2.5 text-slate-700">
                        {r.company}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        <button
                          type="button"
                          className="rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-yellow-300"
                        >
                          ไฟล์แนบ
                        </button>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        <input
                          type="text"
                          value={remarks[r.id] ?? ""}
                          onChange={(e) =>
                            setRemarks((m) => ({ ...m, [r.id]: e.target.value }))
                          }
                          className="w-full min-w-[100px] rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                          placeholder="—"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1400px] border-collapse text-sm">
                <thead>
                  <tr>
                    <Th>ลำดับ</Th>
                    <Th>เลขที่ใบเสร็จรับเงิน</Th>
                    <Th>วันที่</Th>
                    <Th>ชื่อลูกค้า</Th>
                    <Th>เลขที่ใบวางบิล</Th>
                    <Th>วันที่ครบกำหนด</Th>
                    <Th className="text-right">จำนวน</Th>
                    <Th className="text-right">ราคารวม</Th>
                    <Th className="text-right">ส่วนลดรวม</Th>
                    <Th className="text-right">ราคาหลังหักส่วนลด</Th>
                    <Th className="text-right">ภาษี</Th>
                    <Th className="text-right">รวมทั้งสิ้น</Th>
                    <Th>บริษัท</Th>
                    <Th>แนบไฟล์</Th>
                    <Th>ไฟล์แนบ</Th>
                    <Th>ฝ่ายขาย</Th>
                    <Th>ยกเลิก</Th>
                  </tr>
                </thead>
                <tbody>
                  {receiptPaged.slice.map((r, idx) => (
                    <tr
                      key={r.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                    >
                      <td className="border-b border-slate-100 px-3 py-2.5 tabular-nums">
                        {receiptPaged.start + idx + 1}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        <button
                          type="button"
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {r.receiptNo}
                        </button>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-700">
                        {r.date}
                      </td>
                      <td className="max-w-[220px] border-b border-slate-100 px-3 py-2.5 text-slate-800">
                        {r.customer}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        <button
                          type="button"
                          className="font-semibold text-yellow-600 hover:text-yellow-800 hover:underline"
                        >
                          {r.billNoteNo}
                        </button>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-700">
                        {r.dueDate}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right tabular-nums">
                        {r.qty}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right tabular-nums">
                        {r.totalPrice}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right tabular-nums">
                        {r.totalDiscount}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right tabular-nums">
                        {r.priceAfterDisc}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right tabular-nums">
                        {r.tax}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right font-semibold tabular-nums text-slate-900">
                        {r.grandTotal}
                      </td>
                      <td className="max-w-[200px] border-b border-slate-100 px-3 py-2.5 text-slate-700">
                        {r.company}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        <button
                          type="button"
                          className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
                        >
                          แนบไฟล์
                        </button>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        <div className="flex flex-col gap-1">
                          <span
                            className="inline-flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-400"
                            aria-hidden
                          >
                            □
                          </span>
                          {!r.hasAttachment && (
                            <span className="text-xs font-medium text-red-600">
                              ไม่มีไฟล์แนบ
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-700">
                        {r.salesPerson}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        <button
                          type="button"
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          ยกเลิก
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "billed" ? (
            <TableFooter
              from={
                billedPaged.filtered.length === 0 ? 0 : billedPaged.start + 1
              }
              to={billedPaged.start + billedPaged.slice.length}
              total={billedPaged.filtered.length}
              page={billedPaged.page}
              totalPages={billedPaged.totalPages}
              setPage={billedPaged.setPage}
            />
          ) : (
            <TableFooter
              from={
                receiptPaged.filtered.length === 0 ? 0 : receiptPaged.start + 1
              }
              to={receiptPaged.start + receiptPaged.slice.length}
              total={receiptPaged.filtered.length}
              page={receiptPaged.page}
              totalPages={receiptPaged.totalPages}
              setPage={receiptPaged.setPage}
            />
          )}
        </div>
      </div>
    </DeptPageFrame>
  );
}
