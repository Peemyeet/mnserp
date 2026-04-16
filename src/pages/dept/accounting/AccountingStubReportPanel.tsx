/** รีพอร์ตที่ยังไม่ได้ต่อ API — แสดงโครงหัวข้อเท่านั้น */
export function AccountingStubReportPanel({
  sectionLabel,
  titleTh,
  titleEn,
}: {
  sectionLabel: string;
  titleTh: string;
  titleEn: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 sm:p-6">
      <div className="border-b border-slate-100 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-600/90">
          {sectionLabel}
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">{titleTh}</h2>
        <p className="text-sm text-slate-500">{titleEn}</p>
      </div>

      <p className="mt-6 rounded-xl border border-slate-100 bg-slate-50/80 py-16 text-center text-sm text-slate-500">
        ยังไม่มีข้อมูลจากฐานข้อมูล — เชื่อม API รายงานในขั้นถัดไป
      </p>
    </div>
  );
}
