import { useMemo, useState, type ReactNode } from "react";
import { Banknote, CheckCircle2, CircleDollarSign, Pencil, Trash2 } from "lucide-react";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptSubPageHeader } from "../../components/dept/DeptSubPageHeader";
import { WarehouseExportToolbar } from "../../components/warehouse/WarehouseExportToolbar";
import type {
  PayinConfirmRow,
  PayinDoneRow,
  PayinPendingRow,
} from "../../data/accountingPayinSeed";

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

type TabKey = "pending" | "confirm" | "done";

export function AccountingPayinPage() {
  const [tab, setTab] = useState<TabKey>("pending");
  const [search, setSearch] = useState("");

  const pendingRows: PayinPendingRow[] = [];
  const confirmRows: PayinConfirmRow[] = [];
  const doneRows: PayinDoneRow[] = [];

  const pendingPaged = usePaged(pendingRows, search, (r: PayinPendingRow) =>
    [r.receiptNo, r.customer, r.company, r.billNo, r.note].join(" ")
  );
  const confirmPaged = usePaged(confirmRows, search, (r: PayinConfirmRow) =>
    [r.payInNo, r.customer, r.company].join(" ")
  );
  const donePaged = usePaged(doneRows, search, (r: PayinDoneRow) =>
    [r.payInNo, r.customer, r.company].join(" ")
  );

  const pendingMatrix = {
    head: [
      "ลำดับ",
      "เลขที่ใบเสร็จรับเงิน",
      "วันที่",
      "ชื่อลูกค้า",
      "เลขที่ใบวาง",
      "วันครบกำหนด",
      "จำนวน",
      "ราคารวม",
      "ส่วนลดรวม",
      "ราคาหลังหักส่วนลด",
      "ภาษี",
      "รวมทั้งสิ้น",
      "บริษัท",
      "จัดการ",
      "หมายเหตุ",
    ],
    rows: pendingPaged.filtered.map((r, i) => [
      String(i + 1),
      r.receiptNo,
      r.date,
      r.customer,
      r.billNo,
      r.dueDate,
      String(r.qty),
      r.totalPrice,
      r.totalDiscount,
      r.priceAfterDisc,
      r.tax,
      r.grandTotal,
      r.company,
      "",
      r.note,
    ]),
  };

  const confirmMatrix = {
    head: [
      "ลำดับ",
      "เลขที่ใบ PAY IN",
      "วันที่",
      "ชื่อลูกค้า",
      "จำนวน",
      "ราคารวม",
      "ส่วนลดรวม",
      "ราคาหลังหักส่วนลด",
      "ภาษี",
      "รวมทั้งสิ้น",
      "บริษัท",
      "ยืนยันการรับเงิน",
      "จัดการ",
    ],
    rows: confirmPaged.filtered.map((r, i) => [
      String(i + 1),
      r.payInNo,
      r.date,
      r.customer,
      String(r.qty),
      r.totalPrice,
      r.totalDiscount,
      r.priceAfterDisc,
      r.tax,
      r.grandTotal,
      r.company,
      r.confirmed ? "ยืนยันแล้ว" : "—",
      "",
    ]),
  };

  const doneMatrix = {
    head: [
      "ลำดับ",
      "เลขที่ใบ PAY IN",
      "วันที่",
      "ชื่อลูกค้า",
      "จำนวน",
      "ราคารวม",
      "ส่วนลดรวม",
      "ราคาหลังหักส่วนลด",
      "ภาษี",
      "รวมทั้งสิ้น",
      "จำนวนเงินที่รับจริง",
      "บริษัท",
      "ไฟล์แบบหัก ณ ที่จ่าย",
      "แนบไฟล์",
    ],
    rows: donePaged.filtered.map((r, i) => [
      String(i + 1),
      r.payInNo,
      r.date,
      r.customer,
      String(r.qty),
      r.totalPrice,
      r.totalDiscount,
      r.priceAfterDisc,
      r.tax,
      r.grandTotal,
      r.actualReceived,
      r.company,
      r.withholdingFile,
      "",
    ]),
  };

  const activeMatrix =
    tab === "pending" ? pendingMatrix : tab === "confirm" ? confirmMatrix : doneMatrix;
  const activeBasename =
    tab === "pending"
      ? "payin-pending-receipts"
      : tab === "confirm"
        ? "payin-confirmation"
        : "payin-completed";

  const resetPages = () => {
    pendingPaged.setPage(1);
    confirmPaged.setPage(1);
    donePaged.setPage(1);
  };

  return (
    <DeptPageFrame>
      <DeptSubPageHeader
        backTo="/dept/accounting"
        backLabel="แผนกบัญชี"
        titleTh="แผนกบัญชีรับ ใบยืนยันการรับเงิน"
        titleEn="Accounting Bill Payin"
      />

      <div className="space-y-4">
        <div
          className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100/90 p-1 ring-1 ring-slate-200/80"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "pending"}
            onClick={() => {
              setTab("pending");
              resetPages();
            }}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition sm:px-4 ${
              tab === "pending"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-white/80"
            }`}
          >
            <Banknote className="h-4 w-4 shrink-0" aria-hidden />
            รายการที่ค้างอยู่ (ใบเสร็จรับเงิน)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "confirm"}
            onClick={() => {
              setTab("confirm");
              resetPages();
            }}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition sm:px-4 ${
              tab === "confirm"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-white/80"
            }`}
          >
            <CircleDollarSign className="h-4 w-4 shrink-0" />
            ใบยืนยันการรับเงิน
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "done"}
            onClick={() => {
              setTab("done");
              resetPages();
            }}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition sm:px-4 ${
              tab === "done"
                ? "bg-violet-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-white/80"
            }`}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            รับเงินเรียบร้อย
          </button>
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
              tab === "pending" ? (
                <button
                  type="button"
                  className="w-full shrink-0 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-yellow-300 sm:w-auto"
                >
                  เปิดใบ Pay-In
                </button>
              ) : undefined
            }
          />

          {tab === "pending" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1400px] border-collapse text-sm">
                <thead>
                  <tr>
                    <Th>ลำดับ</Th>
                    <Th>เลขที่ใบเสร็จรับเงิน</Th>
                    <Th>วันที่</Th>
                    <Th>ชื่อลูกค้า</Th>
                    <Th>เลขที่ใบวาง</Th>
                    <Th>วันครบกำหนด</Th>
                    <Th className="text-right">จำนวน</Th>
                    <Th className="text-right">ราคารวม</Th>
                    <Th className="text-right">ส่วนลดรวม</Th>
                    <Th className="text-right">ราคาหลังหักส่วนลด</Th>
                    <Th className="text-right">ภาษี</Th>
                    <Th className="text-right">รวมทั้งสิ้น</Th>
                    <Th>บริษัท</Th>
                    <Th>จัดการ</Th>
                    <Th>หมายเหตุ</Th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPaged.slice.map((r, idx) => (
                    <tr
                      key={r.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                    >
                      <td className="border-b border-slate-100 px-3 py-2.5 tabular-nums">
                        {pendingPaged.start + idx + 1}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        {r.receiptNo === "—" ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          <button
                            type="button"
                            className="font-semibold text-yellow-600 hover:underline"
                          >
                            {r.receiptNo}
                          </button>
                        )}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-600">
                        {r.date}
                      </td>
                      <td className="max-w-[220px] border-b border-slate-100 px-3 py-2.5 text-slate-800">
                        {r.customer}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        {r.billNo}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-600">
                        {r.dueDate}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right tabular-nums">
                        {r.qty || "—"}
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
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right font-semibold tabular-nums">
                        {r.grandTotal}
                      </td>
                      <td className="max-w-[200px] border-b border-slate-100 px-3 py-2.5 text-slate-700">
                        {r.company}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                            aria-label="แก้ไข"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 p-1.5 text-red-600 hover:bg-red-50"
                            aria-label="ลบ"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        <input
                          type="text"
                          defaultValue={r.note}
                          className="w-full min-w-[80px] rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                          placeholder="—"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "confirm" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] border-collapse text-sm">
                <thead>
                  <tr>
                    <Th>ลำดับ</Th>
                    <Th>เลขที่ใบ PAY IN</Th>
                    <Th>วันที่</Th>
                    <Th>ชื่อลูกค้า</Th>
                    <Th className="text-right">จำนวน</Th>
                    <Th className="text-right">ราคารวม</Th>
                    <Th className="text-right">ส่วนลดรวม</Th>
                    <Th className="text-right">ราคาหลังหักส่วนลด</Th>
                    <Th className="text-right">ภาษี</Th>
                    <Th className="text-right">รวมทั้งสิ้น</Th>
                    <Th>บริษัท</Th>
                    <Th>ยืนยันการรับเงิน</Th>
                    <Th>จัดการ</Th>
                  </tr>
                </thead>
                <tbody>
                  {confirmPaged.slice.map((r, idx) => (
                    <tr
                      key={r.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                    >
                      <td className="border-b border-slate-100 px-3 py-2.5 tabular-nums">
                        {confirmPaged.start + idx + 1}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 font-medium text-slate-800">
                        {r.payInNo}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-600">
                        {r.date}
                      </td>
                      <td className="max-w-[220px] border-b border-slate-100 px-3 py-2.5 text-slate-800">
                        {r.customer}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right tabular-nums">
                        {r.qty || "—"}
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
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right font-semibold tabular-nums">
                        {r.grandTotal}
                      </td>
                      <td className="max-w-[200px] border-b border-slate-100 px-3 py-2.5 text-slate-700">
                        {r.company}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        <button
                          type="button"
                          className="rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-600"
                        >
                          ยืนยันการรับเงิน
                        </button>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                            aria-label="แก้ไข"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 p-1.5 text-red-600 hover:bg-red-50"
                            aria-label="ลบ"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "done" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1300px] border-collapse text-sm">
                <thead>
                  <tr>
                    <Th>ลำดับ</Th>
                    <Th>เลขที่ใบ PAY IN</Th>
                    <Th>วันที่</Th>
                    <Th>ชื่อลูกค้า</Th>
                    <Th className="text-right">จำนวน</Th>
                    <Th className="text-right">ราคารวม</Th>
                    <Th className="text-right">ส่วนลดรวม</Th>
                    <Th className="text-right">ราคาหลังหักส่วนลด</Th>
                    <Th className="text-right">ภาษี</Th>
                    <Th className="text-right">รวมทั้งสิ้น</Th>
                    <Th className="text-right">จำนวนเงินที่รับจริง</Th>
                    <Th>บริษัท</Th>
                    <Th>ไฟล์แบบหัก ณ ที่จ่าย</Th>
                    <Th>แนบไฟล์</Th>
                  </tr>
                </thead>
                <tbody>
                  {donePaged.slice.map((r, idx) => (
                    <tr
                      key={r.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                    >
                      <td className="border-b border-slate-100 px-3 py-2.5 tabular-nums">
                        {donePaged.start + idx + 1}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        <button
                          type="button"
                          className="font-semibold text-violet-700 hover:underline"
                        >
                          {r.payInNo}
                        </button>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-600">
                        {r.date}
                      </td>
                      <td className="max-w-[240px] border-b border-slate-100 px-3 py-2.5 text-slate-800">
                        {r.customer}
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
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right font-semibold tabular-nums">
                        {r.grandTotal}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right font-medium tabular-nums text-emerald-800">
                        {r.actualReceived}
                      </td>
                      <td className="max-w-[200px] border-b border-slate-100 px-3 py-2.5 text-slate-700">
                        {r.company}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-sm text-slate-600">
                        {r.withholdingFile}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        <button
                          type="button"
                          className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
                        >
                          แนบไฟล์
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "pending" && (
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
          )}
          {tab === "confirm" && (
            <TableFooter
              from={
                confirmPaged.filtered.length === 0 ? 0 : confirmPaged.start + 1
              }
              to={confirmPaged.start + confirmPaged.slice.length}
              total={confirmPaged.filtered.length}
              page={confirmPaged.page}
              totalPages={confirmPaged.totalPages}
              setPage={confirmPaged.setPage}
            />
          )}
          {tab === "done" && (
            <TableFooter
              from={donePaged.filtered.length === 0 ? 0 : donePaged.start + 1}
              to={donePaged.start + donePaged.slice.length}
              total={donePaged.filtered.length}
              page={donePaged.page}
              totalPages={donePaged.totalPages}
              setPage={donePaged.setPage}
            />
          )}
        </div>
      </div>
    </DeptPageFrame>
  );
}
