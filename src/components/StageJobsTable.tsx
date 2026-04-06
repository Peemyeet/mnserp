import { useMemo, useState } from "react";
import { ArrowDownUp, ChevronLeft, ChevronRight } from "lucide-react";
import { getStageMeta, workflowStageDefinitions } from "../data/workflowStages";
import { formatTimeInStage } from "../lib/duration";
import type { Job } from "../types/job";

const PAGE_SIZE = 10;

type SortKey =
  | "serviceNumber"
  | "jobName"
  | "customerName"
  | "customerPO"
  | "status"
  | "enteredStageAt";

const COL_LABEL: Record<SortKey, string> = {
  serviceNumber: "หมายเลขบริการ",
  jobName: "ชื่องาน",
  customerName: "ชื่อลูกค้า",
  customerPO: "PO ลูกค้า",
  status: "สถานะ",
  enteredStageAt: "อยู่สถานะนี้มาแล้ว",
};

function sortLabel(key: SortKey) {
  return COL_LABEL[key];
}

function statusTitle(code: string) {
  return getStageMeta(code)?.title ?? code;
}

function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function toCsvRow(cells: string[]) {
  return cells
    .map((c) => `"${c.replace(/"/g, '""')}"`)
    .join(",");
}

export function StageJobsTable({
  jobs,
  currentStageCode,
  onMoveJob,
}: {
  jobs: Job[];
  currentStageCode: string;
  onMoveJob: (jobId: string, stageCode: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("serviceNumber");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) => {
      const blob = [
        j.serviceNumber,
        j.jobName,
        j.customerName,
        j.customerPO,
        statusTitle(j.currentStageCode),
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [jobs, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let va: string;
      let vb: string;
      if (sortKey === "status") {
        va = statusTitle(a.currentStageCode);
        vb = statusTitle(b.currentStageCode);
      } else if (sortKey === "enteredStageAt") {
        va = a.enteredStageAt;
        vb = b.enteredStageAt;
      } else {
        va = a[sortKey];
        vb = b[sortKey];
      }
      const cmp = va.localeCompare(vb, "th");
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const sliceStart = (safePage - 1) * PAGE_SIZE;
  const pageRows = sorted.slice(sliceStart, sliceStart + PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const exportMatrix = (list: Job[]) => {
    const head = [
      "ลำดับที่",
      "หมายเลขบริการ",
      "ชื่องาน",
      "ชื่อลูกค้า",
      "PO ลูกค้า",
      "สถานะ",
      "อยู่สถานะนี้มาแล้ว",
    ];
    const lines = [
      head.join("\t"),
      ...list.map((j, i) =>
        [
          String(i + 1),
          j.serviceNumber,
          j.jobName,
          j.customerName,
          j.customerPO,
          statusTitle(j.currentStageCode),
          formatTimeInStage(j.enteredStageAt),
        ].join("\t")
      ),
    ];
    return lines.join("\n");
  };

  const handleCopy = async () => {
    const tsv = exportMatrix(sorted);
    try {
      await navigator.clipboard.writeText(tsv);
    } catch {
      downloadText("copy-fallback.txt", tsv, "text/plain;charset=utf-8");
    }
  };

  const handleCsv = () => {
    const head = [
      "ลำดับที่",
      "หมายเลขบริการ",
      "ชื่องาน",
      "ชื่อลูกค้า",
      "PO ลูกค้า",
      "สถานะ",
      "อยู่สถานะนี้มาแล้ว",
    ];
    const rows = sorted.map((j, i) =>
      toCsvRow([
        String(i + 1),
        j.serviceNumber,
        j.jobName,
        j.customerName,
        j.customerPO,
        statusTitle(j.currentStageCode),
        formatTimeInStage(j.enteredStageAt),
      ])
    );
    const bom = "\uFEFF";
    const csv = bom + [toCsvRow(head), ...rows].join("\r\n");
    downloadText(`งาน-${currentStageCode}.csv`, csv, "text/csv;charset=utf-8");
  };

  const handleExcel = () => {
    const tsv = exportMatrix(sorted);
    downloadText(
      `งาน-${currentStageCode}.xls`,
      "\uFEFF" + tsv.replace(/\n/g, "\r\n"),
      "application/vnd.ms-excel;charset=utf-8"
    );
  };

  const handlePdf = () => {
    window.print();
  };

  const from = sorted.length === 0 ? 0 : sliceStart + 1;
  const to = Math.min(sliceStart + PAGE_SIZE, sorted.length);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-card">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
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
            onClick={handlePdf}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-indigo-200 hover:text-indigo-700"
          >
            PDF
          </button>
        </div>
        <label className="flex w-full items-center gap-2 sm:w-auto">
          <span className="shrink-0 text-sm text-slate-500">Search:</span>
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 sm:w-56"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-semibold">ลำดับที่</th>
              {(Object.keys(COL_LABEL) as SortKey[]).map((key) => (
                <th key={key} className="px-4 py-3 font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleSort(key)}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600"
                  >
                    {sortLabel(key)}
                    <ArrowDownUp className="h-3.5 w-3.5 opacity-60" />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 font-semibold">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  ไม่มีข้อมูลในขั้นนี้
                </td>
              </tr>
            ) : (
              pageRows.map((j, idx) => (
                <tr
                  key={j.id}
                  className="hover:bg-slate-50/80"
                >
                  <td className="px-4 py-3 tabular-nums text-slate-600">
                    {sliceStart + idx + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {j.serviceNumber}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-slate-800">
                    {j.jobName}
                  </td>
                  <td className="max-w-[160px] truncate px-4 py-3 text-slate-700">
                    {j.customerName}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {j.customerPO || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {statusTitle(j.currentStageCode)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatTimeInStage(j.enteredStageAt)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      aria-label={`เลื่อนขั้น ${j.serviceNumber}`}
                      value={j.currentStageCode}
                      onChange={(e) =>
                        onMoveJob(j.id, e.target.value)
                      }
                      className="max-w-[10rem] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {workflowStageDefinitions.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.code} {s.title}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Showing {from} to {to} of {sorted.length} entries
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 disabled:opacity-40"
          >
            <span className="inline-flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" /> Previous
            </span>
          </button>
          <span className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
            {safePage}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 disabled:opacity-40"
          >
            <span className="inline-flex items-center gap-1">
              Next <ChevronRight className="h-4 w-4" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
