import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { DeptPageFrame } from "../components/dept/DeptPageFrame";
import { PmUserList } from "../components/pm-api/PmUserList";
import { useUsers } from "../hooks/useUsers";
import {
  createPmUser,
  getPm2021ApiBase,
} from "../services/pmUsersApi";

/**
 * หน้าทดสอบแยก — ผูกกับ PHP /api/v1/users/*.php และตาราง user_data
 * ไม่แตะ legacy signin; ตั้ง VITE_PM2021_API_BASE ให้ชี้โฮสต์ที่วางไฟล์ api/v1/
 */
export function PmApiUsersTestPage() {
  const [baseOverride, setBaseOverride] = useState("");
  const apiBase = baseOverride.trim() || getPm2021ApiBase();
  const { users, loading, error, refetch } = useUsers(apiBase);

  const [form, setForm] = useState({
    fname: "",
    lname: "",
    email: "",
    username: "",
    password: "",
  });
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateMsg(null);
    setCreating(true);
    try {
      const res = await createPmUser(
        {
          fname: form.fname.trim(),
          lname: form.lname.trim(),
          email: form.email.trim(),
          username: form.username.trim(),
          password: form.password,
        },
        apiBase
      );
      if (res.ok) {
        setCreateMsg(`สร้างผู้ใช้สำเร็จ user_id=${res.user_id}`);
        setForm((f) => ({ ...f, password: "" }));
        await refetch();
      } else {
        setCreateMsg(res.message || "สร้างไม่สำเร็จ");
      }
    } catch (err) {
      setCreateMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <DeptPageFrame>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าหลัก
        </Link>
        <span className="text-slate-300">|</span>
        <h1 className="text-lg font-semibold text-slate-900">
          ทดสอบ PM API — user_data
        </h1>
      </div>

      <p className="max-w-3xl text-sm text-slate-600">
        GET <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">/api-new/read.php</code>
        {" · "}
        POST <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">/api-new/create.php</code>
        {" "}(โฟลเดอร์: <code className="text-xs">public_html/api-new/</code>)
      </p>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Base URL (ว่าง = ใช้ VITE_PM2021_API_BASE หรือโดเมนเริ่มต้น)
        </label>
        <input
          className="mt-1 w-full max-w-xl rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={baseOverride}
          onChange={(e) => setBaseOverride(e.target.value)}
          placeholder={getPm2021ApiBase()}
        />
        <p className="mt-1 text-xs text-slate-500">
          ปัจจุบันเรียก: <span className="font-mono">{apiBase}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          โหลดรายชื่อใหม่
        </button>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-800">รายชื่อ</h2>
        <PmUserList users={users} loading={loading} error={error} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          สร้างผู้ใช้ (POST create.php)
        </h2>
        <form onSubmit={handleCreate} className="grid max-w-lg gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-slate-600 sm:col-span-1">
            ชื่อ
            <input
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.fname}
              onChange={(e) => setForm((f) => ({ ...f, fname: e.target.value }))}
            />
          </label>
          <label className="text-xs font-medium text-slate-600 sm:col-span-1">
            นามสกุล
            <input
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.lname}
              onChange={(e) => setForm((f) => ({ ...f, lname: e.target.value }))}
            />
          </label>
          <label className="text-xs font-medium text-slate-600 sm:col-span-2">
            อีเมล
            <input
              required
              type="email"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </label>
          <label className="text-xs font-medium text-slate-600 sm:col-span-1">
            username
            <input
              required
              maxLength={30}
              autoComplete="username"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            />
          </label>
          <label className="text-xs font-medium text-slate-600 sm:col-span-1">
            รหัสผ่าน
            <input
              required
              type="password"
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {creating ? "กำลังส่ง…" : "สร้างผู้ใช้"}
            </button>
            {createMsg ? (
              <p className="mt-2 text-sm text-slate-700">{createMsg}</p>
            ) : null}
          </div>
        </form>
      </section>
    </DeptPageFrame>
  );
}
