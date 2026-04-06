import { useMemo, useState, type ReactNode } from "react";
import { Layers, MessageCircle } from "lucide-react";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptSubPageHeader } from "../../components/dept/DeptSubPageHeader";
import { WarehouseExportToolbar } from "../../components/warehouse/WarehouseExportToolbar";
import {
  DELIVERY_PENDING_SAMPLE,
  TAX_INVOICE_SAMPLE,
  type DeliveryPendingRow,
  type TaxInvoiceRow,
} from "../../data/accountingTaxInvoiceSeed";

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

type TabKey = "delivery" | "invoice";

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

export function AccountingTaxInvoicePage() {
  const [tab, setTab] = useState<TabKey>("delivery");
  const [search, setSearch] = useState("");
  const [remarks, setRemarks] = useState<Record<string, string>>(() =>
    Object.fromEntries(DELIVERY_PENDING_SAMPLE.map((r) => [r.id, r.remark]))
  );

  const taxRows = TAX_INVOICE_SAMPLE;
  const deliveryRows = useMemo(
    () =>
      DELIVERY_PENDING_SAMPLE.map((r) => ({
        ...r,
        remark: remarks[r.id] ?? r.remark,
      })),
    [remarks]
  );

  const taxPaged = usePaged(taxRows, search, (r: TaxInvoiceRow) =>
    [
      r.invoiceNo,
      r.customer,
      r.poNo,
      r.company,
      r.salesPerson,
    ].join(" ")
  );

  const deliveryPaged = usePaged(deliveryRows, search, (r: DeliveryPendingRow) =>
    [
      r.deliveryNo,
      r.serviceNo,
      r.company,
      r.poNo,
      r.salesPerson,
      r.remark,
    ].join(" ")
  );

  const taxMatrix = {
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
      "แนบไฟล์",
      "ฝ่ายขาย",
    ],
    rows: taxPaged.filtered.map((r, i) => [
      String(i + 1),
      r.invoiceNo,
      r.date,
      r.poNo || "-",
      r.customer,
      r.dueDate,
      String(r.qty),
      r.priceAfterDisc,
      r.tax,
      r.grandTotal,
      r.company,
      r.hasAttachment ? "มีไฟล์แนบ" : "ไม่มีไฟล์แนบ",
      r.salesPerson,
    ]),
  };

  const deliveryMatrix = {
    head: [
      "#",
      "COUNT วัน",
      "เลขที่ใบส่งของ",
      "เลขที่ PO",
      "เลขที่บริการ",
      "บริษัท",
      "จำนวน",
      "วันที่ส่งของ",
      "ราคารวม",
      "ภาษี",
      "รวมทั้งสิ้น",
      "หมายเหตุ",
      "ฝ่ายขาย",
    ],
    rows: deliveryPaged.filtered.map((r, i) => [
      String(i + 1),
      r.dayStatus,
      r.deliveryNo,
      r.poNo || "-",
      r.serviceNo,
      r.company,
      String(r.qty),
      r.deliveryDate,
      r.totalPrice,
      r.tax,
      r.grandTotal,
      r.remark,
      r.salesPerson,
    ]),
  };

  const activeMatrix = tab === "invoice" ? taxMatrix : deliveryMatrix;
  const activeBasename =
    tab === "invoice" ? "tax-invoice-list" : "delivery-pending-invoice";

  return (
    <DeptPageFrame>
      <DeptSubPageHeader
        backTo="/dept/accounting"
        backLabel="แผนกบัญชี"
        titleTh="แผนกบัญชีรับ ใบกำกับภาษี"
        titleEn="Accounting Bill Invoice"
      />

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="inline-flex rounded-xl bg-slate-100/90 p-1 ring-1 ring-slate-200/80"
            role="tablist"
            aria-label="มุมมองใบกำกับ"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "delivery"}
              onClick={() => {
                setTab("delivery");
                taxPaged.setPage(1);
                deliveryPaged.setPage(1);
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                tab === "delivery"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-white/80"
              }`}
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              รายการที่ค้างอยู่ (ใบขนส่ง)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "invoice"}
              onClick={() => {
                setTab("invoice");
                taxPaged.setPage(1);
                deliveryPaged.setPage(1);
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                tab === "invoice"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-white/80"
              }`}
            >
              <Layers className="h-4 w-4 shrink-0" />
              ใบกำกับภาษี
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80">
          <WarehouseExportToolbar
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              taxPaged.setPage(1);
              deliveryPaged.setPage(1);
            }}
            matrixForExport={activeMatrix}
            exportBasename={activeBasename}
            extraEnd={
              tab === "delivery" ? (
                <button
                  type="button"
                  className="w-full shrink-0 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 sm:w-auto"
                >
                  เปิดใบกำกับภาษี
                </button>
              ) : undefined
            }
          />

          {tab === "invoice" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1400px] border-collapse text-sm">
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
                    <Th>แนบไฟล์</Th>
                    <Th>ฝ่ายขาย</Th>
                    <Th>ยกเลิกใบกำกับ</Th>
                  </tr>
                </thead>
                <tbody>
                  {taxPaged.slice.map((r, idx) => (
                    <tr
                      key={r.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                    >
                      <td className="border-b border-slate-100 px-3 py-2.5 tabular-nums text-slate-700">
                        {taxPaged.start + idx + 1}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        <button
                          type="button"
                          className="font-semibold text-teal-600 hover:text-teal-800 hover:underline"
                        >
                          {r.invoiceNo}
                        </button>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-700">
                        {r.date}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-600">
                        {r.poNo || "—"}
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
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right tabular-nums text-slate-800">
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
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
                          >
                            แนบไฟล์
                          </button>
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
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1500px] border-collapse text-sm">
                <thead>
                  <tr>
                    <Th>#</Th>
                    <Th>COUNT วัน</Th>
                    <Th>เลขที่ใบส่งของ</Th>
                    <Th>เลขที่ PO</Th>
                    <Th>เลขที่บริการ</Th>
                    <Th>บริษัท</Th>
                    <Th className="text-right">จำนวน</Th>
                    <Th>วันที่ส่งของ</Th>
                    <Th className="text-right">ราคารวม</Th>
                    <Th className="text-right">ภาษี</Th>
                    <Th className="text-right">รวมทั้งสิ้น</Th>
                    <Th>หมายเหตุ</Th>
                    <Th>ฝ่ายขาย</Th>
                    <Th>CHAT JOB</Th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryPaged.slice.map((r, idx) => (
                    <tr
                      key={r.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                    >
                      <td className="border-b border-slate-100 px-3 py-2.5 tabular-nums">
                        {deliveryPaged.start + idx + 1}
                      </td>
                      <td className="max-w-[220px] border-b border-slate-100 px-3 py-2.5 text-xs font-medium text-red-600">
                        {r.dayStatus}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        <button
                          type="button"
                          className="font-semibold text-teal-600 hover:text-teal-800 hover:underline"
                        >
                          {r.deliveryNo}
                        </button>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-600">
                        {r.poNo || "—"}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 font-semibold text-orange-600">
                        {r.serviceNo}
                      </td>
                      <td className="max-w-[200px] border-b border-slate-100 px-3 py-2.5 text-slate-800">
                        {r.company}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right tabular-nums">
                        {r.qty}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-700">
                        {r.deliveryDate}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right tabular-nums">
                        {r.totalPrice}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right tabular-nums">
                        {r.tax}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-right font-semibold tabular-nums">
                        {r.grandTotal}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        <input
                          type="text"
                          value={remarks[r.id] ?? ""}
                          onChange={(e) =>
                            setRemarks((m) => ({ ...m, [r.id]: e.target.value }))
                          }
                          className="w-full min-w-[120px] rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                          placeholder="—"
                        />
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5 text-slate-700">
                        {r.salesPerson}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-2.5">
                        <button
                          type="button"
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500 text-white shadow-sm hover:bg-teal-600"
                          aria-label="CHAT JOB"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "invoice" ? (
            <TableFooter
              from={
                taxPaged.filtered.length === 0 ? 0 : taxPaged.start + 1
              }
              to={taxPaged.start + taxPaged.slice.length}
              total={taxPaged.filtered.length}
              page={taxPaged.page}
              totalPages={taxPaged.totalPages}
              setPage={taxPaged.setPage}
            />
          ) : (
            <TableFooter
              from={
                deliveryPaged.filtered.length === 0
                  ? 0
                  : deliveryPaged.start + 1
              }
              to={deliveryPaged.start + deliveryPaged.slice.length}
              total={deliveryPaged.filtered.length}
              page={deliveryPaged.page}
              totalPages={deliveryPaged.totalPages}
              setPage={deliveryPaged.setPage}
            />
          )}
        </div>
      </div>
    </DeptPageFrame>
  );
}
