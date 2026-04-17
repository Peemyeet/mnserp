import type { PmUserRow } from "../../services/pmUsersApi";

export function PmUserList({
  users,
  loading,
  error,
}: {
  users: PmUserRow[];
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <p className="text-sm text-slate-600" role="status">
        กำลังโหลดรายชื่อ…
      </p>
    );
  }
  if (error) {
    return (
      <div
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        role="alert"
      >
        {error}
        <span className="mt-1 block text-xs text-red-700/90">
          ถ้าเปิดจาก localhost ให้ตรวจ CORS ที่โฮสต์ PHP (PM_API_CORS_ORIGIN) หรือทดสอบด้วย curl
        </span>
      </div>
    );
  }
  if (users.length === 0) {
    return <p className="text-sm text-slate-600">ยังไม่มีข้อมูลผู้ใช้</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th className="px-3 py-2">#</th>
            <th className="px-3 py-2">ชื่อ</th>
            <th className="px-3 py-2">นามสกุล</th>
            <th className="px-3 py-2">อีเมล</th>
            <th className="px-3 py-2">username</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((u) => (
            <tr key={u.user_id} className="hover:bg-slate-50/80">
              <td className="whitespace-nowrap px-3 py-2 text-slate-500">
                {u.user_id}
              </td>
              <td className="px-3 py-2 text-slate-900">{u.fname || "—"}</td>
              <td className="px-3 py-2 text-slate-900">{u.lname || "—"}</td>
              <td className="px-3 py-2 text-slate-700">{u.email || "—"}</td>
              <td className="font-mono text-xs text-slate-800">{u.username}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
