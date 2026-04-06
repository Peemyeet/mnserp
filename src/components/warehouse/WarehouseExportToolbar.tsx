import type { ReactNode } from "react";
import { downloadText, toCsvRow } from "../../lib/tableExport";

export function WarehouseExportToolbar({
  search,
  onSearchChange,
  matrixForExport,
  exportBasename,
  extraEnd,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  /** แถวหัวตาราง + ข้อมูล (string[][]) */
  matrixForExport: { head: string[]; rows: string[][] };
  exportBasename: string;
  /** ปุ่มเสริมท้ายแถว (เช่น เปิดใบกำกับภาษี) */
  extraEnd?: ReactNode;
}) {
  const tsvBody = [
    matrixForExport.head.join("\t"),
    ...matrixForExport.rows.map((r) => r.join("\t")),
  ].join("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tsvBody);
    } catch {
      downloadText("copy-fallback.txt", tsvBody, "text/plain;charset=utf-8");
    }
  };

  const handleCsv = () => {
    const bom = "\uFEFF";
    const csv =
      bom +
      [
        toCsvRow(matrixForExport.head),
        ...matrixForExport.rows.map((r) => toCsvRow(r)),
      ].join("\r\n");
    downloadText(`${exportBasename}.csv`, csv, "text/csv;charset=utf-8");
  };

  const handleExcel = () => {
    downloadText(
      `${exportBasename}.xls`,
      "\uFEFF" + tsvBody.replace(/\n/g, "\r\n"),
      "application/vnd.ms-excel;charset=utf-8"
    );
  };

  return (
    <div className="flex flex-col gap-4 border-b border-slate-100/90 bg-slate-50/30 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-indigo-200 hover:text-indigo-700"
        >
          Copy
        </button>
        <button
          type="button"
          onClick={handleExcel}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-indigo-200 hover:text-indigo-700"
        >
          Excel
        </button>
        <button
          type="button"
          onClick={handleCsv}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-indigo-200 hover:text-indigo-700"
        >
          CSV
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-indigo-200 hover:text-indigo-700"
        >
          PDF
        </button>
      </div>
      <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:items-center sm:gap-3">
        <label className="flex min-w-0 items-center gap-2 sm:w-auto">
          <span className="shrink-0 text-sm text-slate-500">Search:</span>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 sm:w-56"
          />
        </label>
        {extraEnd}
      </div>
    </div>
  );
}
