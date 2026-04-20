import { PM_USERS_SEED } from "../data/pmUsersSeed";
import type { AuthSession, PmUser } from "../types/pmUser";

export type LoginFailure = { ok: false; message: string };
export type LoginSuccess = { ok: true; session: AuthSession };
export type LoginResult = LoginSuccess | LoginFailure;

function pmApiBase(): string | null {
  const raw = import.meta.env.VITE_PM_API_BASE_URL;
  if (typeof raw !== "string" || raw.trim() === "") {
    return null;
  }
  return raw.replace(/\/$/, "");
}

/**
 * รูปแบบ response ที่คาดจาก project manager (ปรับ path/ฟิลด์ได้ตาม API จริง)
 */
type PmLoginApiBody = {
  user?: Partial<PmUser> & { id?: string; username?: string };
  accessToken?: string;
  token?: string;
};

async function loginViaPmApi(
  username: string,
  password: string
): Promise<LoginResult | null> {
  const base = pmApiBase();
  if (!base) {
    return null;
  }

  const url = `${base}/auth/login`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { ok: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
      }
      return {
        ok: false,
        message: "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่ภายหลัง",
      };
    }

    const data = (await res.json()) as PmLoginApiBody;
    const u = data.user;
    if (!u?.id || !u?.username) {
      return {
        ok: false,
        message: "รูปแบบข้อมูลผู้ใช้จากเซิร์ฟเวอร์ไม่ถูกต้อง",
      };
    }

    const user: PmUser = {
      id: String(u.id),
      pmUserId: u.pmUserId != null ? String(u.pmUserId) : String(u.id),
      username: String(u.username),
      displayNameTh: String(u.displayNameTh ?? u.username),
      email: u.email ?? null,
      roleCode: u.roleCode ?? null,
      departmentCode: u.departmentCode ?? null,
    };

    const accessToken = data.accessToken ?? data.token;
    return {
      ok: true,
      session: { user, accessToken },
    };
  } catch {
    return {
      ok: false,
      message: "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบเครือข่ายหรือ URL ของระบบ PM",
    };
  }
}

type MnsLoginBody = {
  ok?: boolean;
  message?: string;
  user?: Partial<PmUser> & { id?: string; username?: string };
};

async function loginViaMnsApi(
  username: string,
  password: string
): Promise<LoginResult | null> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      if (res.status === 404) return null; // เซิร์ฟเวอร์เก่ายังไม่มี endpoint นี้
      const body = (await res.json().catch(() => ({}))) as MnsLoginBody;
      if (res.status === 401 || res.status === 403) {
        return { ok: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
      }
      return {
        ok: false,
        message: body.message ?? "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่ภายหลัง",
      };
    }
    const data = (await res.json()) as MnsLoginBody;
    const u = data.user;
    if (!u?.id || !u?.username) {
      return {
        ok: false,
        message: "รูปแบบข้อมูลผู้ใช้จากเซิร์ฟเวอร์ไม่ถูกต้อง",
      };
    }
    const user: PmUser = {
      id: String(u.id),
      pmUserId: u.pmUserId != null ? String(u.pmUserId) : String(u.id),
      username: String(u.username),
      displayNameTh: String(u.displayNameTh ?? u.username),
      email: u.email ?? null,
      roleCode: u.roleCode ?? null,
      departmentCode: u.departmentCode ?? null,
    };
    return {
      ok: true,
      session: { user, accessToken: undefined },
    };
  } catch {
    return null; // เครือข่ายล่ม: ปล่อย fallback ถัดไป
  }
}

function loginViaDevSeed(username: string, password: string): LoginResult {
  const u = username.trim().toLowerCase();
  const row = PM_USERS_SEED.find(
    (r) => r.username.toLowerCase() === u
  );
  if (!row || row.password !== password) {
    return { ok: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
  }
  return {
    ok: true,
    session: { user: row.user, accessToken: undefined },
  };
}

/**
 * เข้าสู่ระบบ: ถ้ามี `VITE_PM_API_BASE_URL` จะเรียก PM API ก่อน
 * ถ้าไม่ตั้งค่า หรือต้องการ dev แบบ offline ให้ใช้ seed ใน `pmUsersSeed`
 */
export async function loginWithPm(
  username: string,
  password: string
): Promise<LoginResult> {
  const apiResult = await loginViaPmApi(username, password);
  if (apiResult !== null) {
    return apiResult;
  }
  const mnsResult = await loginViaMnsApi(username, password);
  if (mnsResult !== null) {
    return mnsResult;
  }
  return loginViaDevSeed(username, password);
}
