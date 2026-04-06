import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Company } from "../types/company";

type SortKey = "storeName" | "details" | "manager";

const COL_LABEL: Record<SortKey, string> = {
  storeName: "ชื่อร้านค้า",
  details: "รายละเอียด/หมายเหตุ",
  manager: "ผู้จัดการ",
};

const PAGE_OPTIONS = [10, 25, 50] as const;

export function CompanyNamesTable({
  companies,
  onUpdate,
  onDelete,
}: {
  companies: Company[];
  onUpdate: (
    id: string,
    patch: Partial<Pick<Company, "storeName" | "details" | "manager">>
  ) => void;
  onDelete: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState<(typeof PAGE_OPTIONS)[number]>(10);
  const [sortKey, setSortKey] = useState<SortKey>("storeName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    storeName: "",
    details: "",
    manager: "",
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) =>
      [c.storeName, c.details, c.manager].join(" ").toLowerCase().includes(q)
    );
  }, [companies, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const cmp = a[sortKey].localeCompare(b[sortKey], "th");
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const sliceStart = (safePage - 1) * pageSize;
  const pageRows = sorted.slice(sliceStart, sliceStart + pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const startEdit = (c: Company) => {
    setEditingId(c.id);
    setDraft({
      storeName: c.storeName,
      details: c.details,
      manager: c.manager,
    });
  };

  const saveEdit = (id: string) => {
    onUpdate(id, {
      storeName: draft.storeName,
      details: draft.details,
      manager: draft.manager,
    });
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  const handleDelete = (c: Company) => {
    if (
      window.confirm(
        `ลบ "${c.storeName}" หรือไม่?`
      )
    ) {
      onDelete(c.id);
      if (editingId === c.id) setEditingId(null);
    }
  };

  const from = sorted.length === 0 ? 0 : sliceStart + 1;
  const to = Math.min(sliceStart + pageSize, sorted.length);

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value) as (typeof PAGE_OPTIONS)[number]);
              setPage(1);
            }}
            className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-indigo-400"
          >
            {PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>entries</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span className="shrink-0">Search:</span>
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="min-w-[12rem] rounded border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-indigo-400"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100 text-left text-xs font-semibold text-slate-600">
              <th className="w-20 px-3 py-2.5 font-semibold">ลำดับที่</th>
              {(Object.keys(COL_LABEL) as SortKey[]).map((key) => (
                <th key={key} className="px-3 py-2.5 font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleSort(key)}
                    className="inline-flex items-center gap-1 hover:text-indigo-600"
                  >
                    {COL_LABEL[key]}
                    <ArrowDownUp className="h-3 w-3 opacity-70" />
                  </button>
                </th>
              ))}
              <th className="w-28 px-3 py-2.5 text-center font-semibold">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  ไม่มีข้อมูล
                </td>
              </tr>
            ) : (
              pageRows.map((c, idx) => {
                const rowNum = sliceStart + idx + 1;
                const isEdit = editingId === c.id;
                const zebra = idx % 2 === 1 ? "bg-slate-50/80" : "bg-white";

                return (
                    <tr
                      key={c.id}
                      className={`border-b border-slate-200 ${zebra}`}
                    >
                      <td className="px-3 py-2.5 tabular-nums text-slate-700">
                        {rowNum}
                      </td>
                      <td className="px-3 py-2.5 text-slate-800">
                        {isEdit ? (
                          <input
                            value={draft.storeName}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                storeName: e.target.value,
                              }))
                            }
                            className="w-full min-w-[12rem] rounded border border-slate-300 px-2 py-1 text-sm"
                          />
                        ) : (
                          <span className="font-medium">{c.storeName}</span>
                        )}
                      </td>
                      <td className="max-w-md px-3 py-2.5 text-slate-700">
                        {isEdit ? (
                          <textarea
                            value={draft.details}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                details: e.target.value,
                              }))
                            }
                            rows={2}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                          />
                        ) : (
                          <span className="leading-relaxed">{c.details}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700">
                        {isEdit ? (
                          <input
                            value={draft.manager}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                manager: e.target.value,
                              }))
                            }
                            className="w-full min-w-[10rem] rounded border border-slate-300 px-2 py-1 text-sm"
                          />
                        ) : (
                          c.manager
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-center gap-0">
                          {isEdit ? (
                            <div className="flex flex-wrap justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => saveEdit(c.id)}
                                className="rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                              >
                                บันทึก
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(c)}
                                className="rounded p-1.5 text-orange-500 hover:bg-orange-50"
                                aria-label="แก้ไข"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <span
                                className="h-5 w-px bg-slate-300"
                                aria-hidden
                              />
                              <button
                                type="button"
                                onClick={() => handleDelete(c)}
                                className="rounded p-1.5 text-red-600 hover:bg-red-50"
                                aria-label="ลบ"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Showing {from} to {to} of {sorted.length} entries
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-600 disabled:opacity-40"
          >
            <span className="inline-flex items-center gap-0.5">
              <ChevronLeft className="h-4 w-4" /> Previous
            </span>
          </button>
          <span className="flex h-8 min-w-[2rem] items-center justify-center rounded-full bg-violet-600 text-sm font-semibold text-white">
            {safePage}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-600 disabled:opacity-40"
          >
            <span className="inline-flex items-center gap-0.5">
              Next <ChevronRight className="h-4 w-4" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
