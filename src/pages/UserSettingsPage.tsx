import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { SortableTh } from "../components/warehouse/SortableTh";
import { useMnsConnection } from "../context/MnsConnectionContext";
import { mnsFetch } from "../services/mnsApi";
import type { MnsUserGroupRow, MnsUserRow } from "../types/mnsUser";

type SortKey =
  | "fullName"
  | "nickname"
  | "phone"
  | "status"
  | "company"
  | "sick"
  | "vacation"
  | "salesTarget";

const STATUS_OPTIONS = ["ทดลองงาน", "บรรจุ", "ประจำ"] as const;

function formatPhoneDisplay(s: string) {
  const d = s.replace(/\D/g, "");
  if (d.length === 10 && d.startsWith("0")) {
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return s || "—";
}

function fmtBaht(n: number) {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 0 });
}

function downloadCsv(filename: string, content: string) {
  const bom = "\uFEFF";
  const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function UserSettingsPage() {
  const conn = useMnsConnection();
  const [rows, setRows] = useState<MnsUserRow[]>([]);
  const [groups, setGroups] = useState<MnsUserGroupRow[]>([]);
  const [extendedColumns, setExtendedColumns] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("fullName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<MnsUserRow | null>(null);
  const [form, setForm] = useState({
    fname: "",
    lname: "",
    nickname: "",
    phonenumber: "",
    employment_status: "บรรจุ",
    company_display: "",
    sick_leave_days: 0,
    vacation_days: 0,
    sales_target_baht: 0,
    user_gid: 1,
    position: "",
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!conn.ready || !conn.apiOk || !conn.db) {
      setLoading(false);
      setRows([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [u, g] = await Promise.all([
        mnsFetch<{ ok: boolean; rows: MnsUserRow[]; extendedColumns?: boolean }>(
          "/users"
        ),
        mnsFetch<{ ok: boolean; rows: MnsUserGroupRow[] }>("/users/groups"),
      ]);
      setRows(u.rows ?? []);
      setExtendedColumns(u.extendedColumns ?? false);
      setGroups(g.rows ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [conn.ready, conn.apiOk, conn.db]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const blob = [
        r.fname,
        r.lname,
        r.nickname,
        r.username,
        r.phonenumber,
        r.employment_status,
        r.company_display,
        r.position,
        r.group_name,
        String(r.sales_target_baht ?? 0),
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [rows, search]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "fullName":
          cmp = `${a.fname}${a.lname}`.localeCompare(`${b.fname}${b.lname}`, "th");
          break;
        case "nickname":
          cmp = a.nickname.localeCompare(b.nickname, "th");
          break;
        case "phone":
          cmp = a.phonenumber.localeCompare(b.phonenumber);
          break;
        case "status":
          cmp = a.employment_status.localeCompare(b.employment_status, "th");
          break;
        case "company":
          cmp = a.company_display.localeCompare(b.company_display, "th");
          break;
        case "sick":
          cmp = a.sick_leave_days - b.sick_leave_days;
          break;
        case "vacation":
          cmp = a.vacation_days - b.vacation_days;
          break;
        case "salesTarget":
          cmp = (a.sales_target_baht ?? 0) - (b.sales_target_baht ?? 0);
          break;
        default:
          cmp = 0;
      }
      return cmp * dir;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const openEdit = (r: MnsUserRow) => {
    setEditing(r);
    setForm({
      fname: r.fname,
      lname: r.lname,
      nickname: r.nickname,
      phonenumber: r.phonenumber,
      employment_status: (STATUS_OPTIONS as readonly string[]).includes(
        r.employment_status
      )
        ? r.employment_status
        : r.loginstatus === 1
          ? "บรรจุ"
          : "ทดลองงาน",
      company_display:
        r.company_display === "ยังไม่ได้ระบุ" ? "" : r.company_display,
      sick_leave_days: r.sick_leave_days,
      vacation_days: r.vacation_days,
      sales_target_baht: r.sales_target_baht ?? 0,
      user_gid: r.user_gid,
      position: r.position,
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await mnsFetch<{ ok: boolean; row: MnsUserRow }>(
        `/users/${editing.user_id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            fname: form.fname,
            lname: form.lname,
            nickname: form.nickname,
            phonenumber: form.phonenumber,
            employment_status: form.employment_status,
            company_display: form.company_display,
            sick_leave_days: form.sick_leave_days,
            vacation_days: form.vacation_days,
            sales_target_baht: form.sales_target_baht,
            user_gid: form.user_gid,
            position: form.position,
          }),
        }
      );
      setRows((prev) =>
        prev.map((x) => (x.user_id === res.row.user_id ? res.row : x))
      );
      setEditOpen(false);
      setEditing(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const removeUser = async (r: MnsUserRow) => {
    if (
      !window.confirm(
        `ลบ "${r.fname} ${r.lname}" ออกจากรายการที่แสดง? (ซ่อนในฐานข้อมูล)`
      )
    ) {
      return;
    }
    try {
      await mnsFetch(`/users/${r.user_id}`, { method: "DELETE" });
      setRows((prev) => prev.filter((x) => x.user_id !== r.user_id));
    } catch (e) {
      alert(e instanceof Error ? e.message : String(e));
    }
  };

  const tableText = useMemo(() => {
    const header = [
      "ลำดับ",
      "ชื่อ-นามสกุล",
      "ชื่อเล่น",
      "เบอร์โทรศัพท์",
      "สถานะ",
      "บริษัท",
      "สิทธิ์ลาป่วย",
      "สิทธิ์พักร้อน",
      "เป้าขาย KPI (บาท)",
      "กลุ่มสิทธิ์",
      "ตำแหน่ง (ข้อความ)",
    ].join("\t");
    const lines = sorted.map((r, i) =>
      [
        i + 1,
        `${r.fname} ${r.lname}`,
        r.nickname,
        r.phonenumber,
        r.employment_status,
        r.company_display,
        r.sick_leave_days,
        r.vacation_days,
        r.sales_target_baht ?? 0,
        r.group_name,
        r.position,
      ].join("\t")
    );
    return [header, ...lines].join("\n");
  }, [sorted]);

  const copyTable = async () => {
    try {
      await navigator.clipboard.writeText(tableText);
      alert("คัดลอกไปยังคลิปบอร์ดแล้ว");
    } catch {
      alert("คัดลอกไม่สำเร็จ");
    }
  };

  const exportCsv = () => {
    const header =
      "ลำดับ,ชื่อ-นามสกุล,ชื่อเล่น,เบอร์โทร,สถานะ,บริษัท,ลาป่วย,พักร้อน,เป้าขาย_KPI_บาท,กลุ่ม,ตำแหน่ง";
    const lines = sorted.map((r, i) => {
      const esc = (s: string) =>
        `"${String(s).replace(/"/g, '""')}"`;
      return [
        i + 1,
        `${r.fname} ${r.lname}`,
        r.nickname,
        r.phonenumber,
        r.employment_status,
        r.company_display,
        r.sick_leave_days,
        r.vacation_days,
        r.sales_target_baht ?? 0,
        r.group_name,
        r.position,
      ]
        .map((x) => esc(String(x)))
        .join(",");
    });
    downloadCsv(`users-${new Date().toISOString().slice(0, 10)}.csv`, [
      header,
      ...lines,
    ].join("\n"));
  };

  const printPdf = () => window.print();

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-6 py-4 print:hidden">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าหลัก
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          ตั้งค่าผู้ใช้
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          จัดการรายชื่อจากตาราง user_data — กำหนด{" "}
          <strong className="font-medium text-slate-700">เป้าหมายยอดขาย (บาท)</strong>{" "}
          เพื่อวัด KPI ในหน้ารีพอร์ตฝ่ายขาย (ถ้าไม่ระบุ ระบบจะใช้สูตรจากยอดจริง)
        </p>
      </header>

      <main className="space-y-4 p-6">
        {!conn.ready || loading ? (
          <p className="text-sm text-slate-600">กำลังโหลด…</p>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        ) : null}

        {!conn.apiOk || !conn.db ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            ยังเชื่อม MySQL ไม่ได้ — เปิด API และฐานข้อมูลก่อน จึงจะโหลดรายชื่อผู้ใช้ได้
          </div>
        ) : null}

        {!extendedColumns && conn.db ? (
          <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-xs text-sky-950">
            ฐานข้อมูลยังไม่มีคอลัมน์ชื่อเล่น/สิทธิ์ลา — รันไฟล์{" "}
            <code className="rounded bg-white/80 px-1">database/migrations/001_user_hr_extend.sql</code>{" "}
            และ{" "}
            <code className="rounded bg-white/80 px-1">002_sales_target_baht.sql</code>{" "}
            สำหรับเป้าขาย KPI
          </div>
        ) : null}

        <div
          id="user-settings-table-wrap"
          className="rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80 print:border-0 print:shadow-none"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 print:hidden">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void copyTable()}
                className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-200/80"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={exportCsv}
                className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-200/80"
              >
                CSV
              </button>
              <button
                type="button"
                onClick={printPdf}
                className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-200/80"
              >
                PDF
              </button>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <Search className="h-4 w-4 text-slate-400" aria-hidden />
              <span className="whitespace-nowrap">Search:</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 min-w-[8rem] rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-indigo-400"
                placeholder="ค้นหา…"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] border-collapse text-left text-sm print:min-w-0">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90">
                  <th className="whitespace-nowrap px-3 py-3 text-left text-sm font-semibold text-slate-600">
                    ลำดับที่
                  </th>
                  <SortableTh
                    label="ชื่อ-นามสกุล"
                    active={sortKey === "fullName"}
                    dir={sortDir}
                    onClick={() => toggleSort("fullName")}
                  />
                  <SortableTh
                    label="ชื่อเล่น"
                    active={sortKey === "nickname"}
                    dir={sortDir}
                    onClick={() => toggleSort("nickname")}
                  />
                  <SortableTh
                    label="เบอร์โทรศัพท์"
                    active={sortKey === "phone"}
                    dir={sortDir}
                    onClick={() => toggleSort("phone")}
                  />
                  <SortableTh
                    label="สถานะ"
                    active={sortKey === "status"}
                    dir={sortDir}
                    onClick={() => toggleSort("status")}
                  />
                  <SortableTh
                    label="บริษัท"
                    active={sortKey === "company"}
                    dir={sortDir}
                    onClick={() => toggleSort("company")}
                  />
                  <SortableTh
                    label="สิทธิ์ลาป่วย"
                    active={sortKey === "sick"}
                    dir={sortDir}
                    onClick={() => toggleSort("sick")}
                  />
                  <SortableTh
                    label="สิทธิ์พักร้อน"
                    active={sortKey === "vacation"}
                    dir={sortDir}
                    onClick={() => toggleSort("vacation")}
                  />
                  <SortableTh
                    label="เป้าขาย KPI (บาท)"
                    active={sortKey === "salesTarget"}
                    dir={sortDir}
                    onClick={() => toggleSort("salesTarget")}
                  />
                  <th className="whitespace-nowrap px-3 py-3 text-center font-semibold text-slate-600">
                    กลุ่มสิทธิ์
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-left font-semibold text-slate-600">
                    ตำแหน่ง
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 text-center font-semibold text-slate-600 print:hidden">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.length === 0 && !loading ? (
                  <tr>
                    <td
                      colSpan={12}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      {conn.db ? "ไม่มีข้อมูลผู้ใช้" : "—"}
                    </td>
                  </tr>
                ) : (
                  sorted.map((r, idx) => (
                    <tr key={r.user_id} className="hover:bg-slate-50/80">
                      <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-slate-700">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-900">
                        {r.fname} {r.lname}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700">{r.nickname}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                        {formatPhoneDisplay(r.phonenumber)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">
                        {r.employment_status}
                      </td>
                      <td className="max-w-[140px] truncate px-3 py-2.5 text-slate-600">
                        {r.company_display}
                      </td>
                      <td className="px-3 py-2.5 text-center tabular-nums text-slate-700">
                        {r.sick_leave_days}
                      </td>
                      <td className="px-3 py-2.5 text-center tabular-nums text-slate-700">
                        {r.vacation_days}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-slate-800">
                        {(r.sales_target_baht ?? 0) > 0
                          ? fmtBaht(r.sales_target_baht ?? 0)
                          : "—"}
                      </td>
                      <td
                        className="max-w-[120px] truncate px-3 py-2.5 text-center text-xs text-slate-600"
                        title={r.group_name}
                      >
                        {r.group_name || "—"}
                      </td>
                      <td
                        className="max-w-[160px] truncate px-3 py-2.5 text-slate-700"
                        title={r.position}
                      >
                        {r.position || "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 print:hidden">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(r)}
                            className="rounded-lg p-2 text-amber-600 hover:bg-amber-50"
                            aria-label="แก้ไข"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void removeUser(r)}
                            className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                            aria-label="ลบ"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-slate-400 print:hidden">
          ปุ่ม PDF ใช้พิมพ์ผ่านเบราว์เซอร์แล้วเลือก &quot;บันทึกเป็น PDF&quot;
        </p>
      </main>

      {editOpen && editing ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 print:hidden"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="ปิด"
            onClick={() => {
              setEditOpen(false);
              setEditing(null);
            }}
          />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              แก้ไขผู้ใช้ — {editing.fname} {editing.lname}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-1">
                <span className="text-xs font-medium text-slate-600">ชื่อ</span>
                <input
                  value={form.fname}
                  onChange={(e) => setForm((f) => ({ ...f, fname: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block sm:col-span-1">
                <span className="text-xs font-medium text-slate-600">นามสกุล</span>
                <input
                  value={form.lname}
                  onChange={(e) => setForm((f) => ({ ...f, lname: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-slate-600">ชื่อเล่น</span>
                <input
                  value={form.nickname}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nickname: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-slate-600">
                  เบอร์โทรศัพท์
                </span>
                <input
                  value={form.phonenumber}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phonenumber: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block sm:col-span-1">
                <span className="text-xs font-medium text-slate-600">สถานะ</span>
                <select
                  value={form.employment_status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      employment_status: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-1">
                <span className="text-xs font-medium text-slate-600">
                  กลุ่มสิทธิ์ / แผนก
                </span>
                <select
                  value={form.user_gid}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      user_gid: Number(e.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {groups.length === 0 ? (
                    <option value={form.user_gid}>กลุ่ม #{form.user_gid}</option>
                  ) : (
                    groups.map((g) => (
                      <option key={g.group_id} value={g.group_id}>
                        {g.group_name}
                      </option>
                    ))
                  )}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-slate-600">
                  ตำแหน่ง (ข้อความ)
                </span>
                <input
                  value={form.position}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, position: e.target.value }))
                  }
                  placeholder="เช่น ผู้จัดการ, ช่างซ่อม, พนักงานขาย"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-slate-600">บริษัท</span>
                <input
                  value={form.company_display}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, company_display: e.target.value }))
                  }
                  placeholder="ว่างได้ — จะแสดงเป็นยังไม่ได้ระบุ"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block sm:col-span-1">
                <span className="text-xs font-medium text-slate-600">
                  สิทธิ์ลาป่วย (วัน)
                </span>
                <input
                  type="number"
                  min={0}
                  value={form.sick_leave_days}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sick_leave_days: Math.max(0, Number(e.target.value) || 0),
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block sm:col-span-1">
                <span className="text-xs font-medium text-slate-600">
                  สิทธิ์พักร้อน (วัน)
                </span>
                <input
                  type="number"
                  min={0}
                  value={form.vacation_days}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      vacation_days: Math.max(0, Number(e.target.value) || 0),
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-slate-600">
                  เป้าหมายยอดขาย KPI ฝ่ายขาย (บาท)
                </span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.sales_target_baht}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sales_target_baht: Math.max(
                        0,
                        Number(e.target.value) || 0
                      ),
                    }))
                  }
                  placeholder="0 = คำนวณอัตโนมัติจากยอดจริง"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <p className="mt-1 text-[11px] leading-snug text-slate-500">
                  ใช้ในหน้ารีพอร์ตฝ่ายขาย — ถ้าเป็น 0 ระบบใช้สูตรจากยอดใบเสนอราคา (ประมาณ 112%
                  ของยอดทำได้)
                </p>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditOpen(false);
                  setEditing(null);
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveEdit()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก…" : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
