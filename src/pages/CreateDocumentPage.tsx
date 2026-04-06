import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { APPROVAL_DOC_CATEGORIES } from "../data/approvalCategories";

export function CreateDocumentPage() {
  const { kind } = useParams<{ kind: string }>();
  const cat = APPROVAL_DOC_CATEGORIES.find((c) => c.id === kind);

  if (!kind || !cat) {
    return <Navigate to="/documents" replace />;
  }

  return (
    <div className="min-h-full bg-slate-100/80">
      <header className="border-b border-slate-200/80 bg-white px-6 py-4">
        <Link
          to="/documents"
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-violet-700 no-underline hover:text-violet-900"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับ — เอกสาร
        </Link>
        <h1 className="text-xl font-bold text-slate-900">สร้างเอกสาร</h1>
        <p className="mt-1 text-sm font-semibold text-violet-800">
          {cat.order}. {cat.labelTh}
        </p>
        <p className="text-xs text-slate-500">{cat.labelEn}</p>
      </header>
      <div className="p-6">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 text-center text-sm text-slate-600">
          พื้นที่ฟอร์มสร้างเอกสารประเภทนี้ — เชื่อมต่อ API / ฟอร์มจริงในขั้นถัดไป
        </div>
      </div>
    </div>
  );
}
