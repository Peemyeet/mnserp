import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CompanyNamesTable } from "../components/CompanyNamesTable";
import { useCompanies } from "../context/CompaniesContext";

export function CompanyNameSettingsPage() {
  const { companies, addCompany, updateCompany, deleteCompany } = useCompanies();
  const [storeName, setStoreName] = useState("");
  const [details, setDetails] = useState("");
  const [manager, setManager] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return;
    addCompany({
      storeName: storeName.trim(),
      details: details.trim() || "-",
      manager: manager.trim() || "-",
    });
    setStoreName("");
    setDetails("");
    setManager("");
  };

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าหลัก
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          ตั้งค่าชื่อบริษัท
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          จัดการชื่อร้านค้า ที่อยู่/หมายเหตุ และผู้จัดการ
        </p>
      </header>

      <main className="space-y-6 p-6">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
          <h2 className="text-base font-semibold text-slate-900">
            เพิ่มชื่อบริษัท / ร้านค้า
          </h2>
          <form
            onSubmit={handleSubmit}
            className="mt-4 grid gap-4 lg:grid-cols-2"
          >
            <label className="block lg:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                ชื่อร้านค้า <span className="text-rose-500">*</span>
              </span>
              <input
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="เช่น บริษัท ตัวอย่าง จำกัด"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
              />
            </label>
            <label className="block lg:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                รายละเอียด / หมายเหตุ (ที่อยู่ ฯลฯ)
              </span>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="ที่อยู่หรือรายละเอียดเพิ่มเติม"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                ผู้จัดการ
              </span>
              <input
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
              />
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                บันทึก
              </button>
            </div>
          </form>
        </section>

        <CompanyNamesTable
          companies={companies}
          onUpdate={(id, patch) => updateCompany(id, patch)}
          onDelete={deleteCompany}
        />
      </main>
    </>
  );
}
