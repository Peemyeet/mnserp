import { useEffect, useState } from "react";
import { MNS_COMPANY_OPTIONS } from "../../data/mnsCompanies";

/**
 * บังคับเลือกบริษัทก่อนใช้งานใบงาน — แสดงทันทีเมื่อเข้าหน้า (z-index สูงสุด)
 */
export function JobSheetCompanyGate({
  open,
  onConfirm,
  onBack,
}: {
  open: boolean;
  onConfirm: (companyKey: string) => void;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (open) setDraft("");
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-company-gate-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-slate-100 shadow-2xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2
            id="job-company-gate-title"
            className="text-base font-semibold text-slate-900"
          >
            Select field validation
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            กรุณาเลือกบริษัทก่อนกรอกแบบฟอร์ม
          </p>
        </div>
        <div className="space-y-4 p-5">
          <label className="block text-xs font-medium text-slate-600">
            บริษัท
            <select
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm"
              autoFocus
            >
              <option value="">เลือกบริษัท</option>
              {MNS_COMPANY_OPTIONS.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200/80 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              ย้อนกลับ
            </button>
            <button
              type="button"
              disabled={!draft}
              onClick={() => draft && onConfirm(draft)}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
