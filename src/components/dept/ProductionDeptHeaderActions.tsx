import { useNavigate } from "react-router-dom";

const headerActionBtn =
  "relative inline-flex min-h-[42px] items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white";

export function ProductionDeptHeaderActions() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className={`${headerActionBtn} pr-3`}
      onClick={() =>
        navigate("/dept/sales/requirements", {
          state: { from: "/dept/production/work" },
        })
      }
    >
      ความต้องการฝ่ายขาย
      <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
        1
      </span>
    </button>
  );
}
