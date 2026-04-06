import type { ReactNode } from "react";

/** โครงหน้าแผนก: พื้นหลังไล่สี, จำกัดความกว้าง, padding สม่ำเสมอ */
export function DeptPageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50/40">
      <div className="mx-auto w-full max-w-[1680px] space-y-6 px-4 py-5 sm:space-y-7 sm:px-6 sm:py-6 lg:space-y-8 lg:px-10 lg:py-8">
        {children}
      </div>
    </div>
  );
}
