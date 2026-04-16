import { useMemo, useState, type ReactNode } from "react";
import { FileText, MessageCircle } from "lucide-react";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptSubPageHeader } from "../../components/dept/DeptSubPageHeader";
import { WarehouseExportToolbar } from "../../components/warehouse/WarehouseExportToolbar";
import type {
  BillNoteListRow,
  BillNotePendingInvoiceRow,
} from "../../data/accountingBillNoteSeed";

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

type TabKey = "outstanding" | "billNote";

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

export function AccountingBillNotePage() {
  const [tab, setTab] = useState<TabKey>("outstanding");
  const [search, setSearch] = useState("");

  const pendingRows: BillNotePendingInvoiceRow[] = [];
  const billRows: BillNoteListRow[] = [];

  const pendingPaged = usePaged(pendingRows, search, (r: BillNotePendingInvoiceRow) =>
    [
      r.invoiceNo,
      r.customer,
      r.poNo,
      r.company,
    ].join(" ")
  );

  const billPaged = usePaged(billRows, search, (r: BillNoteListRow) =>
    [r.billNo, r.customer, r.company, r.salesPerson].join(" ")
  );

  const pendingMatrix = {
    head: [
      "ลำดับ",
      "เลขที่ใบกำกับภาษี",
      "วันที่",
      "เลขที่ PO",
      "ชื่อลูกค้า",
      "วันครบกำหนด",
      "จำนวน",
      "ราคาหลังหักส่วนลด",
      "ภาษี",
      "รวมทั้งสิ้น",
      "บริษัท",
      "จัดการ",
    ],
    rows: pendingPaged.filtered.map((r, i) => [
      String(i + 1),
      r.invoiceNo,
      r.date,
      r.poNo,
      r.customer,
      r.dueDate,
      String(r.qty),
      r.priceAfterDisc,
      r.tax,
      r.grandTotal,
      r.company,
      "",
    ]),
  };

  const billMatrix = {
    head: [
      "ลำดับ",
      "เลขที่ใบวางบิล",
      "วันที่",
      "ชื่อลูกค้า",
      "วันครบกำหนด",
      "จำนวน",
      "รวมทั้งสิ้น",
      "บริษัท",
      "แนบไฟล์",
      "ไฟล์แนบ",
      "ฝ่ายขาย",
      "ยกเลิก",
    ],
    rows: billPaged.filtered.map((r, i) => [
      String(i + 1),
      r.billNo,
      r.date,
      r.customer,
      r.dueDate,
      String(r.qty),
      r.grandTotal,
      r.company,
      "",
      r.hasAttachment ? "ไฟล์แนบ" : "ไม่มีไฟล์แนบ",
      r.salesPerson,
      "",
    ]),
  };

  const activeMatrix = tab === "outstanding" ? pendingMatrix : billMatrix;
  const activeBasename =
    tab === "outstanding" ? "bill-note-pending-invoice" : "bill-note-list";

  const resetPages = () => {
    pendingPaged.setPage(1);
    billPaged.setPage(1);
  };

  return (
    <DeptPageFrame>
      <DeptSubPageHeader
        backTo="/dept/accounting"
        backLabel="แผนกบัญชี"
        titleTh="แผนกบัญชีรับ ใบวางบิล"
        titleEn="Accounting Bill Note"
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
              aria-selected={tab === "outstanding"}
              onClick={() => {
                setTab("outstanding");
                resetPages();
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                tab === "outstanding"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-white/80"
              }`}
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              รายการที่ค้างอยู่ (ใบกำกับภาษี)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "billNote"}
              onClick={() => {
                setTab("billNote");
                resetPages();
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                tab === "billNote"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-white/80"
              }`}
            >
              <FileText className="h-4 w-4 shrink-0" />
              ใบวางบิล
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80">
          <WarehouseExportToolbar
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              resetPages();
            }}
            matrixForExport={activeMatrix}
            exportBasename={activeBasename}
            extraEnd={
              tab === "outstanding" ? (
                <button
                  type="button"
                  className="w-full shrink-0 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-yellow-300 sm:w-auto"
                >
                  เปิดใบวางบิล
                </button>
              ) : undefined
            }
          />

          {tab === "outstanding" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] border-collapse text-sm">
                <thead>
                  <tr>
                    <Th>ลำดับ</Th>
                    <Th>เลขที่ใบกำกับภาษี</Th>
                    <Th>วันที่</Th>
                    <Th>เลขที่ PO</Th>
                    <Th>ชื่อลูกค้า</Th>
                    <Th>วันครบกำหนด</Th>
                    <Th className="text-right">จำนวน</Th>
                    <Th className="text-right">ราคาหลังหักส่วนลด</Th>
                    <Th className="text-right">ภาษี</Th>
                    <Th className="text-right">รวมทั้งสิ้น</Th>
                    <Th>บริษัท</Th>
                    <Th>จัดการ</Th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPaged.slice.map((r, idx) => (
                    <tr
                      key={r.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                    >
                      <td className="border-b border-slate-100 px-3 py-2.5 tabular-nums text-slate-700">
                        {pendingPaged.start + idx + 1}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-600">
                        {r.invoiceNo}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-600">
                        {r.date}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-600">
                        {r.poNo}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-800">
                        {r.customer}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-600">
                        {r.dueDate}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right tabular-nums">
                        {r.qty}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right tabular-nums">
                        {r.priceAfterDisc}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right tabular-nums">
                        {r.tax}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right font-medium tabular-nums">
                        {r.grandTotal}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-700">
                        {r.company}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        <button
                          type="button"
                          className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
                        >
                          จัดการ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-sm">
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
                    <Th>แนบไฟล์</Th>
                    <Th>ไฟล์แนบ</Th>
                    <Th>ฝ่ายขาย</Th>
                    <Th>ยกเลิก</Th>
                  </tr>
                </thead>
                <tbody>
                  {billPaged.slice.map((r, idx) => (
                    <tr
                      key={r.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                    >
                      <td className="border-b border-slate-100 px-3 py-2.5 tabular-nums">
                        {billPaged.start + idx + 1}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        <button
                          type="button"
                          className="font-semibold text-orange-600 hover:text-orange-800 hover:underline"
                        >
                          {r.billNo}
                        </button>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-700">
                        {r.date}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-800">
                        {r.customer}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-700">
                        {r.dueDate}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right tabular-nums">
                        {r.qty}
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
                          className="rounded-lg bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-800 ring-1 ring-violet-200 hover:bg-violet-200"
                        >
                          แนบไฟล์
                        </button>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                            r.hasAttachment
                              ? "bg-orange-100 text-orange-800 ring-1 ring-orange-200"
                              : "bg-red-50 text-red-600 ring-1 ring-red-100"
                          }`}
                        >
                          {r.hasAttachment ? "ไฟล์แนบ" : "ไม่มีไฟล์แนบ"}
                        </span>
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

          {tab === "outstanding" ? (
            <TableFooter
              from={
                pendingPaged.filtered.length === 0 ? 0 : pendingPaged.start + 1
              }
              to={pendingPaged.start + pendingPaged.slice.length}
              total={pendingPaged.filtered.length}
              page={pendingPaged.page}
              totalPages={pendingPaged.totalPages}
              setPage={pendingPaged.setPage}
            />
          ) : (
            <TableFooter
              from={
                billPaged.filtered.length === 0 ? 0 : billPaged.start + 1
              }
              to={billPaged.start + billPaged.slice.length}
              total={billPaged.filtered.length}
              page={billPaged.page}
              totalPages={billPaged.totalPages}
              setPage={billPaged.setPage}
            />
          )}
        </div>
      </div>
    </DeptPageFrame>
  );
}
