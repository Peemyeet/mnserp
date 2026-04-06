import { useMemo, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import type { ItTicket } from "../../types/itTicket";

const PAGE_SIZES = [10, 25, 50, 100];

type SortKey = keyof ItTicket;

function statusBadgeClass(status: string) {
  if (status === "ว่าง" || !status) return "text-slate-500";
  if (status.includes("ขอข้อมูล")) return "rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800";
  if (status === "รอทดสอบ" || status === "กำลังดำเนินการ")
    return "rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-800";
  return "rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700";
}

function priorityBadgeClass(priority: string) {
  if (priority === "ว่าง" || !priority) return "text-slate-500";
  if (priority === "ด่วนมาก")
    return "rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800";
  if (priority === "ด่วน")
    return "rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900";
  if (priority === "ไม่ด่วน")
    return "rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-800";
  return "text-slate-600";
}

export function ItTicketsTable({
  titleTh,
  rows,
  emptyPlaceholderRow,
}: {
  titleTh: string;
  rows: ItTicket[];
  /** ถ้าไม่มีข้อมูล ให้แสดงแถวขีดแทน (แผนกขาย) */
  emptyPlaceholderRow?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("subject");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.reporter, r.subject, r.status, r.priority, r.dueDate]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = String(a[sortKey]);
      const vb = String(b[sortKey]);
      const cmp = va.localeCompare(vb, "th");
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const sliceStart = (safePage - 1) * pageSize;
  const pageRows = sorted.slice(sliceStart, sliceStart + pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const showEmptyDash =
    emptyPlaceholderRow && rows.length === 0 && !search.trim();

  const effectiveTotal = showEmptyDash ? 1 : sorted.length;
  const from =
    showEmptyDash ? 1 : sorted.length === 0 ? 0 : sliceStart + 1;
  const to = showEmptyDash ? 1 : Math.min(sliceStart + pageSize, sorted.length);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-center text-base font-bold text-violet-800">
          {titleTh}
        </h2>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span>Show entries</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="rounded border border-slate-200 px-2 py-1.5 text-sm"
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span>Search:</span>
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-40 rounded border border-slate-200 px-2 py-1.5 text-sm sm:w-52"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90">
              {(
                [
                  ["reporter", "ผู้แจ้ง"],
                  ["subject", "หัวข้อ"],
                  ["status", "สถานะ"],
                  ["priority", "ความสำคัญ"],
                  ["dueDate", "วันที่คาดว่าจะเสร็จ"],
                ] as const
              ).map(([key, label]) => (
                <th key={key} className="px-3 py-3 text-left">
                  <button
                    type="button"
                    onClick={() => toggleSort(key)}
                    className="inline-flex items-center gap-1 font-semibold text-violet-700 hover:text-violet-900"
                  >
                    {label}
                    <ArrowDownUp className="h-3.5 w-3.5 text-violet-400" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {showEmptyDash ? (
              <tr className="border-b border-slate-100 bg-slate-50/30">
                {Array.from({ length: 5 }).map((_, ci) => (
                  <td
                    key={ci}
                    className="px-3 py-4 text-center text-slate-400"
                  >
                    -
                  </td>
                ))}
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td className="px-3 py-8 text-center text-slate-500" colSpan={5}>
                  ไม่พบรายการ
                </td>
              </tr>
            ) : (
              pageRows.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-b border-slate-100 ${
                    i % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                  }`}
                >
                  <td className="px-3 py-2.5 text-slate-800">{r.reporter}</td>
                  <td className="max-w-[220px] px-3 py-2.5 text-slate-800">
                    {r.subject}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={statusBadgeClass(r.status)}>{r.status}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={priorityBadgeClass(r.priority)}>
                      {r.priority}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                    {r.dueDate}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
        <span>
          {sorted.length === 0 && !showEmptyDash
            ? "Showing 0 to 0 of 0 entries"
            : `Showing ${from} to ${to} of ${effectiveTotal} entries`}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded border border-slate-200 px-3 py-1 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-2 font-medium text-violet-700">{safePage}</span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded border border-slate-200 px-3 py-1 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
