import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { StockPartRow } from "../../data/warehouseInventorySeed";
import { useWarehouseStoreData } from "../../hooks/useWarehouseStoreData";
import { WarehouseExportToolbar } from "./WarehouseExportToolbar";
import { SortableTh } from "./SortableTh";

const PAGE_SIZE = 10;

const NO_ACTION =
  "ฟังก์ชันนี้ยังไม่เชื่อมฐานข้อมูล — แก้ไขจำนวน/สถานะผ่านระบบเดิมหรือรอ API";

type SortKey = keyof StockPartRow;

export function ProductionWarehouseView() {
  const { loading: storeLoading, error: storeError, fromDb, stockRows: apiRows } =
    useWarehouseStoreData("production");
  const [rows, setRows] = useState<StockPartRow[]>([]);

  useEffect(() => {
    setRows(apiRows);
  }, [apiRows]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("mnsPartNo");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [
        r.mnsPartNo,
        r.partNo,
        r.description,
        r.partNoWd,
        r.partNoSeagate,
        r.remark,
        r.location,
      ]
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
      if (sortKey === "qty" || sortKey === "processingQty") {
        const na = Number(a[sortKey]);
        const nb = Number(b[sortKey]);
        return sortDir === "asc" ? na - nb : nb - na;
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
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const exportMatrix = {
    head: [
      "No.",
      "MNS Part No",
      "Part No (WD)",
      "Part No (Seagate)",
      "Description",
      "QTY",
      "Remark",
      "Processing QTY",
      "Location",
    ],
    rows: sorted.map((r, i) => [
      String(i + 1),
      r.mnsPartNo,
      r.partNoWd,
      r.partNoSeagate,
      r.description,
      String(r.qty),
      r.remark,
      String(r.processingQty),
      r.location,
    ]),
  };

  return (
    <div className="min-h-full bg-slate-100/80 print:bg-white">
      <header className="border-b border-slate-200/80 bg-white px-6 py-4 print:hidden">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          คลังผลิต / Production stock
        </h1>
        <p className="text-sm text-slate-500">Production warehouse</p>
        {storeLoading && (
          <p className="mt-1 text-xs text-violet-600">กำลังโหลดจาก store_data (หมวด PCB รอผลิต)…</p>
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
          <p className="mt-1 text-xs text-slate-500">เชื่อม API + ฐานข้อมูลเพื่อโหลดรายการ</p>
        )}
      </header>

      <div className="p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            to="/warehouse/production/add"
            className="rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-600"
          >
            เพิ่มสินค้าในคลัง
          </Link>
          <button
            type="button"
            disabled
            title={NO_ACTION}
            className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-45"
          >
            กำลังดำเนินการ
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
          <WarehouseExportToolbar
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            matrixForExport={exportMatrix}
            exportBasename="warehouse-production"
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3 font-semibold">No.</th>
                  <th className="px-3 py-3 font-semibold">Picture</th>
                  <SortableTh
                    label="MNS Part No"
                    active={sortKey === "mnsPartNo"}
                    dir={sortDir}
                    onClick={() => toggleSort("mnsPartNo")}
                  />
                  <SortableTh
                    label="Part No (WD)"
                    active={sortKey === "partNoWd"}
                    dir={sortDir}
                    onClick={() => toggleSort("partNoWd")}
                  />
                  <SortableTh
                    label="Part No (Seagate)"
                    active={sortKey === "partNoSeagate"}
                    dir={sortDir}
                    onClick={() => toggleSort("partNoSeagate")}
                  />
                  <SortableTh
                    label="Description"
                    active={sortKey === "description"}
                    dir={sortDir}
                    onClick={() => toggleSort("description")}
                  />
                  <SortableTh
                    label="QTY"
                    active={sortKey === "qty"}
                    dir={sortDir}
                    onClick={() => toggleSort("qty")}
                  />
                  <SortableTh
                    label="Remark"
                    active={sortKey === "remark"}
                    dir={sortDir}
                    onClick={() => toggleSort("remark")}
                  />
                  <th className="px-3 py-3 font-semibold">Processing QTY</th>
                  <SortableTh
                    label="Location"
                    active={sortKey === "location"}
                    dir={sortDir}
                    onClick={() => toggleSort("location")}
                  />
                  <th className="px-3 py-3 font-semibold">Setting</th>
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
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-500">
                        <HelpCircle className="h-6 w-6" aria-hidden />
                      </div>
                    </td>
                    <td className="px-3 py-2 font-medium text-amber-600">
                      {r.mnsPartNo}
                    </td>
                    <td className="px-3 py-2 text-slate-800">{r.partNoWd}</td>
                    <td className="px-3 py-2 text-slate-800">{r.partNoSeagate}</td>
                    <td className="max-w-[200px] px-3 py-2 text-slate-700">
                      {r.description}
                    </td>
                    <td className="px-3 py-2 font-semibold text-violet-600">
                      {r.qty}
                    </td>
                    <td className="max-w-[180px] px-3 py-2 text-slate-700">
                      {r.remark || "—"}
                    </td>
                    <td className="px-3 py-2 tabular-nums text-slate-700">
                      {r.processingQty}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{r.location}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled
                          title={NO_ACTION}
                          className="rounded p-1.5 text-slate-400 disabled:cursor-not-allowed"
                          aria-label="ส่งออก"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled
                          title={NO_ACTION}
                          className="rounded p-1.5 text-slate-400 disabled:cursor-not-allowed"
                          aria-label="ถอยกลับ"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled
                          title={NO_ACTION}
                          className="rounded p-1.5 text-slate-400 disabled:cursor-not-allowed"
                          aria-label="ถัดไป"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-600 print:hidden">
            <span>
              {sorted.length === 0
                ? "ไม่มีรายการ"
                : `หน้า ${safePage} / ${totalPages}`}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >
                ก่อนหน้า
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
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
