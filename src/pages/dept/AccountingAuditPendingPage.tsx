import { useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptSubPageHeader } from "../../components/dept/DeptSubPageHeader";
import { WarehouseExportToolbar } from "../../components/warehouse/WarehouseExportToolbar";
import type { AuditPendingRow } from "../../data/accountingAuditPendingSeed";

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

export function AccountingAuditPendingPage() {
  const [searchParams] = useSearchParams();
  const kind = searchParams.get("kind") === "production" ? "production" : "management";
  const [search, setSearch] = useState("");

  const rows: AuditPendingRow[] = [];
  const paged = usePaged(rows, search, (r: AuditPendingRow) =>
    [r.refDoc, r.vendor, r.company, r.note].join(" ")
  );

  const titleTh =
    kind === "production"
      ? "รอตรวจสอบ (รายการสั่งซื้ออะไหล่)"
      : "รอตรวจสอบ (รายการบริหาร)";

  const titleThClassName =
    kind === "production"
      ? "text-xl font-bold tracking-tight text-rose-800 sm:text-2xl"
      : "text-xl font-bold tracking-tight text-rose-700 sm:text-2xl";

  const matrix = {
    head: [
      "ลำดับ",
      "เลขที่เอกสารอ้างอิง",
      "ประเภทการจ่าย",
      "ร้านค้า",
      "ราคารวม",
      "วันที่ครบกำหนด",
      "ชื่อบริษัท",
      "เอกสารแนบ",
      "หมายเหตุ",
      "CHAT",
    ],
    rows: paged.filtered.map((r, i) => [
      String(i + 1),
      r.refDoc,
      r.payType,
      r.vendor,
      r.totalPrice,
      r.dueDate,
      r.company,
      r.attachment,
      r.note,
      r.chat,
    ]),
  };

  return (
    <DeptPageFrame>
      <DeptSubPageHeader
        backTo="/dept/accounting"
        backLabel="แผนกบัญชี"
        titleTh={titleTh}
        titleEn="Audit Account"
        titleThClassName={titleThClassName}
      />

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80">
        <WarehouseExportToolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            paged.setPage(1);
          }}
          matrixForExport={matrix}
          exportBasename={`audit-pending-${kind}`}
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-sm">
            <thead>
              <tr>
                <Th>ลำดับ</Th>
                <Th>เลขที่เอกสารอ้างอิง</Th>
                <Th>ประเภทการจ่าย</Th>
                <Th>ร้านค้า</Th>
                <Th className="text-right">ราคารวม</Th>
                <Th>วันที่ครบกำหนด</Th>
                <Th>ชื่อบริษัท</Th>
                <Th>เอกสารแนบ</Th>
                <Th>หมายเหตุ</Th>
                <Th>CHAT</Th>
              </tr>
            </thead>
            <tbody>
              {paged.slice.map((r, idx) => (
                <tr
                  key={r.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                >
                  <td className="border-b border-slate-100 px-3 py-2.5 tabular-nums">
                    {paged.start + idx + 1}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2.5 text-slate-600">
                    {r.refDoc}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2.5 text-slate-600">
                    {r.payType}
                  </td>
                  <td className="max-w-[180px] border-b border-slate-100 px-3 py-2.5 text-slate-700">
                    {r.vendor}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2.5 text-right tabular-nums">
                    {r.totalPrice}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2.5 text-slate-600">
                    {r.dueDate}
                  </td>
                  <td className="max-w-[200px] border-b border-slate-100 px-3 py-2.5 text-slate-700">
                    {r.company}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2.5 text-slate-600">
                    {r.attachment}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2.5 text-slate-600">
                    {r.note}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2.5 text-slate-500">
                    {r.chat}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TableFooter
          from={paged.filtered.length === 0 ? 0 : paged.start + 1}
          to={paged.start + paged.slice.length}
          total={paged.filtered.length}
          page={paged.page}
          totalPages={paged.totalPages}
          setPage={paged.setPage}
        />
      </div>
    </DeptPageFrame>
  );
}
