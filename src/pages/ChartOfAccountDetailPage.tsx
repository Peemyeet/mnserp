import { useMemo, useState } from "react";
import { ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import { SettingsBackLink } from "../components/settings/SettingsBackLink";
import { SettingsBluePanel } from "../components/settings/SettingsBluePanel";
import { useOrgSettings } from "../context/OrgSettingsContext";
import type { ChartAccountRow } from "../types/orgSettings";

const FIX_OPTS = ["ไม่มีข้อมูล", "คงที่", "ผันแปร"];

function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function toCsvRow(cells: string[]) {
  return cells.map((c) => `"${c.replace(/"/g, '""')}"`).join(",");
}

export function ChartOfAccountDetailPage() {
  const { accountCode = "" } = useParams<{ accountCode: string }>();
  const {
    chartAccounts,
    addChartAccount,
    updateChartAccount,
    deleteChartAccount,
  } = useOrgSettings();

  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [accountType, setAccountType] = useState("บัญชีย่อย");
  const [fixCost, setFixCost] = useState("ไม่มีข้อมูล");
  const [expenseHistory, setExpenseHistory] = useState("");

  const parent = useMemo(
    () => chartAccounts.find((r) => r.code === accountCode),
    [chartAccounts, accountCode],
  );

  const filtered = useMemo(() => {
    if (!parent) return [];
    const q = search.trim().toLowerCase();
    // แสดงบัญชีย่อยให้เหมือนหน้าหลัก: เน้นรายการในหมวดเดียวกันก่อน
    // ถ้าไม่มีเลย ค่อย fallback เป็นกลุ่มรหัสหลักเดียวกัน
    const byCategory = chartAccounts.filter(
      (r) => r.code !== parent.code && r.category === parent.category,
    );
    const groupPrefix = parent.code[0] ?? "";
    const list =
      byCategory.length > 0
        ? byCategory
        : chartAccounts.filter(
            (r) => r.code !== parent.code && r.code.startsWith(groupPrefix),
          );
    if (!q) return list;
    return list.filter((r) =>
      [r.code, r.name, r.category, r.accountType].join(" ").toLowerCase().includes(q),
    );
  }, [chartAccounts, parent, search]);

  if (!parent) {
    return <Navigate to="/settings/chart-of-accounts" replace />;
  }

  const openNew = () => {
    setEditingId(null);
    setCode("");
    setName("");
    setCategory(parent.category || parent.name);
    setAccountType("บัญชีย่อย");
    setFixCost("ไม่มีข้อมูล");
    setExpenseHistory("");
    setPanelOpen(true);
  };

  const startEdit = (r: ChartAccountRow) => {
    setEditingId(r.id);
    setCode(r.code);
    setName(r.name);
    setCategory(r.category);
    setAccountType(r.accountType);
    setFixCost(r.fixCost || "ไม่มีข้อมูล");
    setExpenseHistory(r.expenseHistory);
    setPanelOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;
    if (editingId) {
      updateChartAccount(editingId, {
        code,
        name,
        category,
        accountType,
        fixCost,
        expenseHistory,
      });
    } else {
      addChartAccount({
        code,
        name,
        category: category || parent.category,
        accountType,
        fixCost,
        expenseHistory,
      });
    }
    setPanelOpen(false);
    setEditingId(null);
  };

  const exportTsv = () => {
    const head = ["รหัส", "ชื่อ", "หมวด", "ประเภท", "FIX", "ประวัติ"];
    const lines = [
      head.join("\t"),
      ...filtered.map((r) =>
        [r.code, r.name, r.category, r.accountType, r.fixCost, r.expenseHistory].join("\t"),
      ),
    ].join("\n");
    return lines;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportTsv());
    } catch {
      downloadText("coa-sub.txt", exportTsv(), "text/plain;charset=utf-8");
    }
  };

  const handleCsv = () => {
    const head = [
      "รหัสผังบัญชี",
      "ชื่อผังบัญชี",
      "หมวด",
      "ประเภท",
      "FIX COUST",
      "ประวัติค่าใช้จ่าย",
    ];
    const rows = filtered.map((r) =>
      toCsvRow([r.code, r.name, r.category, r.accountType, r.fixCost, r.expenseHistory]),
    );
    const csv = "\uFEFF" + [toCsvRow(head), ...rows].join("\r\n");
    downloadText("chart-of-accounts-sub.csv", csv, "text/csv;charset=utf-8");
  };

  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <SettingsBackLink />
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">หมวดบัญชี</h1>
            <p className="text-sm text-slate-500">Chart Of Account</p>
            <nav className="mt-2 flex items-center gap-1 text-xs text-slate-500">
              <span>หัวหมวดบัญชี</span>
              <ChevronRight className="h-3 w-3" />/
              <span className="font-semibold text-violet-700">{parent.name}</span>/
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-violet-700">{parent.code}</span>
            <button
              type="button"
              onClick={openNew}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
            >
              <Plus className="h-4 w-4" />
              New Chart Of Account
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <SettingsBluePanel
          title={editingId ? "แก้ไขผังบัญชีย่อย" : "เพิ่มผังบัญชีย่อย"}
          open={panelOpen}
          onClose={() => {
            setPanelOpen(false);
            setEditingId(null);
          }}
        >
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="font-medium text-slate-700">รหัสผังบัญชี</span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="font-medium text-slate-700">ชื่อผังบัญชี</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-slate-700">หมวด</span>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-slate-700">ประเภท</span>
              <input
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-sm">
              <span className="font-medium text-slate-700">FIX COUST</span>
              <select
                value={fixCost}
                onChange={(e) => setFixCost(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {FIX_OPTS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="font-medium text-slate-700">ประวัติค่าใช้จ่าย</span>
              <input
                value={expenseHistory}
                onChange={(e) => setExpenseHistory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white"
              >
                บันทึก
              </button>
            </div>
          </form>
        </SettingsBluePanel>

        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="rounded border border-slate-300 bg-slate-100 px-3 py-1.5 text-sm"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={() =>
                downloadText(
                  "coa-sub.xls",
                  "\uFEFF" + exportTsv().replace(/\n/g, "\r\n"),
                  "application/vnd.ms-excel",
                )
              }
              className="rounded border border-slate-300 bg-slate-100 px-3 py-1.5 text-sm"
            >
              Excel
            </button>
            <button
              type="button"
              onClick={handleCsv}
              className="rounded border border-slate-300 bg-slate-100 px-3 py-1.5 text-sm"
            >
              CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded border border-slate-300 bg-slate-100 px-3 py-1.5 text-sm"
            >
              PDF
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Search:
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
          </label>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm print:border-0">
          <table className="w-full min-w-[960px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-left text-xs font-semibold text-slate-600">
                <th className="px-3 py-2.5">รหัสผังบัญชี</th>
                <th className="px-3 py-2.5">ชื่อผังบัญชี</th>
                <th className="px-3 py-2.5">หมวด</th>
                <th className="px-3 py-2.5">ประเภท</th>
                <th className="px-3 py-2.5">FIX COUST</th>
                <th className="px-3 py-2.5">ประวัติค่าใช้จ่าย</th>
                <th className="px-3 py-2.5 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-slate-100 odd:bg-white even:bg-slate-50/40"
                >
                  <td className="px-3 py-2.5 font-mono text-xs">{r.code}</td>
                  <td className="px-3 py-2.5 font-medium text-violet-700">{r.name}</td>
                  <td className="px-3 py-2.5 text-slate-700">{r.category}</td>
                  <td className="px-3 py-2.5 text-slate-600">{r.accountType}</td>
                  <td className="px-3 py-2.5">
                    <select
                      value={r.fixCost || "ไม่มีข้อมูล"}
                      onChange={(e) =>
                        updateChartAccount(r.id, { fixCost: e.target.value })
                      }
                      className="w-full min-w-[7rem] rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                    >
                      {FIX_OPTS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2.5 text-slate-500">{r.expenseHistory || "—"}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(r)}
                        className="rounded p-1.5 text-orange-500 hover:bg-orange-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`ลบ ${r.code} ?`)) deleteChartAccount(r.id);
                        }}
                        className="rounded p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-500">
                    ยังไม่มีบัญชีย่อยในหมวดนี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
          <span>
            Showing {filtered.length === 0 ? 0 : 1} to {filtered.length} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled
              className="rounded border border-slate-200 px-3 py-1 text-xs text-slate-400 disabled:opacity-60"
            >
              Previous
            </button>
            <span className="rounded bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white">
              1
            </span>
            <button
              type="button"
              disabled
              className="rounded border border-slate-200 px-3 py-1 text-xs text-slate-400 disabled:opacity-60"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
