import { useMemo, useState } from "react";
import { Boxes, ChevronDown } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptSubPageHeader } from "../../components/dept/DeptSubPageHeader";
import { WarehouseExportToolbar } from "../../components/warehouse/WarehouseExportToolbar";

type ApproveExpenseRow = {
  id: string;
  budgetType: string;
  refNo: string;
  payType: string;
  vendor: string;
  total: string;
  dueDate: string;
  note: string;
  hasAttachment: boolean;
};

const MANAGEMENT_ROWS: ApproveExpenseRow[] = [
  {
    id: "m1",
    budgetType: "รายการบริหาร",
    refNo: "EXPM690858",
    payType: "จ้างบริษัท",
    vendor: "บริษัท คอมมะเช่ง จำกัด (มหาชน) (สำนักงานใหญ่)",
    total: "20,900.00",
    dueDate: "2026-04-02",
    note: "",
    hasAttachment: true,
  },
];

const PRODUCTION_ROWS: ApproveExpenseRow[] = [];

export function AccountingApproveExpensePage() {
  const [searchParams] = useSearchParams();
  const kind = searchParams.get("kind") === "production" ? "production" : "management";
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("ทั้งหมด");
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");

  const baseRows = kind === "production" ? PRODUCTION_ROWS : MANAGEMENT_ROWS;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return baseRows.filter((r) => {
      if (statusFilter !== "ทั้งหมด" && r.budgetType !== statusFilter) return false;
      if (companyFilter !== "ทั้งหมด" && !r.vendor.includes(companyFilter)) return false;
      if (!q) return true;
      return [r.refNo, r.payType, r.vendor, r.total, r.dueDate, r.note]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [baseRows, search, companyFilter, statusFilter]);

  const titleTh =
    kind === "production" ? "อนุมัติ ( รายการสั่งซื้ออะไหล่ )" : "อนุมัติ ( รายการบริหาร )";

  const matrix = {
    head: [
      "ลำดับ",
      "งบประมาณรายการ",
      "เลขที่อ้างอิงเอกสาร",
      "ประเภทการจ่าย",
      "ร้านค้า",
      "ราคารวม",
      "วันครบกำหนด",
      "หมายเหตุ",
      "ไฟล์แนบ",
      "CHAT",
    ],
    rows: filtered.map((r, i) => [
      String(i + 1),
      r.budgetType,
      r.refNo,
      r.payType,
      r.vendor,
      r.total,
      r.dueDate,
      r.note,
      r.hasAttachment ? "มีไฟล์แนบ" : "ไม่มีไฟล์แนบ",
      "",
    ]),
  };

  return (
    <DeptPageFrame>
      <DeptSubPageHeader
        backTo="/dept/accounting"
        backLabel="แผนกบัญชี"
        titleTh={titleTh}
        titleEn="Approve"
        titleThClassName="text-xl font-bold tracking-tight text-rose-700 sm:text-2xl"
      />

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">บริษัท</p>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="ทั้งหมด">ทั้งหมด</option>
                <option value="สำนักงานใหญ่">สำนักงานใหญ่</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            <Boxes className="h-4 w-4" />
            Filter
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <WarehouseExportToolbar
          search={search}
          onSearchChange={setSearch}
          matrixForExport={matrix}
          exportBasename="accounting-approve-expense"
          extraEnd={
            <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
              <span className="text-sm text-slate-600">ชนิดรายการ :</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="ทั้งหมด">ทั้งหมด</option>
                <option value="รายการบริหาร">รายการบริหาร</option>
                <option value="รายการสั่งซื้ออะไหล่">รายการสั่งซื้ออะไหล่</option>
              </select>
              <button
                type="button"
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                ค้นหา
              </button>
            </div>
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px] border-collapse text-sm">
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
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={matrix.head.length}
                    className="border-b border-slate-100 px-3 py-8 text-center text-slate-400"
                  >
                    -
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => (
                  <tr key={r.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                    <td className="border-b border-slate-100 px-3 py-2.5">{idx + 1}</td>
                    <td className="border-b border-slate-100 px-3 py-2.5">{r.budgetType}</td>
                    <td className="border-b border-slate-100 px-3 py-2.5 text-violet-600">
                      {r.refNo}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2.5">{r.payType}</td>
                    <td className="max-w-[300px] border-b border-slate-100 px-3 py-2.5">
                      {r.vendor}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2.5 text-right tabular-nums">
                      {r.total}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2.5">{r.dueDate}</td>
                    <td className="border-b border-slate-100 px-3 py-2.5">
                      <input
                        type="text"
                        defaultValue={r.note}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5"
                      />
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2.5">
                      <button
                        type="button"
                        className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        ไฟล์แนบ
                      </button>
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2.5">
                      <button
                        type="button"
                        className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white"
                      >
                        💬
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-600">
          <span>
            {filtered.length === 0
              ? "Showing 0 to 0 of 0 entries"
              : `Showing 1 to ${filtered.length} of ${filtered.length} entries`}
          </span>
          <div className="flex gap-1">
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
    </DeptPageFrame>
  );
}
