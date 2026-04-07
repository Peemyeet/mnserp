import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CustomerTable } from "../components/CustomerTable";
import { useCustomers } from "../context/CustomersContext";

const REGIONS = [
  "ภาคกลาง",
  "ภาคเหนือ",
  "ภาคตะวันออก",
  "ภาคตะวันออกเฉียงเหนือ",
  "ภาคใต้",
] as const;

const GRADES = ["A", "B", "C"] as const;

export function CustomerSettingsPage() {
  const { customers, addCustomer, updateCustomer } = useCustomers();
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [salesPersonName, setSalesPersonName] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [region, setRegion] = useState<string>(REGIONS[0]);
  const [grade, setGrade] = useState<string>(GRADES[1]);
  const [frequency, setFrequency] = useState("0");
  const [detailNote, setDetailNote] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim()) return;
    try {
      await addCustomer({
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        phone: phone.trim() || "-",
        salesPersonName: salesPersonName.trim() || "-",
        customerType: customerType.trim() || "-",
        region,
        grade,
        frequency: Math.max(0, parseInt(frequency, 10) || 0),
        detailNote: detailNote.trim() || undefined,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
      return;
    }
    setCompanyName("");
    setContactName("");
    setPhone("");
    setSalesPersonName("");
    setCustomerType("");
    setRegion(REGIONS[0]);
    setGrade(GRADES[1]);
    setFrequency("0");
    setDetailNote("");
  };

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-6 py-4 print:border-0">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 print:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าหลัก
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          ตั้งค่าลูกค้า
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          บันทึกชื่อบริษัทและข้อมูลติดต่อ — รหัสลูกค้าสร้างอัตโนมัติ
        </p>
      </header>

      <main className="space-y-6 p-6">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card print:hidden">
          <h2 className="text-base font-semibold text-slate-900">
            เพิ่มลูกค้าใหม่
          </h2>
          <form
            onSubmit={handleSubmit}
            className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <label className="block sm:col-span-2 lg:col-span-1">
              <span className="text-sm font-medium text-slate-700">
                รายชื่อบริษัท / ชื่อลูกค้า <span className="text-rose-500">*</span>
              </span>
              <input
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="เช่น บริษัท ตัวอย่าง จำกัด"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                ชื่อผู้ติดต่อ <span className="text-rose-500">*</span>
              </span>
              <input
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                เบอร์โทร.
              </span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                ชื่อพนักงานขาย
              </span>
              <input
                value={salesPersonName}
                onChange={(e) => setSalesPersonName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                ประเภทลูกค้า
              </span>
              <input
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value)}
                placeholder="เช่น งานผลิต นำเข้า"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">ภูมิภาค</span>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Grade</span>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">ความถี่</span>
              <input
                type="number"
                min={0}
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">
                หมายเหตุ (แสดงเมื่อกด +)
              </span>
              <input
                value={detailNote}
                onChange={(e) => setDetailNote(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
              />
            </label>
            <div className="flex items-end sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                บันทึกลูกค้า
              </button>
            </div>
          </form>
        </section>

        <section className="print:shadow-none">
          <CustomerTable
            customers={customers}
            onUpdateCustomerType={(id, customerType) =>
              updateCustomer(id, { customerType })
            }
          />
        </section>
      </main>
    </>
  );
}
