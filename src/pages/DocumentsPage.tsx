import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { DocumentCategoryCards } from "../components/approve/DocumentCategoryCards";

export function DocumentsPage() {
  return (
    <div className="min-h-full bg-slate-100/80">
      <header className="border-b border-slate-200/80 bg-white px-6 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">เอกสาร</h1>
            <p className="mt-1 text-sm text-slate-500">
              อนุมัติรายการจ่าย และสร้างเอกสารตามลำดับ 1–5
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-10 p-4 sm:p-6">
        <section aria-labelledby="approve-docs-heading">
          <h2
            id="approve-docs-heading"
            className="text-base font-semibold text-slate-900"
          >
            อนุมัติรายการจ่าย
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            1 รายการ PR ไม่มี JOB · 2 ใบลา · 3 ใบเบิกรถ · 4 ตรวจสอบรายการจ่าย · 5
            ทำใบสั่งซื้อ
          </p>
          <Link
            to="/approve"
            className="mt-4 inline-flex rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm no-underline hover:bg-violet-700"
          >
            เปิดหน้าอนุมัติ
          </Link>
        </section>

        <section aria-labelledby="create-docs-heading">
          <h2
            id="create-docs-heading"
            className="text-base font-semibold text-slate-900"
          >
            สร้างเอกสาร
          </h2>
          <p className="mt-1 mb-4 text-sm text-slate-500">
            เลือกประเภทตามลำดับ 1–5 ตามรูปแบบหน้าจออ้างอิง
          </p>
          <DocumentCategoryCards variant="create" />
        </section>
      </div>
    </div>
  );
}
