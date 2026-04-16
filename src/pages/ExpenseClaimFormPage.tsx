import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  FileImage,
  FileText,
  FileUp,
  Loader2,
  Plus,
  Printer,
  Receipt,
  Stamp,
} from "lucide-react";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { canAccessDepartment } from "../auth/deptAccess";
import { useAuth } from "../context/AuthContext";
import { integerBahtToThaiWords } from "../utils/thaiBahtWords";
import { addExpenseClaim } from "../data/expenseClaimStorage";
import {
  exportClaimCardToJpeg,
  exportClaimCardToPdf,
} from "../utils/expenseClaimExport";

/** เลขที่งานอัตโนมัติจากชื่องาน (คงที่เมื่อชื่อเดิม — ใช้ hash สั้น) */
export function jobNumberFromJobTitle(title: string): string {
  const t = title.trim();
  if (!t) return "";

  const latinParts = t.match(/[A-Za-z0-9]+/g);
  const latinCompact =
    latinParts != null && latinParts.join("").length >= 2
      ? latinParts
          .map((w) => w.slice(0, 6))
          .join("")
          .slice(0, 14)
          .toUpperCase()
      : "";

  let h = 2166136261;
  for (let i = 0; i < t.length; i++) {
    h ^= t.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const id = (h >>> 0).toString(36).toUpperCase().padStart(7, "0").slice(0, 7);

  if (latinCompact.length >= 2) {
    return `JOB-${latinCompact}-${id.slice(-4)}`;
  }
  return `JOB-${id}`;
}

/** เลขที่ร่างอัตโนมัติ — แสดงทันทีก่อนกรอกชื่องาน (ยังไม่ผูกชื่อ job) */
function newDraftJobRef(): string {
  const time = Date.now().toString(36).toUpperCase().slice(-7);
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 5).toUpperCase()
      : Math.random().toString(36).slice(2, 7).toUpperCase();
  return `JOB-D${time}-${rnd}`;
}

type ClaimLine = {
  key: string;
  productName: string;
  unitPrice: number;
  quantity: number;
};

