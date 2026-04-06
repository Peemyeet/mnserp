import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { SettingsBackLink } from "../components/settings/SettingsBackLink";
import { SettingsBluePanel } from "../components/settings/SettingsBluePanel";
import { useOrgSettings } from "../context/OrgSettingsContext";
import type { WarehouseKind, WarehouseRow } from "../types/orgSettings";

const TABS: { id: WarehouseKind; labelTh: string; labelEn: string }[] = [
  { id: "spare", labelTh: "คลังอะไหล่", labelEn: "Spare parts warehouse" },
  { id: "production", labelTh: "คลังผลิต", labelEn: "Production warehouse" },
  { id: "sales", labelTh: "คลังขาย", labelEn: "Sales warehouse" },
];

export function WarehouseSettingsPage() {
  const [searchParams] = useSearchParams();
  const { warehouses, addWarehouse, updateWarehouse, deleteWarehouse } =
    useOrgSettings();
  const [tab, setTab] = useState<WarehouseKind>("spare");

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "spare" || t === "production" || t === "sales") {
      setTab(t);
    }
  }, [searchParams]);
  const [panelOpen, setPanelOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [viewRow, setViewRow] = useState<WarehouseRow | null>(null);

  const rows = warehouses[tab];

  const resetForm = () => {
    setCode("");
    setName("");
    setDetails("");
    setEditingId(null);
  };

  const startEdit = (r: WarehouseRow) => {
    setEditingId(r.id);
    setCode(r.code);
    setName(r.name);
    setDetails(r.details);
    setPanelOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    if (editingId) {
      updateWarehouse(tab, editingId, { code, name, details });
    } else {
      addWarehouse(tab, { code, name, details });
    }
    resetForm();
  };

  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <SettingsBackLink />
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          ตั้งค่าคลังสินค้า
        </h1>
        <p className="text-sm text-slate-500">
          แยกคลังอะไหล่ · คลังผลิต · คลังขาย
        </p>
      </header>

      <main className="p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                resetForm();
              }}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                tab === t.id
                  ? "border-violet-500 bg-violet-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-violet-200"
              }`}
            >
              {t.labelTh}
              <span className="ml-1 text-xs font-normal opacity-80">
                ({t.labelEn})
              </span>
            </button>
          ))}
        </div>

        <SettingsBluePanel
          title={`เพิ่มคลัง — ${TABS.find((x) => x.id === tab)?.labelTh}`}
          open={panelOpen}
          onClose={() => {
            setPanelOpen(false);
            resetForm();
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block text-sm">
              <span className="font-medium text-slate-700">รหัสคลัง</span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">ชื่อคลัง / ร้านค้า</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">รายละเอียด</span>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <div className="flex justify-end gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
                >
                  ยกเลิกแก้ไข
                </button>
              )}
              <button
                type="submit"
                className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white"
              >
                บันทึก
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
            + เพิ่มคลัง
          </button>
        )}

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-left">
                <th className="px-3 py-2.5 font-semibold">ลำดับที่</th>
                <th className="px-3 py-2.5 font-semibold">รหัส</th>
                <th className="px-3 py-2.5 font-semibold">ชื่อ</th>
                <th className="px-3 py-2.5 font-semibold">รายละเอียด</th>
                <th className="px-3 py-2.5 text-center font-semibold">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-100 odd:bg-white even:bg-slate-50/50"
                >
                  <td className="px-3 py-2.5">{i + 1}</td>
                  <td className="px-3 py-2.5 font-mono text-xs">{r.code}</td>
                  <td className="px-3 py-2.5 font-medium">{r.name}</td>
                  <td className="px-3 py-2.5 text-slate-600">
                    {r.details || "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setViewRow(r)}
                        className="rounded p-1.5 text-slate-600 hover:bg-slate-100"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(r)}
                        className="rounded p-1.5 text-slate-600 hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`ลบ "${r.name}" ?`))
                            deleteWarehouse(tab, r.id);
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
            <p className="font-mono text-xs text-slate-500">{viewRow.code}</p>
            <h3 className="mt-1 font-semibold">{viewRow.name}</h3>
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
