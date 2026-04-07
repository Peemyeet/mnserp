import { useCallback, useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptPageHeader } from "../../components/dept/DeptPageHeader";

type PoCategory = "production" | "repair" | "develop";

type PoArrivedRow = {
  id: number;
  category: PoCategory;
  daysMoved: number;
  customerPo: string;
  serviceNo: string;
  jobName: string;
  engineer: string;
  sales: string;
  customer: string;
  qtyDone: number;
  qtyTotal: number;
  stockQty: number;
};

/** ตัวอย่างข้อมูล — เชื่อม API จริงเมื่อพร้อม */
const MOCK_ROWS: PoArrivedRow[] = [
  {
    id: 1,
    category: "production",
    daysMoved: 64,
    customerPo: "TH5805-P219948",
    serviceNo: "MG692935 (S)",
    jobName: "Assy,Cable,Pogo Pin",
    engineer: "",
    sales: "เจริญ คิดโสดา",
    customer: "Western Digital Storage Technologies (Thailand) Ltd.",
    qtyDone: 0,
    qtyTotal: 2,
    stockQty: 0,
  },
  {
    id: 2,
    category: "repair",
    daysMoved: 83,
    customerPo: "6000139271",
    serviceNo: "ST883201 (R)",
    jobName: "COML,PCB,COMPUTER FIFO PCB...",
    engineer: "",
    sales: "เจริญ คิดโสดา",
    customer: "Seagate Technology (Thailand) Ltd.",
    qtyDone: 0,
    qtyTotal: 5,
    stockQty: 0,
  },
];

const CATEGORY_META: Record<
  PoCategory,
  { th: string; en: string; chip: string; badge: string }
> = {
  production: {
    th: "ผลิต",
    en: "Production",
    chip:
      "border-teal-200/90 bg-gradient-to-br from-teal-500 to-cyan-600 shadow-md shadow-teal-500/25 ring-2 ring-white/30",
    badge: "bg-white/25",
  },
  repair: {
    th: "ซ่อม",
    en: "Repair",
    chip:
      "border-orange-200/90 bg-gradient-to-br from-orange-500 to-amber-600 shadow-md shadow-orange-500/25 ring-2 ring-white/30",
    badge: "bg-white/25",
  },
  develop: {
    th: "พัฒนา",
    en: "Develop",
    chip:
      "border-rose-200/90 bg-gradient-to-br from-rose-500 to-fuchsia-600 shadow-md shadow-rose-500/25 ring-2 ring-white/30",
    badge: "bg-white/25",
  },
};

function matchesSearch(row: PoArrivedRow, q: string): boolean {
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

type PoSortKey =
  | "daysMoved"
  | "customerPo"
  | "serviceNo"
  | "jobName"
  | "engineer"
  | "sales"
  | "customer"
  | "qty";

export function SalesPoArrivedPage() {
  const [filter, setFilter] = useState<PoCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [sortKey, setSortKey] = useState<PoSortKey>("daysMoved");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const counts = useMemo(() => {
    const c = { production: 0, repair: 0, develop: 0 };
    for (const r of MOCK_ROWS) c[r.category] += 1;
    return c;
  }, []);

  const filtered = useMemo(() => {
    return MOCK_ROWS.filter((r) => {
      if (filter !== "all" && r.category !== filter) return false;
      return matchesSearch(r, search);
    });
  }, [filter, search]);

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
        case "qty":
          cmp = a.qtyTotal - b.qtyTotal || a.qtyDone - b.qtyDone;
          break;
        default:
          cmp = 0;
      }
      return m * cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (k: PoSortKey) => {
    setSortKey((prev) => {
      if (prev === k) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortDir("asc");
      return k;
    });
  };

  const thSort = (label: string, key: PoSortKey, accent?: boolean) => (
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
      "จำนวน",
      "จำนวนในคลัง",
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
          `"${r.qtyDone} / ${r.qtyTotal}"`,
          `"${String(r.stockQty).replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ];
    const blob = new Blob(["\ufeff" + lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "po-arrived.csv";
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
      "จำนวน",
      "จำนวนในคลัง",
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
          `${r.qtyDone} / ${r.qtyTotal}`,
          String(r.stockQty),
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
        titleTh="PO มาแล้ว"
        titleEn="PO Already"
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

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {(["production", "repair", "develop"] as const).map((key) => {
          const meta = CATEGORY_META[key];
          const active = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setFilter((f) => (f === key ? "all" : key));
                setPage(1);
              }}
              className={`relative min-h-[88px] rounded-2xl px-4 py-4 text-left text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 ${
                meta.chip
              } ${active ? "ring-4 ring-violet-300/90 ring-offset-2" : "hover:brightness-105"}`}
            >
              <span
                className={`absolute right-3 top-3 flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-bold text-white shadow ${meta.badge}`}
              >
                {counts[key]}
              </span>
              <span className="block text-lg font-bold leading-tight">
                {meta.en}
              </span>
              <span className="mt-0.5 block text-sm font-medium text-white/90">
                {meta.th}
              </span>
            </button>
          );
        })}
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
              {thSort("จำนวน", "qty")}
              <th className="border-b border-violet-200 bg-violet-50 px-3 py-2.5 text-left text-xs font-semibold text-violet-900">
                จำนวนในคลัง
              </th>
              <th className="border-b border-violet-200 bg-violet-50 px-3 py-2.5 text-left text-xs font-semibold text-violet-900">
                จัดการ
              </th>
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
                  {r.customerPo}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-slate-800">
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
                <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-slate-800">
                  {r.qtyDone} / {r.qtyTotal}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-slate-800">
                  {r.stockQty}
                </td>
                <td className="px-3 py-2.5 text-slate-400">—</td>
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
            ไม่มีรายการในตัวกรองนี้
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