function newLine(): ClaimLine {
  return {
    key:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `ln-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    productName: "",
    unitPrice: 0,
    quantity: 1,
  };
}

function fmtBaht(n: number): string {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

/** ซ่อนปุ่มลูกศรขึ้น/ลงของ input[type=number] — คีย์มืออย่างเดียว */
const numberInputNoSpinners =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

function FileField({
  id,
  step,
  label,
  description,
  icon: Icon,
  accept,
  multiple,
  value,
  onChange,
}: {
  id: string;
  step: number;
  label: string;
  description: string;
  icon: typeof FileUp;
  accept?: string;
  multiple?: boolean;
  value: FileList | null;
  onChange: (files: FileList | null) => void;
}) {
  const names =
    value && value.length > 0
      ? Array.from(value).map((f) => f.name).join(", ")
      : null;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
      <div className="flex gap-3">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-sm">
            {step}
          </span>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <label
            htmlFor={id}
            className="block text-sm font-semibold text-slate-900"
          >
            {label}
          </label>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          <div className="mt-3">
            <input
              id={id}
              type="file"
              accept={accept}
              multiple={multiple}
              className="block w-full max-w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
              onChange={(e) => onChange(e.target.files)}
            />
            {names && (
              <p className="mt-2 truncate text-xs text-slate-600" title={names}>
                เลือกแล้ว: {names}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExpenseClaimFormPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const sentOk = searchParams.get("sent") === "1";
  const [docFiles, setDocFiles] = useState<FileList | null>(null);
  const [receiptFiles, setReceiptFiles] = useState<FileList | null>(null);
  const [taxInvoiceFiles, setTaxInvoiceFiles] = useState<FileList | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [lines, setLines] = useState<ClaimLine[]>(() => [newLine()]);
  const [formKey, setFormKey] = useState(0);
  const [draftJobRef, setDraftJobRef] = useState(newDraftJobRef);
  const [exporting, setExporting] = useState(false);
  const printCardRef = useRef<HTMLDivElement>(null);
  const exportLockRef = useRef(false);

  const derivedFromTitle = useMemo(
    () => jobNumberFromJobTitle(jobTitle),
    [jobTitle],
  );
  /** เลขที่แสดง/บันทึก: ถ้ามีชื่องานใช้เลขจากชื่อ ไม่เช่นนั้นใช้เลขร่างอัตโนมัติ */
  const displayRef = derivedFromTitle || draftJobRef;

  const { itemsSubtotal, grandTotal } = useMemo(() => {
    let items = 0;
    for (const row of lines) {
      const price = Number.isFinite(row.unitPrice) ? row.unitPrice : 0;
      const qty = Number.isFinite(row.quantity) ? row.quantity : 0;
      items += price * qty;
    }
    return {
      itemsSubtotal: items,
      grandTotal: Math.round(items * 100) / 100,
    };
  }, [lines]);

  const totalThaiWords = useMemo(
    () => integerBahtToThaiWords(Math.round(grandTotal)),
    [grandTotal],
  );

  const updateLine = useCallback((key: string, patch: Partial<ClaimLine>) => {
    setLines((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }, []);

  const addRow = useCallback(() => {
    setLines((prev) => [...prev, newLine()]);
  }, []);

  const removeRow = useCallback((key: string) => {
    setLines((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((r) => r.key !== key);
    });
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!jobTitle.trim()) {
        return;
      }
      const refToSave = jobNumberFromJobTitle(jobTitle.trim()) || draftJobRef;
      const storedLines = lines.map((row) => ({
        lineId: row.key,
        productName: row.productName.trim(),
        unitPrice: Number.isFinite(row.unitPrice) ? row.unitPrice : 0,
        quantity: Number.isFinite(row.quantity) ? row.quantity : 0,
      }));
      addExpenseClaim({
        jobTitle: jobTitle.trim(),
        jobNumber: refToSave,
        lines: storedLines,
      });
      if (user && canAccessDepartment(user, "accounting")) {
        navigate("/forms/expense/submissions");
      } else {
        navigate("/forms/expense?sent=1");
      }
    },
    [jobTitle, draftJobRef, lines, navigate, user],
  );

  const todayLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("th-TH", {
        dateStyle: "long",
      }).format(new Date());
    } catch {
      return new Date().toLocaleDateString("th-TH");
    }
  }, []);

  const runExport = useCallback(async (kind: "jpg" | "pdf") => {
    const el = printCardRef.current;
    if (!el || exportLockRef.current) return;
    exportLockRef.current = true;
    setExporting(true);
    try {
      if (kind === "jpg") {
        await exportClaimCardToJpeg(el, displayRef);
      } else {
        await exportClaimCardToPdf(el, displayRef);
      }
    } finally {
      exportLockRef.current = false;
      setExporting(false);
    }
  }, [displayRef]);

  return (
    <div className="min-h-full bg-slate-100/80 print:bg-white">
      <header className="border-b border-slate-200/80 bg-white px-6 py-4 print:hidden">
        <Link
          to="/"
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-indigo-700 no-underline hover:text-indigo-900"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับ — หน้าหลัก
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              ใบฟอร์มเอกสารขอเบิก
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              ระบุชื่องานและรายการสินค้า จากนั้นแนบเอกสารประกอบ
            </p>
          </div>
          {user && canAccessDepartment(user, "accounting") && (
            <Link
              to="/forms/expense/submissions"
              className="text-sm font-medium text-indigo-700 no-underline hover:text-indigo-900 hover:underline"
            >
              ใบขอเบิก (รายการ) →
            </Link>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl p-6 print:p-4 print:max-w-none">
        {sentOk && (
          <div
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 print:hidden"
            role="status"
          >
            <span>
              ส่งคำขอเบิกแล้ว — แผนกบัญชีจะตรวจสอบต่อไป
            </span>
            <button
              type="button"
              className="shrink-0 rounded-lg bg-white/80 px-3 py-1.5 text-xs font-semibold text-emerald-900 shadow-sm ring-1 ring-emerald-200/80 hover:bg-white"
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete("sent");
                setSearchParams(next, { replace: true });
              }}
            >
              ปิด
            </button>
          </div>
        )}
        <div
          key={formKey}
          ref={printCardRef}
          className="expense-claim-print-root rounded-2xl border border-slate-200 bg-white p-6 shadow-md ring-1 ring-slate-200/60 sm:p-8 print:shadow-none print:ring-0"
        >
          <div className="mb-4 flex flex-wrap items-center justify-end gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <Printer className="h-4 w-4" aria-hidden />
              พิมพ์
            </button>
            <button
              type="button"
              onClick={() => void runExport("jpg")}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <FileImage className="h-4 w-4" aria-hidden />
              )}
              JPG
            </button>
            <button
              type="button"
              onClick={() => void runExport("pdf")}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <FileText className="h-4 w-4" aria-hidden />
              )}
              PDF
            </button>
          </div>

          <div className="mb-6 border-b border-dashed border-slate-200 pb-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  เลขที่อ้างอิง (Job number)
                </p>
                <p className="mt-1 min-h-[1.75rem] font-mono text-lg font-bold text-indigo-800 tabular-nums">
                  {displayRef}
                </p>
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-medium text-slate-700">วันที่ </span>
                <span>{todayLabel}</span>
              </div>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-sm">
                  1
                </span>
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor="claim-job-title"
                    className="block text-sm font-semibold text-slate-900"
                  >
                    ชื่องานที่เบิก
                  </label>
                  <p className="mt-0.5 text-xs text-slate-500">
                    ระบุชื่อโครงการ / งาน — เลขที่อ้างอิงด้านบนอัปเดตตามชื่อ
                  </p>
                  <input
                    id="claim-job-title"
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="เช่น ซ่อมเครื่องลูกค้า ABC / Project Alpha ติดตั้งระบบ ..."
                    className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-900 outline-none ring-indigo-500/0 transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <span className="font-medium text-slate-700">
                      เลขที่อ้างอิง:{" "}
                    </span>
                    <span className="font-mono font-semibold text-indigo-700">
                      {displayRef}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-bold text-slate-900">
                  รายการสินค้า
                </h2>
                <button
                  type="button"
                  onClick={addRow}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 print:hidden"
                >
                  <Plus className="h-4 w-4" />
                  เพิ่มแถว
                </button>
              </div>

              <div className="space-y-3">
                {lines.map((row) => (
                  <div
                    key={row.key}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="grid gap-4 lg:grid-cols-[1fr_minmax(7rem,7rem)_minmax(6.5rem,6.5rem)_auto] lg:items-end">
                      <div className="min-w-0 lg:col-span-1">
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          สินค้า
                        </label>
                        <input
                          type="text"
                          value={row.productName}
                          onChange={(e) =>
                            updateLine(row.key, {
                              productName: e.target.value,
                            })
                          }
                          placeholder="ระบุชื่อสินค้า"
                          autoComplete="off"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          ราคา/หน่วย
                        </label>
                        <input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step={0.01}
                          value={row.unitPrice === 0 ? "" : row.unitPrice}
                          onFocus={(e) => {
                            if (row.unitPrice === 0) {
                              e.currentTarget.select();
                            }
                          }}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === "" || raw === ".") {
                              updateLine(row.key, { unitPrice: 0 });
                              return;
                            }
                            const n = Number(raw);
                            if (!Number.isNaN(n) && n >= 0) {
                              updateLine(row.key, { unitPrice: n });
                            }
                          }}
                          className={`w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm tabular-nums shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 ${numberInputNoSpinners}`}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          จำนวน
                        </label>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          step={1}
                          value={row.quantity === 0 ? "" : row.quantity}
                          onFocus={(e) => {
                            if (row.quantity === 0) {
                              e.currentTarget.select();
                            }
                          }}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === "") {
                              updateLine(row.key, { quantity: 0 });
                              return;
                            }
                            const n = Number(raw);
                            if (!Number.isNaN(n) && n >= 0) {
                              updateLine(row.key, {
                                quantity: Math.floor(n),
                              });
                            }
                          }}
                          className={`w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm tabular-nums shadow-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 ${numberInputNoSpinners}`}
                        />
                      </div>
                      <div className="flex items-end justify-end lg:justify-start">
                        <button
                          type="button"
                          onClick={() => removeRow(row.key)}
                          disabled={lines.length <= 1}
                          className="text-sm font-medium text-rose-600 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-40 print:hidden"
                        >
                          ลบแถว
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-200 pt-4 text-right">
                <p className="text-sm text-slate-600">
                  ยอดสินค้า {fmtBaht(itemsSubtotal)} บาท
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900">
                  รวม {fmtBaht(grandTotal)} บาท
                </p>
                <p className="mt-1 text-sm text-slate-500">{totalThaiWords}</p>
              </div>
            </section>

            <FileField
              id="claim-docs"
              step={2}
              label="แนบเอกสาร"
              description="รูปถ่ายหรือสแกนเอกสาร — เลือกได้หลายไฟล์ (รูปหรือ PDF)"
              icon={FileUp}
              accept="image/*,.pdf,application/pdf"
              multiple
              value={docFiles}
              onChange={setDocFiles}
            />

            <FileField
              id="claim-receipt"
              step={3}
              label="แนบใบเสร็จ"
              description="รูปใบเสร็จ — เลือกได้หลายรูป"
              icon={Receipt}
              accept="image/*"
              multiple
              value={receiptFiles}
              onChange={setReceiptFiles}
            />

            <FileField
              id="claim-tax"
              step={4}
              label="แนบใบกำกับภาษี"
              description="รูปหรือสแกนใบกำกับ — เลือกได้หลายไฟล์"
              icon={Stamp}
              accept="image/*,.pdf,application/pdf,.jpg,.jpeg,.png"
              multiple
              value={taxInvoiceFiles}
              onChange={setTaxInvoiceFiles}
            />

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4 print:hidden">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                onClick={() => {
                  setDocFiles(null);
                  setReceiptFiles(null);
                  setTaxInvoiceFiles(null);
                  setJobTitle("");
                  setLines([newLine()]);
                  setDraftJobRef(newDraftJobRef());
                  setFormKey((k) => k + 1);
                }}
              >
                ล้างฟอร์ม
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:bg-indigo-700"
              >
                ส่งคำขอเบิก
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
