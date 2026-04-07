import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Package,
  Settings2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import {
  SALES_REQUIREMENTS_SEED,
  type SalesRequirementRow,
  type SalesRequirementStatus,
} from "../../data/salesRequirementsSeed";

const STATUS_TABS: {
  id: SalesRequirementStatus;
  label: string;
  active: string;
  inactive: string;
  Icon: typeof MessageCircle;
}[] = [
  {
    id: "prod_pending",
    label: "ฝ่ายผลิตยังไม่ได้ดำเนินการ",
    active: "bg-sky-600 ring-2 ring-sky-300",
    inactive: "bg-slate-500 hover:bg-slate-600",
    Icon: MessageCircle,
  },
  {
    id: "prod_progress",
    label: "ฝ่ายผลิตกำลังดำเนินการ",
    active: "bg-amber-500 ring-2 ring-amber-200",
    inactive: "bg-amber-400/90 hover:bg-amber-500",
    Icon: Settings2,
  },
  {
    id: "manufacturing",
    label: "กำลังดำเนินการผลิต",
    active: "bg-orange-500 ring-2 ring-orange-200",
    inactive: "bg-orange-400 hover:bg-orange-500",
    Icon: Settings2,
  },
  {
    id: "not_ready",
    label: "ของไม่พร้อมส่ง",
    active: "bg-red-500 ring-2 ring-red-200",
    inactive: "bg-red-400 hover:bg-red-500",
    Icon: Package,
  },
  {
    id: "ready",
    label: "ของพร้อมส่ง",
    active: "bg-emerald-600 ring-2 ring-emerald-200",
    inactive: "bg-emerald-500 hover:bg-emerald-600",
    Icon: Package,
  },
];

const PAGE_SIZES = [10, 25, 50, 100];

function formatThDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function matchesSearch(row: SalesRequirementRow, q: string) {
  if (!q.trim()) return true;
  const s = q.toLowerCase();
  return [
    row.customerPo,
    row.serviceNo,
    row.jobName,
    row.customerName,
    row.salesPerson,
    row.productionJob,
  ]
    .join(" ")
    .toLowerCase()
    .includes(s);
}

export function SalesRequirementsPage() {
  const location = useLocation();
  const backHref =
    (location.state as { from?: string } | null)?.from ??
    "/dept/sales/dashboard";

  const [status, setStatus] = useState<SalesRequirementStatus>("prod_pending");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return SALES_REQUIREMENTS_SEED.filter(
      (r) => r.status === status && matchesSearch(r, search)
    );
  }, [status, search]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const slice = filtered.slice(start, start + pageSize);
  const showingFrom = total === 0 ? 0 : start + 1;
  const showingTo = total === 0 ? 0 : Math.min(start + pageSize, total);

  return (
    <DeptPageFrame>
      <div className="mb-4">
        <Link
          to={backHref}
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          กลับ
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-6">
        <header className="mb-6 border-b border-slate-100 pb-4">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            ความต้องการฝ่ายขาย
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">Requirement Sale</p>
        </header>

        <div className="mb-5 flex flex-wrap gap-2">
          {STATUS_TABS.map(({ id, label, active, inactive, Icon }) => {
            const isOn = status === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setStatus(id);
                  setPage(1);
                }}
                className={`flex min-h-[48px] flex-1 min-w-[140px] items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-center text-xs font-bold text-white shadow-md transition sm:min-w-[160px] sm:text-sm ${isOn ? active : inactive}`}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
                <span className="leading-tight">{label}</span>
              </button>
            );
          })}
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-600">Export:</span>
            {(["Copy", "Excel", "CSV", "PDF"] as const).map((label) => (
              <button
                key={label}
                type="button"
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-white"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Show
              <span className="relative inline-block">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-slate-800 shadow-sm"
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </span>
              entries
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Search:
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-48 rounded-lg border border-slate-200 px-3 py-1.5 text-sm shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 sm:w-56"
                placeholder=""
              />
            </label>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-[1200px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-violet-100/90 text-slate-800">
                <th className="whitespace-nowrap px-3 py-3 font-semibold">
                  ลำดับที่
                </th>
                <th className="whitespace-nowrap px-3 py-3 font-semibold">
                  PO ลูกค้า
                </th>
                <th className="whitespace-nowrap px-3 py-3 font-semibold">
                  หมายเลขบริการ
                </th>
                <th className="min-w-[140px] px-3 py-3 font-semibold">
                  ชื่องาน
                </th>
                <th className="whitespace-nowrap px-3 py-3 font-semibold">
                  จำนวน
                </th>
                <th className="min-w-[160px] px-3 py-3 font-semibold">
                  ชื่อลูกค้า
                </th>
                <th className="whitespace-nowrap px-3 py-3 font-semibold">
                  วันที่ต้องการ
                </th>
                <th className="whitespace-nowrap px-3 py-3 font-semibold">
                  วันที่ผลิตเสร็จ
                </th>
                <th className="whitespace-nowrap px-3 py-3 font-semibold">
                  จำนวนของในคลัง
                </th>
                <th className="whitespace-nowrap px-3 py-3 font-semibold">
                  ถูกย้ายมาแล้ว
                </th>
                <th className="whitespace-nowrap px-3 py-3 font-semibold">
                  JOB ที่ผลิต
                </th>
                <th className="whitespace-nowrap px-3 py-3 font-semibold">
                  ฝ่ายขาย
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-center font-semibold">
                  CHAT
                </th>
                <th className="whitespace-nowrap px-3 py-3 text-center font-semibold">
                  ปัญหา
                </th>
                <th className="w-14 px-2 py-3" aria-label="ดำเนินการ" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {slice.length === 0 ? (
                <tr>
                  <td
                    colSpan={15}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    ไม่มีรายการ
                  </td>
                </tr>
              ) : (
                slice.map((row, i) => (
                  <tr key={row.id} className="hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-slate-700">
                      {start + i + 1}
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        className="font-medium text-sky-600 hover:underline"
                      >
                        {row.customerPo}
                      </button>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        className="font-medium text-violet-600 hover:underline"
                      >
                        {row.serviceNo}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-slate-800">{row.jobName}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-slate-700">
                      {row.qtyDone} / {row.qtyTotal}
                    </td>
                    <td className="max-w-[220px] px-3 py-2.5 text-slate-700">
                      <span className="line-clamp-2">{row.customerName}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                      {row.requiredDate}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <input
                        type="text"
                        defaultValue={formatThDate(row.completionDate)}
                        className="w-[108px] rounded-md border border-slate-200 px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <span className="font-semibold text-red-600">
                        {row.stockQty}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                      {row.movedDays} วัน
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="text"
                        defaultValue={row.productionJob}
                        placeholder=""
                        className="w-full min-w-[100px] rounded-md border border-slate-200 px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                      {row.salesPerson}
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 text-white shadow hover:bg-cyan-600"
                        aria-label="แชท"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 text-white shadow hover:bg-cyan-600"
                        aria-label="ปัญหา"
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500 text-white shadow hover:bg-violet-600"
                        aria-label="ถัดไป"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {showingFrom} to {showingTo} of {total} entries
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium disabled:opacity-40"
            >
              Previous
            </button>
            <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white shadow">
              {safePage}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </footer>
      </div>
    </DeptPageFrame>
  );
}
