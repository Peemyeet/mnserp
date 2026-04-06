import { Fragment, useMemo, useState } from "react";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  User,
} from "lucide-react";
import type { Customer } from "../types/customer";

const PAGE_SIZE = 10;

type SortKey =
  | "customerCode"
  | "companyName"
  | "contactName"
  | "phone"
  | "salesPersonName"
  | "customerType"
  | "region"
  | "frequency"
  | "grade";

const COL_LABEL: Record<SortKey, string> = {
  customerCode: "รหัสลูกค้า",
  companyName: "รายชื่อบริษัท",
  contactName: "ชื่อผู้ติดต่อ",
  phone: "เบอร์โทร.",
  salesPersonName: "ชื่อพนักงานขาย",
  customerType: "ประเภทลูกค้า",
  region: "ภูมิภาค",
  frequency: "ความถี่",
  grade: "Grade",
};

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
    .map((c) => `"${String(c).replace(/"/g, '""')}"`)
    .join(",");
}

export function CustomerTable({
  customers,
  onUpdateCustomerType,
}: {
  customers: Customer[];
  onUpdateCustomerType: (id: string, customerType: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("customerCode");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [typeDraft, setTypeDraft] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [
        c.customerCode,
        c.companyName,
        c.contactName,
        c.phone,
        c.salesPersonName,
        c.customerType,
        c.region,
        String(c.frequency),
        c.grade,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [customers, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp: number;
      if (sortKey === "frequency") {
        cmp = a.frequency - b.frequency;
      } else {
        cmp = String(a[sortKey]).localeCompare(String(b[sortKey]), "th");
      }
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

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exportRows = (list: Customer[]) => {
    const head = [
      "ลำดับที่",
      "รหัสลูกค้า",
      "รายชื่อบริษัท",
      "ชื่อผู้ติดต่อ",
      "เบอร์โทร.",
      "ชื่อพนักงานขาย",
      "ประเภทลูกค้า",
      "ภูมิภาค",
      "ความถี่",
      "Grade",
    ];
    return [
      head.join("\t"),
      ...list.map((c, i) =>
        [
          String(i + 1),
          c.customerCode,
          c.companyName,
          c.contactName,
          c.phone,
          c.salesPersonName,
          c.customerType,
          c.region,
          String(c.frequency),
          c.grade,
        ].join("\t")
      ),
    ].join("\n");
  };

  const handleCopy = async () => {
    const tsv = exportRows(sorted);
    try {
      await navigator.clipboard.writeText(tsv);
    } catch {
      downloadText("customers.txt", tsv, "text/plain;charset=utf-8");
    }
  };

  const handleCsv = () => {
    const head = [
      "ลำดับที่",
      "รหัสลูกค้า",
      "รายชื่อบริษัท",
      "ชื่อผู้ติดต่อ",
      "เบอร์โทร.",
      "ชื่อพนักงานขาย",
      "ประเภทลูกค้า",
      "ภูมิภาค",
      "ความถี่",
      "Grade",
    ];
    const rows = sorted.map((c, i) =>
      toCsvRow([
        String(i + 1),
        c.customerCode,
        c.companyName,
        c.contactName,
        c.phone,
        c.salesPersonName,
        c.customerType,
        c.region,
        String(c.frequency),
        c.grade,
      ])
    );
    const csv = "\uFEFF" + [toCsvRow(head), ...rows].join("\r\n");
    downloadText("customers.csv", csv, "text/csv;charset=utf-8");
  };

  const handlePdf = () => window.print();

  const from = sorted.length === 0 ? 0 : sliceStart + 1;
  const to = Math.min(sliceStart + PAGE_SIZE, sorted.length);

  const startEditType = (c: Customer) => {
    setEditingTypeId(c.id);
    setTypeDraft(c.customerType);
  };

  const commitType = (id: string) => {
    onUpdateCustomerType(id, typeDraft.trim());
    setEditingTypeId(null);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="rounded border border-slate-300 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Copy
          </button>
          <button
            type="button"
            onClick={handleCsv}
            className="rounded border border-slate-300 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            CSV
          </button>
          <button
            type="button"
            onClick={handlePdf}
            className="rounded border border-slate-300 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            PDF
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span className="shrink-0">Search:</span>
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="min-w-[12rem] rounded border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100 text-left text-xs font-semibold text-slate-600">
              <th className="w-24 px-2 py-2.5 font-semibold">ลำดับที่</th>
              {(Object.keys(COL_LABEL) as SortKey[]).map((key) => (
                <th key={key} className="px-2 py-2.5 font-semibold">
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
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  ไม่มีข้อมูลลูกค้า
                </td>
              </tr>
            ) : (
              pageRows.map((c, idx) => {
                const rowNum = sliceStart + idx + 1;
                const isOpen = expanded.has(c.id);
                const zebra = idx % 2 === 1 ? "bg-slate-50/70" : "bg-white";

                return (
                  <Fragment key={c.id}>
                    <tr className={`border-b border-slate-200 ${zebra}`}>
                      <td className="px-2 py-2 align-middle">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleExpand(c.id)}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                            aria-expanded={isOpen}
                            aria-label={isOpen ? "ยุบรายละเอียด" : "ขยายรายละเอียด"}
                          >
                            <Plus
                              className={`h-3.5 w-3.5 transition ${isOpen ? "rotate-45" : ""}`}
                              strokeWidth={3}
                            />
                          </button>
                          <span className="tabular-nums text-slate-700">
                            {rowNum}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-2 font-medium text-slate-800">
                        {c.customerCode}
                      </td>
                      <td className="max-w-[200px] truncate px-2 py-2 text-slate-800">
                        {c.companyName}
                      </td>
                      <td className="px-2 py-2 text-slate-700">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          {c.contactName}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-slate-700">
                        {c.phone}
                      </td>
                      <td className="max-w-[120px] truncate px-2 py-2 text-slate-700">
                        {c.salesPersonName}
                      </td>
                      <td className="px-2 py-2 text-slate-700">
                        <div className="flex items-center gap-1">
                          {editingTypeId === c.id ? (
                            <input
                              autoFocus
                              value={typeDraft}
                              onChange={(e) => setTypeDraft(e.target.value)}
                              onBlur={() => commitType(c.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitType(c.id);
                                if (e.key === "Escape") {
                                  setEditingTypeId(null);
                                }
                              }}
                              className="w-full min-w-[8rem] max-w-[14rem] rounded border border-indigo-300 px-1.5 py-0.5 text-sm"
                            />
                          ) : (
                            <>
                              <span className="min-w-0 flex-1 truncate">
                                {c.customerType}
                              </span>
                              <button
                                type="button"
                                onClick={() => startEditType(c)}
                                className="shrink-0 rounded p-0.5 text-blue-600 hover:bg-blue-50"
                                aria-label="แก้ไขประเภทลูกค้า"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-slate-700">{c.region}</td>
                      <td className="px-2 py-2 text-center tabular-nums text-slate-700">
                        {c.frequency}
                      </td>
                      <td className="px-2 py-2 text-center font-medium text-slate-800">
                        {c.grade}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className={`border-b border-slate-200 ${zebra}`}>
                        <td
                          colSpan={10}
                          className="px-4 py-3 pl-12 text-sm text-slate-600"
                        >
                          <span className="font-medium text-slate-500">
                            รายละเอียด:{" "}
                          </span>
                          {c.detailNote || "—"}
                        </td>
                      </tr>
                    )}
                  </Fragment>
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
