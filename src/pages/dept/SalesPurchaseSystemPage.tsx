import { useCallback, useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptPageHeader } from "../../components/dept/DeptPageHeader";

type Row = {
  id: number;
  daysMoved: number;
  customerPo: string;
  serviceNo: string;
  jobName: string;
  engineer: string;
  sales: string;
  customer: string;
};

/** ไม่มี mock — รอ API/ตารางฝั่งซื้อ (เช่น bill_order + job_data) */
const ROWS: Row[] = [];

type SortKey =
  | "daysMoved"
  | "customerPo"
  | "serviceNo"
  | "jobName"
  | "engineer"
  | "sales"
  | "customer";

function matchesSearch(row: Row, q: string): boolean {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  const blob = [
    row.customerPo,
    row.serviceNo,
    row.jobName,
    row.engineer,
    row.sales,
    row.customer,
  ]
    .join(" ")
    .toLowerCase();
  return blob.includes(s);
}

export function SalesPurchaseSystemPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [sortKey, setSortKey] = useState<SortKey>("daysMoved");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(
    () => ROWS.filter((r) => matchesSearch(r, search)),
    [search]
  );

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const m = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "daysMoved":
          cmp = a.daysMoved - b.daysMoved;
          break;
        case "customerPo":
          cmp = a.customerPo.localeCompare(b.customerPo, "th");
          break;
        case "serviceNo":
          cmp = a.serviceNo.localeCompare(b.serviceNo, "th");
          break;
        case "jobName":
          cmp = a.jobName.localeCompare(b.jobName, "th");
          break;
        case "engineer":
          cmp = a.engineer.localeCompare(b.engineer, "th");
          break;
        case "sales":
          cmp = a.sales.localeCompare(b.sales, "th");
          break;
        case "customer":
          cmp = a.customer.localeCompare(b.customer, "th");
          break;
        default:
          cmp = 0;
      }
      return m * cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    setSortKey((prev) => {
      if (prev === k) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortDir("asc");
      return k;
    });
  };

  const thSort = (label: string, key: SortKey, accent?: boolean) => (
    <th
      className={`border-b border-violet-200 bg-violet-50 px-3 py-2.5 text-left text-xs font-semibold ${accent ? "text-violet-700" : "text-violet-900"}`}
    >
      <button
        type="button"
        onClick={() => toggleSort(key)}
        className="inline-flex items-center gap-1 hover:underline"
      >
        {label}
        <span className="tabular-nums text-[10px] text-violet-600">
          {sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : "◆"}
        </span>
      </button>
    </th>
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );
  const from = sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, sorted.length);

  const exportCsv = useCallback(() => {
    const headers = [
      "ถูกย้ายมาแล้ว",
      "PO ลูกค้า",
      "หมายเลขบริการ",
      "ชื่องาน",
      "ช่าง",
      "ฝ่ายขาย",
      "ชื่อลูกค้า",
    ];
    const lines = [
      headers.join(","),
      ...sorted.map((r) =>
        [
          `"${String(r.daysMoved).replace(/"/g, '""')} วัน"`,
          `"${String(r.customerPo).replace(/"/g, '""')}"`,
          `"${String(r.serviceNo).replace(/"/g, '""')}"`,
          `"${String(r.jobName).replace(/"/g, '""')}"`,
          `"${String(r.engineer).replace(/"/g, '""')}"`,
          `"${String(r.sales).replace(/"/g, '""')}"`,
          `"${String(r.customer).replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ];
    const blob = new Blob(["\ufeff" + lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "purchase-system.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [sorted]);

  const copyTable = useCallback(async () => {
    const headers = [
      "ถูกย้ายมาแล้ว",
      "PO ลูกค้า",
      "หมายเลขบริการ",
      "ชื่องาน",
      "ช่าง",
      "ฝ่ายขาย",
      "ชื่อลูกค้า",
    ];
    const lines = [
      headers.join("\t"),
      ...sorted.map((r) =>
        [
          `${r.daysMoved} วัน`,
          r.customerPo,
          r.serviceNo,
          r.jobName,
          r.engineer,
          r.sales,
          r.customer,
        ].join("\t")
      ),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
    } catch {
      /* ignore */
    }
  }, [sorted]);

  return (
    <DeptPageFrame>
      <DeptPageHeader
        deptId="sales"
        titleTh="ระบบสั่งซื้อ"
        titleEn="Purchase"
        dashboardPath="/dept/sales/dashboard"
        workPath="/dept/sales/work"
        reportPath="/dept/sales/report"
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => copyTable()}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Copy
          </button>
          <button
            type="button"
            onClick={() =>
              alert("Excel: ใช้ Export CSV แล้วเปิดใน Excel ก่อน")
            }
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Excel
          </button>
          <button
            type="button"
            onClick={() => exportCsv()}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            CSV
          </button>
          <button
            type="button"
            onClick={() => alert("PDF — เร็วๆ นี้")}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            PDF
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Search:
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-48 max-w-[40vw] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm shadow-sm"
          />
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr>
              {thSort("ถูกย้ายมาแล้ว", "daysMoved", true)}
              {thSort("PO ลูกค้า", "customerPo")}
              {thSort("หมายเลขบริการ", "serviceNo")}
              {thSort("ชื่องาน", "jobName")}
              {thSort("ช่าง", "engineer")}
              {thSort("ฝ่ายขาย", "sales")}
              {thSort("ชื่อลูกค้า", "customer")}
              <th className="border-b border-violet-200 bg-violet-50 px-3 py-2.5 text-center text-xs font-semibold text-violet-900">
                CHAT
              </th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-slate-100 odd:bg-white even:bg-slate-50/50"
              >
                <td className="whitespace-nowrap px-3 py-2.5 text-slate-800">
                  {r.daysMoved} วัน
                </td>
                <td className="max-w-[140px] px-3 py-2.5 font-medium text-slate-900">
                  {r.customerPo || "—"}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 font-medium text-violet-700">
                  {r.serviceNo}
                </td>
                <td className="max-w-[min(28rem,50vw)] px-3 py-2.5 text-slate-800">
                  {r.jobName}
                </td>
                <td className="px-3 py-2.5 text-slate-600">
                  {r.engineer || "—"}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-slate-800">
                  {r.sales}
                </td>
                <td className="max-w-[min(20rem,40vw)] px-3 py-2.5 text-slate-800">
                  {r.customer}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-500 text-white shadow-sm transition hover:bg-teal-600"
                    aria-label="แชท"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">
            ยังไม่มีรายการในตารางสั่งซื้อ
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <span>
          Showing {from} to {to} of {sorted.length} entries
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm enabled:hover:bg-slate-50 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="inline-flex min-w-[2rem] items-center justify-center rounded-lg bg-violet-600 px-3 py-1.5 font-semibold text-white shadow-sm">
            {safePage}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm enabled:hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </DeptPageFrame>
  );
}
