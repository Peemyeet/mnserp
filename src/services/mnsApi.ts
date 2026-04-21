/**
 * - dev: ใช้ `/api` แล้วให้ Vite proxy ไปที่ API (vite.config.ts)
 * - build ที่โหลดจากโดเมนอื่น: ตั้ง `VITE_MNS_API_BASE=https://your-api.example.com/api`
 */
export const API_BASE = import.meta.env.VITE_MNS_API_BASE ?? "/api";

function apiUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE.replace(/\/$/, "")}${p}`;
}

export type MnsHealthDbDebug = {
  mysqlResolvedFrom?: string | null;
  mysqlUser?: string;
  mysqlHost?: string;
  mysqlPort?: number;
  mysqlDatabase?: string | null;
  envFileMysqlUser?: string;
  envFileMysqlHost?: string;
  hint?: string;
  mysqlConfigured?: boolean;
  mysqlUrlParseError?: boolean;
};

/** ตรวจสอบ /health แบบไม่พึ่ง mnsFetch (กันกรณี response ไม่ใช่ JSON / โปรซีล้ม) */
export async function getMnsConnection(): Promise<{
  apiOk: boolean;
  db: boolean;
  healthMessage?: string;
  dbDebug?: MnsHealthDbDebug;
}> {
  try {
    const res = await fetch(apiUrl("/health"), { method: "GET" });
    const text = await res.text();
    let data: {
      ok?: boolean;
      db?: boolean;
      message?: string;
      dbDebug?: MnsHealthDbDebug;
    } = {};
    try {
      data = JSON.parse(text) as typeof data;
    } catch {
      return { apiOk: false, db: false };
    }
    if (!res.ok) {
      return {
        apiOk: false,
        db: false,
        healthMessage: typeof data.message === "string" ? data.message : undefined,
      };
    }
    return {
      apiOk: true,
      db: data.db === true,
      healthMessage: typeof data.message === "string" ? data.message : undefined,
      dbDebug:
        typeof data.dbDebug === "object" && data.dbDebug !== null
          ? data.dbDebug
          : undefined,
    };
  } catch {
    return { apiOk: false, db: false };
  }
}

export async function mnsFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = apiUrl(path);
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const data = (await res.json().catch(() => ({}))) as T & {
    message?: string;
    ok?: boolean;
  };
  if (!res.ok) {
    throw new Error(
      typeof data.message === "string" ? data.message : res.statusText
    );
  }
  return data as T;
}

/** ทดสอบว่า API + ฐานข้อมูล (MySQL) พร้อมหรือไม่ */
export async function getMnsDbReady(): Promise<boolean> {
  const c = await getMnsConnection();
  return c.apiOk && c.db;
}
