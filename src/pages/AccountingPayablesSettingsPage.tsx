import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TABLE_HEADERS = [
  "ลำดับที่",
  "Supplier Code",
  "ชื่อร้านค้า",
  "รายละเอียด/หมายเหตุ",
  "เบอร์โทรศัพท์",
  "จำนวนวันเครดิต",
  "จัดการ",
];

export function AccountingPayablesSettingsPage() {
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
        <h1 className="mt-3 text-2xl font-bold text-slate-900">บัญชีเจ้าหนี้ (ที่เราต้องจ่าย)</h1>
        <p className="mt-1 text-sm text-slate-500">ตั้งค่ารายการร้านค้าเจ้าหนี้ในระบบ</p>
      </header>

      <main className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            เพิ่มร้านค้า
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Search:</span>
            <input
              type="text"
              className="w-56 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Show</span>
          <select className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          <span>entries</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr>
                {TABLE_HEADERS.map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-sm font-semibold text-slate-700"
                  >
                    <span className="inline-flex items-center gap-1">
                      {h}
                      <span className="text-xs text-slate-300">⇅</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={TABLE_HEADERS.length} className="px-4 py-10 text-center text-slate-400">
                  ยังไม่มีข้อมูลร้านค้าเจ้าหนี้
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
