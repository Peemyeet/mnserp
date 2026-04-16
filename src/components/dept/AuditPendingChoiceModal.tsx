import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  open: boolean;
  onClose: () => void;
};

/**
 * Pop-up เลือกประเภทรายการรอตรวจสอบ — บริหาร vs ผลิต (สั่งซื้ออะไหล่)
 */
export function AuditPendingChoiceModal({ open, onClose }: Props) {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(open);

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

  const go = (kind: "management" | "production") => {
    onClose();
    navigate(`/dept/accounting/audit-pending?kind=${kind}`);
  };

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center p-4 transition-opacity duration-150 ease-out ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-pending-modal-title"
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
        className={`relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200/80 transition-all duration-150 ease-out ${
          open ? "translate-y-0 scale-100 opacity-100" : "translate-y-1 scale-[0.985] opacity-0"
        }`}
      >
        <h2
          id="audit-pending-modal-title"
          className="sr-only"
        >
          เลือกประเภทรายการรอตรวจสอบ
        </h2>
        <div className="space-y-4">
          <div
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-100/95 via-pink-50/90 to-white py-10 pl-4 pr-8 shadow-sm ring-1 ring-rose-200/70"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 1.5rem) 0, 100% 100%, 0 100%)",
            }}
          >
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => go("management")}
                className="min-w-[10rem] rounded-xl bg-rose-600 px-10 py-3 text-base font-bold text-white shadow-md transition hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
              >
                บริหาร
              </button>
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-100/90 via-emerald-50/80 to-white py-10 pl-4 pr-8 shadow-sm ring-1 ring-teal-200/70"
            style={{
              clipPath:
                "polygon(0 0, calc(100% - 1.5rem) 0, 100% 100%, 0 100%)",
            }}
          >
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => go("production")}
                className="min-w-[10rem] rounded-xl bg-teal-600 px-10 py-3 text-base font-bold text-white shadow-md transition hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2"
              >
                ผลิต
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
