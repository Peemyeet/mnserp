import { useEffect, useMemo, useState } from "react";
import { ImageIcon, Settings2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { SparePartRow } from "../../data/warehouseInventorySeed";
import { useWarehouseStoreData } from "../../hooks/useWarehouseStoreData";
import { WarehouseExportToolbar } from "./WarehouseExportToolbar";
import { SortableTh } from "./SortableTh";

const PAGE_SIZES = [10, 25, 50, 100];

const NO_ACTION =
  "ฟังก์ชันนี้ยังไม่เชื่อมฐานข้อมูลในรุ่นนี้ — ดู/เพิ่มรายการผ่านตาราง store_data เท่านั้น";

export function SparePartsWarehouseView() {
  const { loading: storeLoading, error: storeError, fromDb, spareRows: apiRows } =
    useWarehouseStoreData("spare");
  const [rows, setRows] = useState<SparePartRow[]>([]);

  useEffect(() => {
    setRows(apiRows);
  }, [apiRows]);
  const [category, setCategory] = useState("All");
  const [subCategory, setSubCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof SparePartRow>("mnsPartNo");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const categories = useMemo(() => {
    const u = new Set(rows.map((r) => r.category));
    return ["All", ...Array.from(u)];
  }, [rows]);
  const subCategories = useMemo(() => {
    const u = new Set(rows.map((r) => r.subCategory));
    return ["All", ...Array.from(u)];
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (category !== "All" && r.category !== category) return false;
      if (subCategory !== "All" && r.subCategory !== subCategory) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      const blob = [
        r.mnsPartNo,
        r.partNo,
        r.description,
        r.location,
        r.category,
        r.subCategory,
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [rows, category, subCategory, search]);

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

  const toggleSort = (key: keyof SparePartRow) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const resetFilters = () => {
    setCategory("All");
    setSubCategory("All");
    setSearch("");
    setPage(1);
  };

  const exportMatrix = {
    head: [
      "No.",
      "MNS Part No",
      "Part No",
      "Description",
      "QTY",
      "Location",
      "Category",
      "Sub Category",
    ],
    rows: sorted.map((r, i) => [
      String(i + 1),
      r.mnsPartNo,
      r.partNo,
      r.description,
      String(r.qty),
      r.location,
      r.category,
      r.subCategory,
    ]),
  };

  return (
    <div className="min-h-full bg-slate-100/80 print:bg-white">
      <header className="border-b border-slate-200/80 bg-white px-6 py-4 print:hidden">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Store Part / คลังอะไหล่
        </h1>
        <p className="text-sm text-slate-500">Spare parts warehouse</p>
        {storeLoading && (
          <p className="mt-1 text-xs text-violet-600">กำลังโหลดจาก store_data…</p>
        )}
        {!storeLoading && storeError && (
          <p className="mt-1 text-xs text-rose-600">{storeError}</p>
        )}
        {!storeLoading && fromDb && !storeError && (
          <p className="mt-1 text-xs text-emerald-700">
            แสดงข้อมูลจริงจาก MySQL ({rows.length} รายการ)
          </p>
        )}
        {!storeLoading && !fromDb && !storeError && (
          <p className="mt-1 text-xs text-slate-500">
            เชื่อม API + ฐานข้อมูลเพื่อโหลดรายการอะไหล่
          </p>
        )}
      </header>

      <div className="p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-end gap-2 print:hidden">
          <button
            type="button"
            disabled
            title={NO_ACTION}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-45"
          >
            Create PR
          </button>
          <button
            type="button"
            disabled
            title={NO_ACTION}
            className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-45"
          >
            Requisition List
          </button>
          <button
            type="button"
            disabled
            title={NO_ACTION}
            className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-45"
          >
            History Requisition
          </button>
          <button
            type="button"
            disabled
            title={NO_ACTION}
            className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-45"
          >
            Requisition
          </button>
          <button
            type="button"
            disabled
            title={NO_ACTION}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-45"
          >
            Category
          </button>
          <Link
            to="/warehouse/spare/add"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
          >
            Add Part
          </Link>
        </div>

        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm print:hidden">
          <label className="text-sm text-slate-600">
            <span className="mb-1 block font-medium">Category:</span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block font-medium">Sub Category:</span>
            <select
              value={subCategory}
              onChange={(e) => {
                setSubCategory(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {subCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => setPage(1)}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            Search
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Reset
          </button>
          <button
            type="button"
            disabled
            title={NO_ACTION}
            className="ml-auto rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            Select Delete
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 print:hidden">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <span>Show entries</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <WarehouseExportToolbar
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            matrixForExport={exportMatrix}
            exportBasename="store-part-spare"
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3 font-semibold text-slate-600">No.</th>
                  <th className="px-3 py-3 font-semibold text-slate-600">Picture</th>
                  <SortableTh
                    label="MNS Part No"
                    active={sortKey === "mnsPartNo"}
                    dir={sortDir}
                    onClick={() => toggleSort("mnsPartNo")}
                  />
                  <SortableTh
                    label="Part No"
                    active={sortKey === "partNo"}
                    dir={sortDir}
                    onClick={() => toggleSort("partNo")}
                  />
                  <SortableTh
                    label="Description"
                    active={sortKey === "description"}
                    dir={sortDir}
                    onClick={() => toggleSort("description")}
                  />
                  <th className="px-3 py-3 font-semibold">QTY</th>
                  <SortableTh
                    label="Location"
                    active={sortKey === "location"}
                    dir={sortDir}
                    onClick={() => toggleSort("location")}
                  />
                  <SortableTh
                    label="Category"
                    active={sortKey === "category"}
                    dir={sortDir}
                    onClick={() => toggleSort("category")}
                  />
                  <SortableTh
                    label="Sub Category"
                    active={sortKey === "subCategory"}
                    dir={sortDir}
                    onClick={() => toggleSort("subCategory")}
                  />
                  <th className="px-3 py-3 font-semibold">Setting</th>
                  <th className="px-3 py-3 font-semibold">ประวัติอะไหล่</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r, idx) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-100 hover:bg-slate-50/50"
                  >
                    <td className="px-3 py-2 text-slate-700">
                      {sliceStart + idx + 1}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                        <ImageIcon className="h-5 w-5" aria-hidden />
                      </div>
                    </td>
                    <td className="px-3 py-2 font-medium text-amber-600">
                      {r.mnsPartNo}
                    </td>
                    <td className="px-3 py-2 text-slate-800">{r.partNo}</td>
                    <td className="max-w-xs px-3 py-2 text-slate-700">
                      {r.description}
                    </td>
                    <td className="px-3 py-2 font-semibold tabular-nums text-amber-600">
                      {r.qty}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{r.location}</td>
                    <td className="px-3 py-2 text-slate-700">{r.category}</td>
                    <td className="px-3 py-2 text-slate-700">{r.subCategory}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled
                          title={NO_ACTION}
                          className="rounded p-1.5 text-slate-400 disabled:cursor-not-allowed"
                          aria-label="ตั้งค่า"
                        >
                          <Settings2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled
                          title={NO_ACTION}
                          className="rounded p-1.5 text-slate-400 disabled:cursor-not-allowed"
                          aria-label="ลบ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        disabled
                        title={NO_ACTION}
                        className="text-sm font-semibold text-slate-400 disabled:cursor-not-allowed"
                      >
                        ประวัติอะไหล่
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-sm text-slate-600 print:hidden">
            <span>
              {sorted.length === 0
                ? "ไม่มีรายการ"
                : `แสดง ${sliceStart + 1}–${Math.min(sliceStart + pageSize, sorted.length)} จาก ${sorted.length}`}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium disabled:opacity-40"
              >
                ก่อนหน้า
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium disabled:opacity-40"
              >
                ถัดไป
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
