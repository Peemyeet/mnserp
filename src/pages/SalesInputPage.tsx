import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { useJobs } from "../context/JobsContext";
import { workflowStageDefinitions } from "../data/workflowStages";

export function SalesInputPage() {
  const { addJob } = useJobs();
  const [saved, setSaved] = useState(false);
  const [serviceNumber, setServiceNumber] = useState("");
  const [jobName, setJobName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPO, setCustomerPO] = useState("");
  const [stage, setStage] = useState("N01");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceNumber.trim() || !jobName.trim() || !customerName.trim()) {
      return;
    }
    addJob({
      serviceNumber: serviceNumber.trim(),
      jobName: jobName.trim(),
      customerName: customerName.trim(),
      customerPO: customerPO.trim() || "-",
      currentStageCode: stage,
    });
    setServiceNumber("");
    setJobName("");
    setCustomerName("");
    setCustomerPO("");
    setStage("N01");
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <header className="border-b border-slate-200/80 bg-white px-6 py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับแดชบอร์ด
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          บันทึกงาน — ฝ่ายขาย
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          กรอกครั้งเดียว ข้อมูลจะซิงก์ไปทุกหน้าขั้นตอน (N01, N02, …) โดยอัตโนมัติ
        </p>
      </header>

      <main className="p-6">
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-xl rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card"
        >
          {saved && (
            <p className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
              <Check className="h-4 w-4 shrink-0" />
              บันทึกแล้ว — ไปดูได้ที่ขั้นที่เลือก
            </p>
          )}

          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              หมายเลขบริการ
            </span>
            <input
              required
              value={serviceNumber}
              onChange={(e) => setServiceNumber(e.target.value)}
              placeholder="เช่น SV-2026-00999"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">ชื่องาน</span>
            <input
              required
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="รายละเอียดงาน"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">
              ชื่อลูกค้า
            </span>
            <input
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="ชื่อบริษัท / ลูกค้า"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">
              PO ลูกค้า
            </span>
            <input
              value={customerPO}
              onChange={(e) => setCustomerPO(e.target.value)}
              placeholder="ถ้าไม่มีใส่ - หรือเว้นว่าง"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">
              ขั้นปัจจุบัน (เริ่มงาน)
            </span>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
            >
              {workflowStageDefinitions.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} — {s.title}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              บันทึกงาน
            </button>
            <Link
              to={`/stage/${encodeURIComponent(stage)}`}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:border-indigo-200 hover:text-indigo-700"
            >
              เปิดตารางขั้นนี้
            </Link>
          </div>
        </form>
      </main>
    </>
  );
}
