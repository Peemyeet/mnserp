import { Database, PlugZap, ServerCrash } from "lucide-react";
import { useMnsConnection } from "../context/MnsConnectionContext";

/**
 * แจ้งเมื่อยังใช้ข้อมูลตัวอย่างเพราะ API หรือฐานข้อมูล MySQL ไม่พร้อม
 */
export function MnsDbBanner() {
  const conn = useMnsConnection();

  if (!conn.ready) {
    return (
      <div className="border-b border-slate-200/80 bg-slate-50 px-4 py-2 text-center text-sm text-slate-600">
        กำลังตรวจสอบการเชื่อมต่อ API / ฐานข้อมูล…
      </div>
    );
  }

  if (conn.apiOk && conn.db) {
    return (
      <div
        className="flex items-center justify-center gap-2 border-b border-emerald-200/80 bg-emerald-50/90 px-4 py-1.5 text-center text-xs text-emerald-900"
        data-mns-db-backend="mysql"
        role="status"
      >
        <Database className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>
          เชื่อมฐานข้อมูล MySQL แล้ว — ข้อมูลลูกค้า งาน และรายงานโหลดจาก MySQL/MariaDB โดยตรง
        </span>
      </div>
    );
  }

  if (!conn.apiOk) {
    return (
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p className="flex flex-wrap items-center justify-center gap-2 font-medium">
          <ServerCrash className="h-4 w-4 shrink-0" aria-hidden />
          ไม่พบ API ที่ <code className="rounded bg-amber-100/80 px-1.5 py-0.5 text-xs">/api</code>{" "}
          (หรือได้ HTML แทน JSON)
        </p>
        <p className="mt-1.5 text-center text-xs text-amber-900/90">
          รันเทอร์มินัล: <code className="rounded bg-white/80 px-1">npm run dev:all</code> หรือแยกรัน{" "}
          <code className="rounded bg-white/80 px-1">npm run api</code> คู่กับ{" "}
          <code className="rounded bg-white/80 px-1">npm run dev</code> — ให้ Vite proxy ไปพอร์ต API (ดู{" "}
          <code className="rounded bg-white/80 px-1">vite.config.ts</code>)
        </p>
      </div>
    );
  }

  return (
    <div className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-950">
      <p className="flex flex-wrap items-center justify-center gap-2 font-medium">
        <PlugZap className="h-4 w-4 shrink-0" aria-hidden />
        API ทำงาน แต่เชื่อมฐานข้อมูลไม่ได้
      </p>
      <p className="mt-1.5 text-center text-xs text-rose-900/90">
        (1) ใน <code className="rounded bg-white/80 px-1">server/.env</code> ต้องเป็น MySQL: แยก{" "}
        <code className="rounded bg-white/80 px-1">DB_HOST</code> …{" "}
        <code className="rounded bg-white/80 px-1">DB_PASSWORD</code> หรือ{" "}
        <code className="rounded bg-white/80 px-1">DATABASE_URL=mysql://…</code> — ลบ{" "}
        <code className="rounded bg-white/80 px-1">postgresql://</code> ทุกบรรทัด (ดู{" "}
        <code className="rounded bg-white/80 px-1">server/.env.example</code>) — ถ้าแก้แล้วยังผิด ลอง{" "}
        <code className="rounded bg-white/80 px-1">unset DATABASE_URL</code> ในเทอร์มินัลแล้วรัน API ใหม่
        <br />
        (2) รีสตาร์ท <code className="rounded bg-white/80 px-1">npm run api</code> — import{" "}
        <code className="rounded bg-white/80 px-1">database/mns_pm_2021.sql</code> (หรือ{" "}
        <code className="rounded bg-white/80 px-1">db_mns.sql</code>) ให้ตรง{" "}
        <code className="rounded bg-white/80 px-1">DB_DATABASE</code> (ดู{" "}
        <code className="rounded bg-white/80 px-1">database/IMPORT.txt</code>)
        {conn.message &&
        !conn.message.includes("ยังเห็น postgresql://") &&
        !conn.message.includes("ยังไม่ได้ตั้ง MySQL") ? (
          <span className="mt-1 block font-mono text-[11px] text-rose-800">{conn.message}</span>
        ) : null}
      </p>
    </div>
  );
}
