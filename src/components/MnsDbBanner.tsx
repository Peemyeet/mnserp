import { PlugZap, ServerCrash } from "lucide-react";
import { useMnsConnection } from "../context/MnsConnectionContext";

/** แจ้งเฉพาะเมื่อ API หรือ MySQL ยังไม่พร้อม — ตอนใช้งานปกติไม่แสดงแถบ */
export function MnsDbBanner() {
  const conn = useMnsConnection();

  if (!conn.ready) {
    return (
      <div className="border-b border-slate-100 bg-slate-50/80 px-3 py-1.5 text-center text-xs text-slate-500">
        กำลังเชื่อมต่อ…
      </div>
    );
  }

  if (conn.apiOk && conn.db) {
    return null;
  }

  if (!conn.apiOk) {
    return (
      <div className="border-b border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-950">
        <p className="flex flex-wrap items-center justify-center gap-2">
          <ServerCrash className="h-4 w-4 shrink-0" aria-hidden />
          <span>ไม่พบ API — ลองรัน <span className="font-mono text-xs">npm run dev:all</span></span>
        </p>
      </div>
    );
  }

  return (
    <div className="border-b border-rose-200 bg-rose-50 px-3 py-2 text-center text-sm text-rose-950">
      <p className="flex flex-wrap items-center justify-center gap-2">
        <PlugZap className="h-4 w-4 shrink-0" aria-hidden />
        <span>เชื่อมฐานข้อมูลไม่ได้ — ตรวจ <span className="font-mono text-xs">server/.env</span> และ{" "}
        <span className="font-mono text-xs">database/IMPORT.txt</span></span>
      </p>
      {conn.message && !conn.message.includes("ยังไม่ได้ตั้ง MySQL") ? (
        <p className="mt-1 font-mono text-[11px] text-rose-800">{conn.message}</p>
      ) : null}
      {conn.message?.includes("127.0.0.1") ? (
        <p className="mt-1 text-[11px] text-rose-800">
          ค่านี้มาจาก API บนโฮสต์ — แก้ <span className="font-mono">server/.env</span> ที่เซิร์ฟเวอร์แล้วรีสตาร์ท Node
          (ไฟล์ <span className="font-mono">.env</span> มักไม่ถูก push ต้องอัปโหลดแยก)
        </p>
      ) : null}
      {conn.message?.includes("Access denied for user") ? (
        <p className="mt-1 text-[11px] text-rose-800">
          MySQL ปฏิเสธสิทธิ์จาก IP นี้ — ตรวจ user/password ใน{" "}
          <span className="font-mono">server/.env</span> และเปิด Remote MySQL (หรือรัน API บนโฮสต์เดียวกับฐาน)
        </p>
      ) : null}
      {conn.dbDebug?.hint ? (
        <p className="mt-1 text-[11px] text-rose-900">{conn.dbDebug.hint}</p>
      ) : conn.dbDebug?.mysqlUser ? (
        <p className="mt-1 font-mono text-[10px] text-rose-800">
          แอปใช้ MySQL: user={conn.dbDebug.mysqlUser} host={conn.dbDebug.mysqlHost ?? "?"}{" "}
          (แหล่งค่า: {String(conn.dbDebug.mysqlResolvedFrom ?? "?")})
        </p>
      ) : null}
    </div>
  );
}
