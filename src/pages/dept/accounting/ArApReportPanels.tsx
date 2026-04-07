import { useState, type ReactNode } from "react";
import {
  Box,
  ChevronDown,
  Layers,
  Maximize2,
  MessageCircle,
  MessageSquare,
} from "lucide-react";

const fmtBaht = (n: number) =>
  new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

function SortArrows() {
  return (
    <span className="ml-0.5 inline-flex flex-col text-[9px] leading-none text-slate-400">
      <span aria-hidden>▲</span>
      <span aria-hidden>▼</span>
    </span>
  );
}

function FilterSelect({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-slate-600">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ExportBar({ searchLabel = "Search:" }: { searchLabel?: string }) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-1.5">
        {(["Copy", "Excel", "CSV", "PDF"] as const).map((t) => (
          <button
            key={t}
            type="button"
            className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-600">{searchLabel}</span>
        <input
          type="search"
          className="w-full min-w-[12rem] rounded border border-slate-200 px-2 py-1.5 text-sm sm:w-56"
          placeholder=""
        />
      </div>
    </div>
  );
}

/** รูปที่ 1 — รายการลูกหนี้ค้างรับ */
export function AccountsReceivableReportPanel() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">รายการลูกหนี้</h2>
          <p className="text-sm text-slate-500">Commission</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <Box className="h-4 w-4 text-slate-500" aria-hidden />
          Filter
          <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80">
        <div className="flex items-center gap-2 rounded-t-xl bg-violet-600 px-4 py-3 text-white">
          <MessageSquare className="h-5 w-5 shrink-0 opacity-95" aria-hidden />
          <span className="text-sm font-semibold tracking-wide">
            รายการ ลูกหนี้
          </span>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FilterSelect label="รหัสลูกหนี้">
              <input
                type="text"
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder=""
              />
            </FilterSelect>
            <FilterSelect label="ชื่อลูกหนี้">
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option>ทั้งหมด</option>
              </select>
            </FilterSelect>
            <FilterSelect label="วันที่เอกสาร">
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option>วันที่เปิดเอกสาร</option>
              </select>
            </FilterSelect>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <FilterSelect label="บริษัท">
                <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option>ทั้งหมด</option>
                </select>
              </FilterSelect>
              <FilterSelect label="เดือน">
                <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option>ทั้งหมด</option>
                </select>
              </FilterSelect>
              <FilterSelect label="ปี">
                <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option>2023</option>
                  <option>2024</option>
                  <option>2026</option>
                </select>
              </FilterSelect>
              <FilterSelect label="รายการ">
                <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option>ทั้งหมด</option>
                </select>
              </FilterSelect>
            </div>
            <button
              type="button"
              className="h-[42px] shrink-0 rounded-lg bg-red-500 px-8 text-sm font-bold text-white shadow-sm hover:bg-red-600"
            >
              GO
            </button>
          </div>

          <ExportBar />

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2.5">
                    # <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    บริษัท <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    เลขที่ใบเสร็จ <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    วันที่เปิดเอกสาร <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    วันครบกำหนด <SortArrows />
                  </th>
                  <th className="px-3 py-2.5 text-right">
                    ราคารวม <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    วันที่รับเงิน <SortArrows />
                  </th>
                  <th className="px-3 py-2.5 text-right">
                    รับเงินจำนวน <SortArrows />
                  </th>
                  <th className="px-3 py-2.5 text-right">
                    ยอดค้าง <SortArrows />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr className="hover:bg-slate-50/80">
                  <td className="px-3 py-3 text-slate-600">1</td>
                  <td className="max-w-xs px-3 py-3 text-slate-800">
                    บริษัท เดลต้า อีเลคโทรนิคส์ (ประเทศไทย) จำกัด (มหาชน)
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-slate-800">
                    IVG-6600001
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">12/01/2023</td>
                  <td className="whitespace-nowrap px-3 py-3">30/03/2023</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                    {fmtBaht(64200)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">31/03/2023</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                    {fmtBaht(64200)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-slate-800">
                    {fmtBaht(0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/** รูปที่ 2 — รายการเจ้าหนี้ค้างจ่าย */
export function CreditorsPayableReportPanel() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">รายการเจ้าหนี้</h2>
          <p className="text-sm text-slate-500">list Creditor</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <Box className="h-4 w-4 text-slate-500" aria-hidden />
          Filter
          <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80">
        <div className="flex items-center gap-2 rounded-t-xl bg-violet-600 px-4 py-3 text-white">
          <MessageSquare className="h-5 w-5 shrink-0 opacity-95" aria-hidden />
          <span className="text-sm font-semibold tracking-wide">
            รายการ เจ้าหนี้
          </span>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <FilterSelect label="ชื่อเจ้าหนี้">
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option>ทั้งหมด</option>
              </select>
            </FilterSelect>
            <FilterSelect label="ปี">
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option>ทั้งหมด</option>
              </select>
            </FilterSelect>
            <FilterSelect label="วันที่เอกสาร">
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option>วันที่เปิดเอกสาร</option>
              </select>
            </FilterSelect>
            <FilterSelect label="ฝั่งการจ่าย">
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option>ทั้งหมด</option>
              </select>
            </FilterSelect>
            <FilterSelect label="บริษัท">
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option>ทั้งหมด</option>
              </select>
            </FilterSelect>
          </div>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
            <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <FilterSelect label="รหัสเจ้าหนี้">
                <input
                  type="text"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </FilterSelect>
              <FilterSelect label="เดือน">
                <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option>ทั้งหมด</option>
                </select>
              </FilterSelect>
              <FilterSelect label="รายการ">
                <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option>ทั้งหมด</option>
                </select>
              </FilterSelect>
              <FilterSelect label="ประเภทรายจ่าย (บริหาร)">
                <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <option>ทั้งหมด</option>
                </select>
              </FilterSelect>
            </div>
            <button
              type="button"
              className="h-[42px] shrink-0 rounded-lg bg-red-500 px-8 text-sm font-bold text-white shadow-sm hover:bg-red-600"
            >
              GO
            </button>
          </div>

          <ExportBar />

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2.5">
                    # <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    บริษัท <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    เลขที่เอกสาร <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    วันที่เปิดเอกสาร <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    วันครบกำหนด <SortArrows />
                  </th>
                  <th className="px-3 py-2.5 text-right">
                    ราคารวม <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    วันที่รับเงิน <SortArrows />
                  </th>
                  <th className="px-3 py-2.5">
                    หมายเหตุ <SortArrows />
                  </th>
                  <th className="px-3 py-2.5 text-right">
                    รับเงินจำนวน <SortArrows />
                  </th>
                  <th className="px-3 py-2.5 text-right">
                    ยอดค้าง <SortArrows />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr className="hover:bg-slate-50/80">
                  <td className="px-3 py-3 text-slate-600">1</td>
                  <td className="max-w-xs px-3 py-3 text-slate-800">
                    การไฟฟ้านครหลวง (สำนักงานใหญ่)
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-slate-800">
                    EXPM650054
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">02/05/2022</td>
                  <td className="whitespace-nowrap px-3 py-3">17/05/2022</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                    {fmtBaht(22479.68)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">08/08/2022</td>
                  <td className="px-3 py-3 text-slate-400">—</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                    {fmtBaht(22479.68)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                    {fmtBaht(0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const expenseSummarySampleRows = [
  {
    no: 1,
    docRef: "EXPM690845",
    payType: "จ่ายร้านค้า",
    vendor: "บริษัท ซัพพลาย เอ จำกัด",
    total: 15890.5,
    paid: 15890.5,
    due: "2026-03-15",
    payNo: "27-3-2569",
    wht: "G-10234",
  },
  {
    no: 2,
    docRef: "EXPM690846",
    payType: "คืนกรรมการ",
    vendor: "ฝ่ายบริหาร",
    total: 5000.0,
    paid: 5000.0,
    due: "2026-03-20",
    payNo: "PAY-660021",
    wht: "S-8891",
  },
  {
    no: 3,
    docRef: "EXPM690847",
    payType: "จ่ายร้านค้า",
    vendor: "ร้านเครื่องเขียน สยาม",
    total: 3240.75,
    paid: 3240.75,
    due: "2026-04-01",
    payNo: "27-3-2569",
    wht: "—",
  },
];

/** รูปที่ 3 — สรุปรายการจ่าย (มุมมองชำระเรียบร้อย / ตารางเต็ม) */
export function ExpenseSummaryReportPanel({
  onRequestFullscreen,
}: {
  onRequestFullscreen?: () => void;
} = {}) {
  const [tab, setTab] = useState<"summary" | "paid">("paid");

  return (
    <div className="w-full max-w-[1680px] space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">สรุปรายการจ่าย</h2>
        <p className="text-sm text-slate-500">Accounting Pay Success</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80">
        <div className="flex min-h-[52px] w-full overflow-hidden rounded-t-xl">
          <button
            type="button"
            onClick={() => setTab("summary")}
            className={`flex flex-1 items-center justify-center gap-2 px-3 py-3.5 text-sm font-semibold transition sm:justify-start sm:px-5 ${
              tab === "summary"
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            <MessageSquare className="h-4 w-4 shrink-0" aria-hidden />
            <span className="text-left leading-snug">
              สรุปรายการจ่าย (สำนักงานบัญชี)
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab("paid")}
            className={`flex flex-1 items-center justify-center gap-2 px-3 py-3.5 text-sm font-semibold transition sm:justify-start sm:px-5 ${
              tab === "paid"
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            <Layers className="h-4 w-4 shrink-0" aria-hidden />
            ชำระเรียบร้อย
          </button>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-end gap-4">
            <FilterSelect label="ปี">
              <select className="min-w-[8rem] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option>ทั้งหมด</option>
                <option>2026</option>
              </select>
            </FilterSelect>
            <FilterSelect label="เดือน">
              <select className="min-w-[8rem] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option>ทั้งหมด</option>
              </select>
            </FilterSelect>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="button"
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
              >
                ข้อมูล Template เก่า
              </button>
              {onRequestFullscreen ? (
                <button
                  type="button"
                  onClick={onRequestFullscreen}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-800 hover:bg-violet-100"
                >
                  <Maximize2 className="h-3.5 w-3.5" aria-hidden />
                  เต็มหน้าจอ
                </button>
              ) : null}
              <div className="flex flex-wrap gap-1.5">
                {(["Copy", "Excel", "CSV", "PDF"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 lg:shrink-0">
              <span className="text-xs text-slate-600">Search:</span>
              <input
                type="search"
                className="w-full min-w-[10rem] rounded border border-slate-200 px-2 py-1.5 text-sm sm:w-56"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[1200px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-violet-600">
                <tr>
                  <th className="whitespace-nowrap px-2 py-2.5">
                    ลำดับที่ <SortArrows />
                  </th>
                  <th className="whitespace-nowrap px-2 py-2.5">
                    เลขที่อ้างอิงเอกสาร <SortArrows />
                  </th>
                  <th className="whitespace-nowrap px-2 py-2.5">
                    ประเภทการจ่าย <SortArrows />
                  </th>
                  <th className="whitespace-nowrap px-2 py-2.5">
                    ร้านค้า <SortArrows />
                  </th>
                  <th className="whitespace-nowrap px-2 py-2.5 text-right">
                    ราคารวม <SortArrows />
                  </th>
                  <th className="whitespace-nowrap px-2 py-2.5 text-right">
                    ยอดเงินที่ชำระ <SortArrows />
                  </th>
                  <th className="whitespace-nowrap px-2 py-2.5">
                    วันครบกำหนด <SortArrows />
                  </th>
                  <th className="min-w-[8rem] px-2 py-2.5">
                    หมายเหตุ <SortArrows />
                  </th>
                  <th className="px-2 py-2.5 text-center">CHAT</th>
                  <th className="whitespace-nowrap px-2 py-2.5">
                    เลขที่ชำระ <SortArrows />
                  </th>
                  <th className="whitespace-nowrap px-2 py-2.5">
                    หัก ณ ที่จ่าย <SortArrows />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {expenseSummarySampleRows.map((row) => (
                  <tr key={row.no} className="hover:bg-slate-50/80">
                    <td className="px-2 py-2.5 text-slate-600">{row.no}</td>
                    <td className="px-2 py-2.5">
                      <button
                        type="button"
                        className="font-mono text-sm font-medium text-violet-600 hover:text-violet-800 hover:underline"
                      >
                        {row.docRef}
                      </button>
                    </td>
                    <td className="max-w-[10rem] px-2 py-2.5 text-slate-800">
                      {row.payType}
                    </td>
                    <td className="max-w-xs px-2 py-2.5 text-slate-800">
                      {row.vendor}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2.5 text-right tabular-nums">
                      {fmtBaht(row.total)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2.5 text-right tabular-nums">
                      {fmtBaht(row.paid)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2.5 font-mono text-slate-700">
                      {row.due}
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="text"
                        className="w-full min-w-[6rem] rounded border border-slate-200 px-2 py-1 text-sm"
                        placeholder=""
                        aria-label={`หมายเหตุ แถว ${row.no}`}
                      />
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-600 hover:bg-violet-200"
                        aria-label={`แชท แถว ${row.no}`}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-2 py-2.5 font-mono text-sm text-slate-800">
                      {row.payNo}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2.5 font-mono text-sm text-slate-700">
                      {row.wht}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Showing 1 to {expenseSummarySampleRows.length} of{" "}
              {expenseSummarySampleRows.length} entries
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400"
              >
                Previous
              </button>
              <button
                type="button"
                disabled
                className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          className="rounded-lg bg-orange-500 px-8 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-orange-600"
        >
          ย้อนกลับ
        </button>
      </div>
    </div>
  );
}

export type ArApSubView = "ar" | "ap" | "payment-summary";

export function ArApReportPanel({
  itemId,
  onRequestFullscreen,
}: {
  itemId: ArApSubView;
  onRequestFullscreen?: () => void;
}) {
  if (itemId === "ar") return <AccountsReceivableReportPanel />;
  if (itemId === "ap") return <CreditorsPayableReportPanel />;
  return (
    <ExpenseSummaryReportPanel onRequestFullscreen={onRequestFullscreen} />
  );
}
