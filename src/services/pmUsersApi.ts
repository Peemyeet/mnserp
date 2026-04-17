/**
 * PM2021 PHP API — user_data
 * บน cPanel: ไฟล์อยู่ใต้ public_html/api-new/ (เช่น read.php ไม่ใช่ user/read.php)
 */

/** path บนโดเมน PM2021 */
export const PM_USERS_READ_PATH = "/api-new/read.php";
export const PM_USERS_CREATE_PATH = "/api-new/create.php";

export type PmUserRow = {
  user_id: number;
  fname: string;
  lname: string;
  email: string;
  username: string;
};

export type PmUsersReadResponse = {
  ok: true;
  users: PmUserRow[];
};

export type PmUserCreateBody = {
  fname: string;
  lname: string;
  email: string;
  username: string;
  password: string;
};

export type PmUserCreateResponse =
  | { ok: true; user_id: number }
  | { ok: false; message: string };

/** ไม่มี trailing slash — ค่าเริ่มต้นโดเมน PM2021 (override ด้วย VITE_PM2021_API_BASE) */
export function getPm2021ApiBase(): string {
  const raw = import.meta.env.VITE_PM2021_API_BASE as string | undefined;
  const s = raw?.trim();
  if (s) return s.replace(/\/+$/, "");
  return "https://www.pm2021.mns.co.th";
}

function normalizeUserRow(row: unknown): PmUserRow | null {
  if (!row || typeof row !== "object") return null;
  const r = row as Record<string, unknown>;
  return {
    user_id: Number(r.user_id) || 0,
    fname: String(r.fname ?? ""),
    lname: String(r.lname ?? ""),
    email: String(r.email ?? ""),
    username: String(r.username ?? ""),
  };
}

/** รองรับทั้ง { ok, users } และ array ตรงๆ (ตามที่ fetch ทดสอบฝั่งเซิร์ฟเวอร์ส่งกลับ) */
function parseUsersPayload(data: unknown): PmUserRow[] {
  if (Array.isArray(data)) {
    return data.map(normalizeUserRow).filter((x): x is PmUserRow => x != null);
  }
  if (data && typeof data === "object") {
    const users = (data as { users?: unknown }).users;
    if (Array.isArray(users)) {
      return users.map(normalizeUserRow).filter((x): x is PmUserRow => x != null);
    }
  }
  return [];
}

export async function fetchPmUsers(baseUrl = getPm2021ApiBase()): Promise<PmUserRow[]> {
  const url = `${baseUrl.replace(/\/+$/, "")}${PM_USERS_READ_PATH}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    const hint =
      text.includes("signin") || text.includes("administrator")
        ? " (เซิร์ฟเวอร์ส่งหน้า login/HTML แทน JSON — ต้องเปิด read.php แบบไม่บังคับ session หรือเรียกจากโดเมนที่ยกเว้น)"
        : "";
    throw new Error(`read.php: ไม่ใช่ JSON${hint}`);
  }
  if (!res.ok) {
    throw new Error(`read.php failed: HTTP ${res.status}`);
  }
  const rows = parseUsersPayload(data);
  const wrappedOk = data && typeof data === "object" && (data as { ok?: unknown }).ok;
  if (wrappedOk === false) {
    throw new Error(`read.php failed: ok=false`);
  }
  return rows;
}

export async function createPmUser(
  body: PmUserCreateBody,
  baseUrl = getPm2021ApiBase()
): Promise<PmUserCreateResponse> {
  const url = `${baseUrl.replace(/\/+$/, "")}${PM_USERS_CREATE_PATH}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return { ok: false, message: `Invalid JSON (HTTP ${res.status})` };
  }
  if (!data || typeof data !== "object") {
    return { ok: false, message: "Invalid response" };
  }
  return data as PmUserCreateResponse;
}
