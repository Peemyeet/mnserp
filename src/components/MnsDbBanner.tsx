import { Database, PlugZap, ServerCrash } from "lucide-react";
import { useMnsConnection } from "../context/MnsConnectionContext";

/**
 * แจ้งเมื่อยังใช้ข้อมูลตัวอย่างเพราะ API หรือ MySQL ไม่พร้อม
 */
export function MnsDbBanner() {
  const conn = useMnsConnection();

  if (!conn.ready) {
    return (
      <div className="border-b border-slate-200/80 bg-slate-50 px-4 py-2 text-center text-sm text-slate-600">
        กำลังตรวจสอบการเชื่อมต่อ API / MySQL…
      </div>
    );
  }

  if (conn.apiOk && conn.db) {
    return (
      <div className="flex items-center justify-center gap-2 border-b border-emerald-200/80 bg-emerald-50/90 px-4 py-1.5 text-center text-xs text-emerald-900">
        <Database className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>
          เชื่อม MySQL แล้ว — ลูกค้า งาน และรีพอร์ตดึงจากฐานข้อมูล
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
        API ทำงาน แต่เชื่อม MySQL ไม่ได้
      </p>
      <p className="mt-1.5 text-center text-xs text-rose-900/90">
        สร้างฐาน <code className="rounded bg-white/80 px-1">db_mns</code> แล้ว import{" "}
        <code className="rounded bg-white/80 px-1">database/db_mns.sql</code> — ตั้งค่าใน{" "}
        <code className="rounded bg-white/80 px-1">server/.env</code> (ดู{" "}
        <code className="rounded bg-white/80 px-1">server/.env.example</code>)
        {conn.message ? (
          <span className="mt-1 block font-mono text-[11px] text-rose-800">
            {conn.message}
          </span>
        ) : null}
      </p>
    </div>
  );
}
