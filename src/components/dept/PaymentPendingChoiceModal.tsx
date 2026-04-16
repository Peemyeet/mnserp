import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  open: boolean;
  onClose: () => void;
};

/** Pop-up เลือกประเภทงานในสถานะ "รอชำระ" */
export function PaymentPendingChoiceModal({ open, onClose }: Props) {
  const productionCount = 0;
  const managementCount = 0;
  const [mounted, setMounted] = useState(open);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = window.setTimeout(() => setMounted(false), 160);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center p-4 transition-opacity duration-150 ease-out ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-pending-choice-title"
    >
      <button
        type="button"
        className={`absolute inset-0 bg-slate-900/45 backdrop-blur-[2px] transition-opacity duration-150 ease-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
        aria-label="ปิด"
        onClick={onClose}
      />

      <div
        className={`relative z-10 w-full max-w-4xl rounded-3xl bg-white p-4 shadow-2xl ring-1 ring-slate-200/80 transition-all duration-150 ease-out sm:p-6 ${
          open ? "translate-y-0 scale-100 opacity-100" : "translate-y-1 scale-[0.985] opacity-0"
        }`}
      >
        <h2 id="payment-pending-choice-title" className="sr-only">
          เลือกประเภทรายการรอชำระ
        </h2>

        <div className="grid gap-3 md:grid-cols-2">
          <div
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-100/90 via-yellow-50/85 to-white py-8 pl-4 pr-8 shadow-sm ring-1 ring-amber-200/70"
            style={{
              clipPath: "polygon(0 0, calc(100% - 1.8rem) 0, 100% 100%, 0 100%)",
            }}
          >
            {productionCount > 0 ? (
              <span className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-4xl font-bold leading-none text-rose-500">
                {productionCount}
              </span>
            ) : null}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/dept/accounting/purchase-docs?kind=production");
                }}
                className="min-w-[10.5rem] rounded-2xl bg-amber-500 px-8 py-3 text-2xl font-bold text-white shadow-md transition hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2"
              >
                ผลิต
              </button>
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-100/90 via-emerald-50/80 to-white py-8 pl-4 pr-8 shadow-sm ring-1 ring-cyan-200/70"
            style={{
              clipPath: "polygon(0 0, calc(100% - 1.8rem) 0, 100% 100%, 0 100%)",
            }}
          >
            {managementCount > 0 ? (
              <span className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-4xl font-bold leading-none text-rose-500">
                {managementCount}
              </span>
            ) : null}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/dept/accounting/purchase-docs?kind=management");
                }}
                className="min-w-[10.5rem] rounded-2xl bg-cyan-500 px-8 py-3 text-2xl font-bold text-white shadow-md transition hover:bg-cyan-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2"
              >
                บริหาร
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
