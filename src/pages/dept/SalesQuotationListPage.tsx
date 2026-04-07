import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageSquare, FileText } from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import { hasFullDepartmentAccess } from "../../auth/deptAccess";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptPageHeader } from "../../components/dept/DeptPageHeader";
import {
  QuotationListPeriodMenu,
  quotationRowInPeriod,
  type QuotationListPeriod,
} from "../../components/dept/QuotationListPeriodMenu";
import { useAuth } from "../../context/AuthContext";
import { useMnsConnection } from "../../context/MnsConnectionContext";
import { getQuotationStage } from "../../data/quotationStages";
import type { DbJobRow } from "../../lib/mapMnsDb";
import { mnsFetch } from "../../services/mnsApi";
import { isSalesDeptUser } from "../../utils/salesDeptUsers";

function parseModified(raw: string): Date | null {
  if (!raw?.trim()) return null;
  const d = new Date(raw.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysInStageLabel(modifiedRaw: string): string {
  const d = parseModified(modifiedRaw);
  if (!d) return "—";
  const diff = Date.now() - d.getTime();
  const days = Math.max(0, Math.floor(diff / 86400000));
  return `${days} วัน`;
}

type SortKey =
  | "modified"
  | "service"
  | "job"
  | "sn"
  | "engineer"
  | "sales"
  | "customer";

type ReceiveLineKind = "production" | "repair" | "develop";

/** แยกประเภทจากหมายเลขบริการ เช่น (S) ผลิต / (R) ซ่อม — ปรับกติกาได้เมื่อมีฟิลด์ใน DB */
function inferReceiveLineKind(serviceId: string | undefined): ReceiveLineKind {
  const u = (serviceId ?? "").toUpperCase();
  if (/\(R\)/.test(u)) return "repair";
  if (/\(D\)/.test(u) || /\(DEV\)/.test(u)) return "develop";
  return "production";
}

const RECEIVE_CATEGORY_META: Record<
  ReceiveLineKind,
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

export function SalesQuotationListPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const conn = useMnsConnection();
  const full = user ? hasFullDepartmentAccess(user) : false;

  const stage = getQuotationStage(slug);

  const [rowsRaw, setRowsRaw] = useState<DbJobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [period, setPeriod] = useState<QuotationListPeriod>("month");
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [quarter, setQuarter] = useState(
    () => Math.floor(new Date().getMonth() / 3) + 1
  );

  const [filterSaleId, setFilterSaleId] = useState<number | null>(null);
  const [adminSaleOptions, setAdminSaleOptions] = useState<
    { user_id: number; label: string }[]
  >([]);

  const [sortKey, setSortKey] = useState<SortKey>("modified");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [receiveCategory, setReceiveCategory] = useState<
    ReceiveLineKind | "all"
  >("all");

  useEffect(() => {
    if (!full || !conn.ready || !conn.apiOk || !conn.db) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await mnsFetch<{
          ok?: boolean;
          rows?: {
            user_id: number;
            fname: string;
            lname: string;
            user_gid?: number;
            group_name?: string;
          }[];
        }>("/users");
        if (cancelled || !res?.rows?.length) return;
        const salesOnly = res.rows.filter(isSalesDeptUser);
        setAdminSaleOptions(
          salesOnly.map((r) => ({
            user_id: r.user_id,
            label:
              `${String(r.fname ?? "").trim()} ${String(r.lname ?? "").trim()}`.trim() ||
              `ผู้ใช้ ${r.user_id}`,
          }))
        );
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [full, conn.ready, conn.apiOk, conn.db]);

  useEffect(() => {
    if (!stage || !conn.ready) return;
    if (!conn.apiOk || !conn.db) {
      setRowsRaw([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const q = new URLSearchParams({
          job_status: String(stage.wsId),
          limit: "800",
        });
        if (full && filterSaleId) q.set("sale_id", String(filterSaleId));
        const res = await mnsFetch<{ ok?: boolean; rows?: DbJobRow[] }>(
          `/jobs?${q}`
        );
        if (cancelled) return;
        setRowsRaw(res.rows ?? []);
      } catch {
        if (!cancelled) setRowsRaw([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stage, conn.ready, conn.apiOk, conn.db, full, filterSaleId]);

  useEffect(() => {
    setPage(1);
  }, [search, period, year, month, quarter, stage?.slug, filterSaleId]);

  useEffect(() => {
    setReceiveCategory("all");
  }, [stage?.slug]);

  useEffect(() => {
    setPage(1);
  }, [receiveCategory]);

  const periodSearchFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rowsRaw.filter((r) =>
      quotationRowInPeriod(r.modified ?? "", period, year, month, quarter)
    );
    if (q) {
      list = list.filter((r) => {
        const hay = [
          r.service_id,
          r.product_name,
          r.customer_name,
          r.sn,
          r.sales_name,
          r.engineer_name,
        ]
          .map((x) => String(x ?? "").toLowerCase())
          .join(" ");
        return hay.includes(q);
      });
    }
    return list;
  }, [rowsRaw, search, period, year, month, quarter]);

  const receiveKindCounts = useMemo(() => {
    const c = { production: 0, repair: 0, develop: 0 };
    for (const r of periodSearchFiltered) {
      c[inferReceiveLineKind(r.service_id)] += 1;
    }
    return c;
  }, [periodSearchFiltered]);

  const categoryFiltered = useMemo(() => {
    if (stage?.slug !== "receive" || receiveCategory === "all") {
      return periodSearchFiltered;
    }
    return periodSearchFiltered.filter(
      (r) => inferReceiveLineKind(r.service_id) === receiveCategory
    );
  }, [stage?.slug, receiveCategory, periodSearchFiltered]);

  const filteredSorted = useMemo(() => {
    const list = categoryFiltered;
    const dir = sortDir === "asc" ? 1 : -1;
    const sorted = [...list].sort((a, b) => {
      switch (sortKey) {
        case "service":
          return (
            String(a.service_id ?? "").localeCompare(
              String(b.service_id ?? ""),
              "th"
            ) * dir
          );
        case "job":
          return (
            String(a.product_name ?? "").localeCompare(
              String(b.product_name ?? ""),
              "th"
            ) * dir
          );
        case "sn":
          return (
            String(a.sn ?? "").localeCompare(String(b.sn ?? ""), "th") * dir
          );
        case "engineer":
          return (
            String(a.engineer_name ?? "").localeCompare(
              String(b.engineer_name ?? ""),
              "th"
            ) * dir
          );
        case "sales":
          return (
            String(a.sales_name ?? "").localeCompare(
              String(b.sales_name ?? ""),
              "th"
            ) * dir
          );
        case "customer":
          return (
            String(a.customer_name ?? "").localeCompare(
              String(b.customer_name ?? ""),
              "th"
            ) * dir
          );
        case "modified":
        default: {
          const ta = parseModified(a.modified ?? "")?.getTime() ?? 0;
          const tb = parseModified(b.modified ?? "")?.getTime() ?? 0;
          return (ta - tb) * dir;
        }
      }
    });
    return sorted;
  }, [categoryFiltered, sortKey, sortDir]);

  const totalEntries = filteredSorted.length;
  const showReceivePlaceholderRow =
    stage?.slug === "receive" && !loading && rowsRaw.length === 0;
  const showReceiveFilterEmpty =
    stage?.slug === "receive" &&
    !loading &&
    rowsRaw.length > 0 &&
    filteredSorted.length === 0;

  const displayTotalEntries = showReceivePlaceholderRow ? 1 : totalEntries;
  const totalPages = Math.max(1, Math.ceil(displayTotalEntries / pageSize));
  const pageClamped = Math.min(page, totalPages);
  const pageRows = showReceivePlaceholderRow
    ? []
    : filteredSorted.slice(
        (pageClamped - 1) * pageSize,
        pageClamped * pageSize
      );

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

  const exportCsv = useCallback(() => {
    const c = stage?.columns;
    if (!c) return;
    const headers: string[] = [];
    if (c.movedDays) headers.push("ถูกย้ายมาแล้ว");
    if (c.serviceNo) headers.push("หมายเลขบริการ");
    if (c.jobName) headers.push("ชื่องาน");
    if (c.sn) headers.push("SN");
    if (c.engineer) headers.push("ช่าง");
    if (c.sales) headers.push("ฝ่ายขาย");
    if (c.customer) headers.push("ชื่อลูกค้า");
    const placeholderReceiveRow =
      stage?.slug === "receive" &&
      rowsRaw.length === 0 &&
      filteredSorted.length === 0;
    const dashCsv = headers.map(() => `"—"`);
    const lines = [
      headers.join(","),
      ...(placeholderReceiveRow
        ? [dashCsv.join(",")]
        : filteredSorted.map((r) => {
            const cells: string[] = [];
            if (c.movedDays)
              cells.push(
                `"${daysInStageLabel(r.modified ?? "").replace(/"/g, '""')}"`
              );
            if (c.serviceNo)
              cells.push(`"${String(r.service_id ?? "").replace(/"/g, '""')}"`);
            if (c.jobName)
              cells.push(`"${String(r.product_name ?? "").replace(/"/g, '""')}"`);
            if (c.sn) cells.push(`"${String(r.sn ?? "").replace(/"/g, '""')}"`);
            if (c.engineer)
              cells.push(`"${String(r.engineer_name ?? "").replace(/"/g, '""')}"`);
            if (c.sales)
              cells.push(`"${String(r.sales_name ?? "").replace(/"/g, '""')}"`);
            if (c.customer)
              cells.push(`"${String(r.customer_name ?? "").replace(/"/g, '""')}"`);
            return cells.join(",");
          })),
    ];
    const blob = new Blob(["\ufeff" + lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quotation-${stage?.slug ?? "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredSorted, stage, rowsRaw.length]);

  const copyTable = useCallback(async () => {
    const c = stage?.columns;
    if (!c) return;
    const headers: string[] = [];
    if (c.movedDays) headers.push("ถูกย้ายมาแล้ว");
    if (c.serviceNo) headers.push("หมายเลขบริการ");
    if (c.jobName) headers.push("ชื่องาน");
    if (c.sn) headers.push("SN");
    if (c.engineer) headers.push("ช่าง");
    if (c.sales) headers.push("ฝ่ายขาย");
    if (c.customer) headers.push("ชื่อลูกค้า");
    const placeholderReceiveRow =
      stage?.slug === "receive" &&
      rowsRaw.length === 0 &&
      filteredSorted.length === 0;
    const dashTab = headers.map(() => "—").join("\t");
    const lines = [
      headers.join("\t"),
      ...(placeholderReceiveRow
        ? [dashTab]
        : filteredSorted.map((r) => {
            const cells: string[] = [];
            if (c.movedDays) cells.push(daysInStageLabel(r.modified ?? ""));
            if (c.serviceNo) cells.push(String(r.service_id ?? ""));
            if (c.jobName) cells.push(String(r.product_name ?? ""));
            if (c.sn) cells.push(String(r.sn ?? ""));
            if (c.engineer) cells.push(String(r.engineer_name ?? ""));
            if (c.sales) cells.push(String(r.sales_name ?? ""));
            if (c.customer) cells.push(String(r.customer_name ?? ""));
            return cells.join("\t");
          })),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
    } catch {
      /* ignore */
    }
  }, [filteredSorted, stage, rowsRaw.length]);

  if (!stage) {
    return <Navigate to="/dept/sales/dashboard" replace />;
  }

  const col = stage.columns;
  const colCount =
    [
      col.movedDays,
      col.serviceNo,
      col.jobName,
      col.sn,
      col.engineer,
      col.sales,
      col.customer,
      col.quotationCTA,
      col.manage,
      col.chat,
    ].filter(Boolean).length;

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

  const exportToolbar = (
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
        onClick={() => alert("Excel: ใช้ Export CSV แล้วเปิดใน Excel ก่อน")}
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
  );

  const searchField = (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      Search:
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-48 max-w-[40vw] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm shadow-sm"
      />
    </label>
  );

  return (
    <DeptPageFrame>
      <DeptPageHeader
        deptId="sales"
        titleTh={stage.titleTh}
        titleEn={stage.titleEn}
        dashboardPath="/dept/sales/dashboard"
        workPath="/dept/sales/work"
        reportPath="/dept/sales/report"
      />

      {stage.slug === "receive" ? (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            {exportToolbar}
            {searchField}
          </div>
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            {(["production", "repair", "develop"] as const).map((key) => {
              const meta = RECEIVE_CATEGORY_META[key];
              const active = receiveCategory === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setReceiveCategory((f) => (f === key ? "all" : key));
                    setPage(1);
                  }}
                  className={`relative min-h-[88px] rounded-2xl px-4 py-4 text-left text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 ${
                    meta.chip
                  } ${active ? "ring-4 ring-violet-300/90 ring-offset-2" : "hover:brightness-105"}`}
                >
                  <span
                    className={`absolute right-3 top-3 flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-bold text-white shadow ${meta.badge}`}
                  >
                    {receiveKindCounts[key]}
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
        </>
      ) : (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <QuotationListPeriodMenu
              period={period}
              year={year}
              month={month}
              quarter={quarter}
              onPeriodChange={setPeriod}
              onYearChange={setYear}
              onMonthChange={setMonth}
              onQuarterChange={setQuarter}
            />
            {exportToolbar}
          </div>
          {searchField}
        </div>
      )}

      {full && conn.db && conn.apiOk ? (
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-violet-100 bg-violet-50/40 px-4 py-3 text-sm">
          <span className="font-medium text-violet-950">ผู้ดูแล — กรองฝ่ายขาย</span>
          <select
            value={filterSaleId ?? ""}
            onChange={(e) =>
              setFilterSaleId(e.target.value ? Number(e.target.value) : null)
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
          >
            <option value="">ทุกคนในรายการ</option>
            {adminSaleOptions.map((o) => (
              <option key={o.user_id} value={o.user_id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">กำลังโหลด…</p>
        ) : (
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr>
                {col.movedDays
                  ? thSort(
                      "ถูกย้ายมาแล้ว",
                      "modified",
                      stage.slug === "receive"
                    )
                  : null}
                {col.serviceNo ? thSort("หมายเลขบริการ", "service") : null}
                {col.jobName ? thSort("ชื่องาน", "job") : null}
                {col.sn ? thSort("SN", "sn") : null}
                {col.engineer ? thSort("ช่าง", "engineer") : null}
                {col.sales ? thSort("ฝ่ายขาย", "sales") : null}
                {col.customer ? thSort("ชื่อลูกค้า", "customer") : null}
                {col.quotationCTA ? (
                  <th className="border-b border-violet-200 bg-violet-50 px-3 py-2.5 text-left text-xs font-semibold text-violet-900">
                    ใบเสนอราคา
                  </th>
                ) : null}
                {col.manage ? (
                  <th className="border-b border-violet-200 bg-violet-50 px-3 py-2.5 text-left text-xs font-semibold text-violet-900">
                    จัดการ
                  </th>
                ) : null}
                {col.chat ? (
                  <th className="border-b border-violet-200 bg-violet-50 px-3 py-2.5 text-center text-xs font-semibold text-violet-900">
                    CHAT
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {showReceivePlaceholderRow ? (
                <tr className="border-b border-slate-100">
                  {col.movedDays ? (
                    <td className="px-3 py-2.5 text-slate-400">—</td>
                  ) : null}
                  {col.serviceNo ? (
                    <td className="px-3 py-2.5 text-slate-400">—</td>
                  ) : null}
                  {col.jobName ? (
                    <td className="px-3 py-2.5 text-slate-400">—</td>
                  ) : null}
                  {col.sn ? (
                    <td className="px-3 py-2.5 text-slate-400">—</td>
                  ) : null}
                  {col.engineer ? (
                    <td className="px-3 py-2.5 text-slate-400">—</td>
                  ) : null}
                  {col.sales ? (
                    <td className="px-3 py-2.5 text-slate-400">—</td>
                  ) : null}
                  {col.customer ? (
                    <td className="px-3 py-2.5 text-slate-400">—</td>
                  ) : null}
                  {col.quotationCTA ? (
                    <td className="px-3 py-2.5 text-slate-400">—</td>
                  ) : null}
                  {col.manage ? (
                    <td className="px-3 py-2.5 text-slate-400">—</td>
                  ) : null}
                  {col.chat ? (
                    <td className="px-3 py-2.5 text-center text-slate-400">
                      —
                    </td>
                  ) : null}
                </tr>
              ) : showReceiveFilterEmpty ? (
                <tr>
                  <td
                    colSpan={Math.max(1, colCount)}
                    className="px-3 py-8 text-center text-slate-400"
                  >
                    ไม่มีรายการในตัวกรองนี้
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={Math.max(1, colCount)}
                    className="px-3 py-8 text-center text-slate-400"
                  >
                    ไม่มีข้อมูลในช่วงที่เลือก
                  </td>
                </tr>
              ) : (
                pageRows.map((r) => (
                  <tr
                    key={r.job_id}
                    className="border-b border-slate-100 hover:bg-slate-50/80"
                  >
                    {col.movedDays ? (
                      <td className="px-3 py-2.5 text-slate-700">
                        {daysInStageLabel(r.modified ?? "")}
                      </td>
                    ) : null}
                    {col.serviceNo ? (
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          className="font-medium text-violet-700 hover:underline"
                        >
                          {r.service_id || "—"}
                        </button>
                      </td>
                    ) : null}
                    {col.jobName ? (
                      <td className="max-w-[14rem] truncate px-3 py-2.5 text-slate-800">
                        {r.product_name || "—"}
                      </td>
                    ) : null}
                    {col.sn ? (
                      <td className="px-3 py-2.5 text-slate-600">
                        {(r.sn ?? "").trim() || "—"}
                      </td>
                    ) : null}
                    {col.engineer ? (
                      <td className="px-3 py-2.5 text-slate-700">
                        {(r.engineer_name ?? "").trim() || "—"}
                      </td>
                    ) : null}
                    {col.sales ? (
                      <td className="px-3 py-2.5 text-slate-700">
                        {(r.sales_name ?? "").trim() || "—"}
                      </td>
                    ) : null}
                    {col.customer ? (
                      <td className="max-w-[14rem] truncate px-3 py-2.5 text-slate-700">
                        {(r.customer_name ?? "").trim() || "—"}
                      </td>
                    ) : null}
                    {col.quotationCTA ? (
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white shadow hover:bg-violet-700"
                        >
                          กรุณาทำใบเสนอราคา
                        </button>
                      </td>
                    ) : null}
                    {col.manage ? (
                      <td className="px-3 py-2.5">
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white shadow hover:bg-orange-600"
                          aria-label="จัดการ"
                        >
                          <FileText className="h-4 w-4" aria-hidden />
                        </button>
                      </td>
                    ) : null}
                    {col.chat ? (
                      <td className="px-3 py-2.5 text-center">
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500 text-white shadow hover:bg-teal-600"
                          aria-label="CHAT"
                        >
                          <MessageSquare className="h-4 w-4" aria-hidden />
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
        <span>
          {showReceivePlaceholderRow
            ? "Showing 1 to 1 of 1 entries"
            : displayTotalEntries === 0
              ? "Showing 0 to 0 of 0 entries"
              : `Showing ${(pageClamped - 1) * pageSize + 1} to ${Math.min(
                  pageClamped * pageSize,
                  displayTotalEntries
                )} of ${displayTotalEntries} entries`}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pageClamped <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-violet-600 px-2 text-sm font-bold text-white">
            {pageClamped}
          </span>
          <button
            type="button"
            disabled={pageClamped >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </DeptPageFrame>
  );
}
