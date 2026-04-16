import { Link } from "react-router-dom";

export function DeptSubPageHeader({
  backTo,
  backLabel,
  titleTh,
  titleEn,
  titleThClassName,
}: {
  backTo: string;
  backLabel: string;
  titleTh: string;
  titleEn: string;
  /** โทนหัวข้อไทย (เช่น สีแดงสำหรับรายงานบัญชี) */
  titleThClassName?: string;
}) {
  const titleCls =
    titleThClassName ??
    "text-xl font-bold tracking-tight text-slate-900 sm:text-2xl";
  return (
    <header className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-5">
      <Link
        to={backTo}
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-violet-700 no-underline hover:text-violet-900"
      >
        ← {backLabel}
      </Link>
      <h1 className={titleCls}>
        {titleTh}
      </h1>
      <p className="mt-1 text-sm text-slate-500">{titleEn}</p>
    </header>
  );
}
