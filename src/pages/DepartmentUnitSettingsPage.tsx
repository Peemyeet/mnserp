import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { SettingsBackLink } from "../components/settings/SettingsBackLink";
import { SettingsBluePanel } from "../components/settings/SettingsBluePanel";
import { useOrgSettings } from "../context/OrgSettingsContext";
import type { DepartmentUnit } from "../types/orgSettings";

export function DepartmentUnitSettingsPage() {
  const {
    departmentUnits,
    addDepartmentUnit,
    updateDepartmentUnit,
    deleteDepartmentUnit,
  } = useOrgSettings();
  const [panelOpen, setPanelOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [viewRow, setViewRow] = useState<DepartmentUnit | null>(null);

  const resetForm = () => {
    setName("");
    setDetails("");
    setEditingId(null);
  };

  const startEdit = (d: DepartmentUnit) => {
    setEditingId(d.id);
    setName(d.name);
    setDetails(d.details);
    setPanelOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (editingId) {
      updateDepartmentUnit(editingId, { name, details });
    } else {
      addDepartmentUnit({ name, details });
    }
    resetForm();
  };

  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <SettingsBackLink />
        <h1 className="mt-3 text-2xl font-bold text-slate-900">ตั้งค่าแผนก</h1>
        <p className="text-sm text-slate-500">เพิ่มและจัดการชื่อแผนก</p>
      </header>

      <main className="p-6">
        <SettingsBluePanel
          title="เพิ่มข้อมูลตำแหน่งงาน"
          open={panelOpen}
          onClose={() => {
            setPanelOpen(false);
            resetForm();
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                ชื่อแผนก
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ระบุชื่อตำแหน่งงาน"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                required
              />
              <p className="mt-1 text-xs text-slate-400">เช่น บัญชี - การเงิน</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                รายละเอียด/หมายเหตุ
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="กรอกรายละเอียด"
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600"
                >
                  ยกเลิกแก้ไข
                </button>
              )}
              <button
                type="submit"
                className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                บันทึกข้อมูลแผนก
              </button>
            </div>
          </form>
        </SettingsBluePanel>

        {!panelOpen && (
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="mb-4 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
          >
            + เพิ่มแผนก
          </button>
        )}

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-left">
                <th className="px-3 py-2.5 font-semibold">ลำดับที่</th>
                <th className="px-3 py-2.5 font-semibold">ชื่อแผนก</th>
                <th className="px-3 py-2.5 font-semibold">รายละเอียด/หมายเหตุ</th>
                <th className="px-3 py-2.5 text-center font-semibold">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {departmentUnits.map((d, i) => (
                <tr
                  key={d.id}
                  className="border-b border-slate-100 odd:bg-white even:bg-slate-50/50"
                >
                  <td className="px-3 py-2.5">{i + 1}</td>
                  <td className="px-3 py-2.5 font-medium">{d.name}</td>
                  <td className="px-3 py-2.5 text-slate-600">
                    {d.details || "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setViewRow(d)}
                        className="rounded p-1.5 text-slate-600 hover:bg-slate-100"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(d)}
                        className="rounded p-1.5 text-slate-600 hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`ลบ "${d.name}" ?`))
                            deleteDepartmentUnit(d.id);
                        }}
                        className="rounded p-1.5 text-slate-600 hover:bg-slate-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {viewRow && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
          <div className="max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="font-semibold">{viewRow.name}</h3>
            <p className="mt-2 text-sm text-slate-600">{viewRow.details || "—"}</p>
            <button
              type="button"
              onClick={() => setViewRow(null)}
              className="mt-4 w-full rounded-xl bg-slate-100 py-2 text-sm"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
