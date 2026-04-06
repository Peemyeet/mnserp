import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptPageHeader } from "../../components/dept/DeptPageHeader";

const ROWS = 6;

export function SalesDeptReport() {
  return (
    <DeptPageFrame>
      <DeptPageHeader
        deptId="sales"
        titleTh="รีพอร์ต — ฝ่ายขาย"
        titleEn="Sales report"
        workPath="/dept/sales/work"
        reportPath="/dept/sales/report"
      />
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 sm:p-6">
          <h2 className="mb-4 text-center text-lg font-semibold text-slate-800">
            Time line
          </h2>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="flex">
              <div className="w-36 shrink-0 border-r border-slate-200 bg-slate-50" />
              <div className="flex-1">
                {Array.from({ length: ROWS }, (_, i) => (
                  <div
                    key={i}
                    className={`h-14 border-b border-slate-100 ${
                      i % 2 === 0 ? "bg-white" : "bg-slate-50/80"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex border-t border-slate-200 bg-slate-50 px-2 py-2 pl-[calc(9rem+0.5rem)] text-xs text-slate-500">
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className="flex-1 border-l border-slate-200 pl-1 text-center first:border-l-0"
                >
                  {n}
                </div>
              ))}
            </div>
          </div>
      </div>
    </DeptPageFrame>
  );
}
