import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptSubPageHeader } from "../../components/dept/DeptSubPageHeader";
import { WarehouseExportToolbar } from "../../components/warehouse/WarehouseExportToolbar";

const CARDS = [
  { id: "production", th: "ผลิต", en: "Production", tone: "bg-teal-500", count: 0 },
  { id: "repair", th: "ซ่อม", en: "Repair", tone: "bg-amber-500", count: 0 },
  { id: "develop", th: "พัฒนา", en: "Develop", tone: "bg-rose-500", count: 0 },
  { id: "equipment", th: "เครื่องมือ", en: "Equipment", tone: "bg-violet-500", count: 0 },
] as const;

const ROWS = [
  {
    id: "w0",
    week: "-",
    period: "-",
    amount: "-",
    detail: "-",
  },
];

export function AccountingPurchaseDocsPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<(typeof CARDS)[number]["id"] | "all">("all");
  const kind = searchParams.get("kind") === "production" ? "production" : "management";
  const titleSuffix = kind === "production" ? "ผลิต" : "บริหาร";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ROWS.filter((r) =>
      [r.week, r.period, r.amount, r.detail].join(" ").toLowerCase().includes(q)
    );
  }, [search]);

  const matrix = {
    head: ["ลำดับ", "WEEK", "ระหว่างวันที่", "จำนวนเงิน", "รายละเอียด"],
    rows: filtered.map((r, i) => [String(i + 1), r.week, r.period, r.amount, r.detail]),
  };

  return (
    <DeptPageFrame>
      <DeptSubPageHeader
        backTo="/dept/accounting"
        backLabel="แผนกบัญชี"
        titleTh={`ค้างชำระเงิน ( ${titleSuffix} )`}
        titleEn="แผนกจัดหา"
      />

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-4">
          <div>
            <p className="text-3xl font-bold tracking-tight text-slate-800">Report Week</p>
            <p className="text-sm text-slate-400">Report Expenditure</p>
          </div>
          <button
            type="button"
            onClick={() => setActive("all")}
            className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            รายการทั้งหมด
          </button>
        </div>

        <div className="grid gap-4 px-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(c.id)}
              className={`relative rounded-2xl px-5 py-4 text-left text-white shadow-sm transition hover:-translate-y-0.5 ${
                c.tone
              } ${active === c.id ? "ring-2 ring-offset-2 ring-slate-300" : ""}`}
            >
              {c.count > 0 ? (
                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-[10px] font-bold text-violet-700">
                  {c.count}
                </span>
              ) : null}
              <p className="text-3xl font-bold leading-none">{c.en}</p>
              <p className="mt-1 text-sm">{c.th}</p>
            </button>
          ))}
        </div>

        <WarehouseExportToolbar
          search={search}
          onSearchChange={setSearch}
          matrixForExport={matrix}
          exportBasename="accounting-purchase-docs"
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr>
                {matrix.head.map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-3 text-left text-xs font-semibold text-slate-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={r.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                  <td className="border-b border-slate-100 px-3 py-3">{idx + 1}</td>
                  <td className="border-b border-slate-100 px-3 py-3">{r.week}</td>
                  <td className="border-b border-slate-100 px-3 py-3">{r.period}</td>
                  <td className="border-b border-slate-100 px-3 py-3">{r.amount}</td>
                  <td className="border-b border-slate-100 px-3 py-3">{r.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-600">
          <span>Showing 1 to 1 of 1 entries</span>
          <div className="flex items-center gap-1">
            <button type="button" className="rounded border border-slate-200 px-3 py-1 opacity-40">
              Previous
            </button>
            <span className="rounded bg-violet-600 px-3 py-1 text-white">1</span>
            <button type="button" className="rounded border border-slate-200 px-3 py-1 opacity-40">
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-400">
        <Link to="/dept/accounting" className="no-underline hover:text-slate-600">
          กลับหน้าแผนกบัญชี
        </Link>
      </div>
    </DeptPageFrame>
  );
}
