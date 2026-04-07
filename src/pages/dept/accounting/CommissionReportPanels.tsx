import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Layers, Maximize2, MessageSquare, Trash2 } from "lucide-react";

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

/** โมดัลรายการใบเสร็จ — เปิดจากปุ่ม List ในคอลัมน์ รายการใบเสร็จ */
function ReceiptListModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const rows = [
    {
      no: 1,
      receipt: "REG-6500039",
      date: "2022-10-20",
      customer: "บริษัท ไทยแอร์โรว์ จำกัด",
      price: 6500,
    },
    {
      no: 2,
      receipt: "REG-6500040",
      date: "2022-10-25",
      customer: "บริษัท ชบาบางกอก จำกัด",
      price: 19500,
    },
    {
      no: 3,
      receipt: "REG-6500041",
      date: "2022-10-28",
      customer:
        "บริษัท พีเอสแอล ออโตเมชั่น ซิสเต็ม จำกัด (สำนักงานใหญ่)",
      price: 2400,
    },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-list-modal-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <h2
            id="receipt-list-modal-title"
            className="text-lg font-bold text-slate-900"
          >
            รายการใบเสร็จ
          </h2>
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Show
            <select className="rounded border border-slate-200 px-2 py-1 text-sm">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            entries
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">Search:</span>
            <input
              type="search"
              className="rounded border border-slate-200 px-2 py-1.5 text-sm sm:w-48"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-2 py-2 sm:px-4">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/90 text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-3 py-2.5">
                  # <SortArrows />
                </th>
                <th className="px-3 py-2.5">
                  เลขที่ใบเสร็จ <SortArrows />
                </th>
                <th className="px-3 py-2.5">
                  วันที่เปิด <SortArrows />
                </th>
                <th className="px-3 py-2.5">
                  ลูกค้า <SortArrows />
                </th>
                <th className="px-3 py-2.5 text-right">
                  ราคา <SortArrows />
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.no}
                  className={
                    i % 2 === 0 ? "bg-violet-50/40" : "bg-white"
                  }
                >
                  <td className="px-3 py-2.5 text-slate-700">{r.no}</td>
                  <td className="px-3 py-2.5 font-mono text-slate-800">
                    {r.receipt}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-slate-700">
                    {r.date}
                  </td>
                  <td className="max-w-xs px-3 py-2.5 text-slate-800">
                    {r.customer}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-slate-800">
                    {fmtBaht(r.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Showing 1 to {rows.length} of {rows.length} entries
          </p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              disabled
              className="rounded border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-400"
            >
              Previous
            </button>
            <span className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded bg-violet-600 px-2 text-xs font-semibold text-white">
              1
            </span>
            <button
              type="button"
              disabled
              className="rounded border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-400"
            >
              Next
            </button>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-slate-100 px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

const commissionRows = [
  {
    no: 1,
    cms: "CMS6500001",
    doc: "EXPM6500838",
    company: "บริษัท มณีสูรย์ กรุ๊ป จำกัด",
    docDate: "2022-05-10",
    totalBeforeVat: 100000.0,
    commission5: 5000.0,
  },
  {
    no: 2,
    cms: "CMS6500002",
    doc: "EXPM6500839",
    company: "บริษัท ตัวอย่าง จำกัด",
    docDate: "2022-06-01",
    totalBeforeVat: 45000.5,
    commission5: 2250.03,
  },
  {
    no: 3,
    cms: "CMS6500003",
    doc: "EXPM6500840",
    company: "บริษัท ทดสอบ จำกัด (มหาชน)",
    docDate: "2022-07-15",
    totalBeforeVat: 12800.0,
    commission5: 640.0,
  },
];

export function CommissionReportPanel({
  onRequestFullscreen,
}: {
  onRequestFullscreen?: () => void;
} = {}) {
  const [tab, setTab] = useState<"pending" | "commission">("pending");
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  return (
    <div className="w-full max-w-[1680px] space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">คอมมิชชั่น</h2>
          <p className="text-sm text-slate-500">Commission</p>
        </div>
        {onRequestFullscreen ? (
          <button
            type="button"
            onClick={onRequestFullscreen}
            className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-800 hover:bg-violet-100"
          >
            <Maximize2 className="h-3.5 w-3.5" aria-hidden />
            เต็มหน้าจอ
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80">
        <div className="flex min-h-[52px] flex-wrap border-b border-slate-100">
          <button
            type="button"
            onClick={() => setTab("pending")}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold transition sm:min-w-[200px] sm:justify-start sm:px-5 ${
              tab === "pending"
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            <MessageSquare className="h-4 w-4 shrink-0" aria-hidden />
            รายการ ค้างคอมมิชชั่น
          </button>
          <button
            type="button"
            onClick={() => setTab("commission")}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold transition sm:min-w-[160px] sm:justify-start sm:px-5 ${
              tab === "commission"
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
            }`}
          >
            <Layers className="h-4 w-4 shrink-0" aria-hidden />
            คอมมิชชั่น
          </button>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <label className="flex min-w-[14rem] flex-col gap-1 text-xs font-medium text-slate-600">
              <span>บริษัท</span>
              <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="">กรุณาเลือกบริษัท</option>
                <option>ทั้งหมด</option>
              </select>
            </label>
            <button
              type="button"
              className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-orange-600 lg:ml-auto"
            >
              ทำ Commission
            </button>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {(["Copy", "Excel", "CSV", "PDF"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">Search:</span>
              <input
                type="search"
                className="rounded border border-slate-200 px-2 py-1.5 text-sm sm:w-56"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Show
              <select className="rounded border border-slate-200 px-2 py-1 text-sm">
                <option>10</option>
              </select>
              entries
            </label>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-violet-700/90">
                <tr>
                  <th className="px-2 py-2.5">
                    ลำดับ <SortArrows />
                  </th>
                  <th className="px-2 py-2.5">
                    เลขที่คอมมิชชั่น <SortArrows />
                  </th>
                  <th className="px-2 py-2.5">
                    เลขที่เอกสาร <SortArrows />
                  </th>
                  <th className="px-2 py-2.5">
                    บริษัท <SortArrows />
                  </th>
                  <th className="px-2 py-2.5">
                    วันที่เอกสาร <SortArrows />
                  </th>
                  <th className="px-2 py-2.5 text-right">
                    ราคารวม(ก่อน VAT) <SortArrows />
                  </th>
                  <th className="px-2 py-2.5 text-right">
                    ค่าคอมมิชชั่น(5%) <SortArrows />
                  </th>
                  <th className="px-2 py-2.5 text-center">
                    รายการใบเสร็จ <SortArrows />
                  </th>
                  <th className="px-2 py-2.5 text-center">
                    ยกเลิก <SortArrows />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commissionRows.map((row) => (
                  <tr key={row.no} className="hover:bg-slate-50/80">
                    <td className="px-2 py-3 text-slate-700">{row.no}</td>
                    <td className="px-2 py-3">
                      <button
                        type="button"
                        className="font-mono text-sm font-medium text-violet-600 hover:underline"
                      >
                        {row.cms}
                      </button>
                    </td>
                    <td className="px-2 py-3">
                      <button
                        type="button"
                        className="font-mono text-sm font-medium text-violet-600 hover:underline"
                      >
                        {row.doc}
                      </button>
                    </td>
                    <td className="max-w-[14rem] px-2 py-3 text-slate-800">
                      {row.company}
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 font-mono text-slate-700">
                      {row.docDate}
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 text-right tabular-nums">
                      {fmtBaht(row.totalBeforeVat)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 text-right tabular-nums">
                      {fmtBaht(row.commission5)}
                    </td>
                    <td className="px-2 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setReceiptModalOpen(true)}
                        className="rounded-md bg-teal-500 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-teal-600"
                      >
                        List
                      </button>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <button
                        type="button"
                        className="inline-flex rounded-lg p-2 text-red-500 hover:bg-red-50"
                        aria-label="ยกเลิก"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Showing 1 to {commissionRows.length} of {commissionRows.length}{" "}
              entries
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                className="rounded border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-400"
              >
                Previous
              </button>
              <span className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded bg-violet-600 px-2 text-xs font-semibold text-white">
                1
              </span>
              <button
                type="button"
                disabled
                className="rounded border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-400"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <ReceiptListModal
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
      />
    </div>
  );
}
