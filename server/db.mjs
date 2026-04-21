import fs from "node:fs";
import mysql from "mysql2/promise";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// ไม่ override ค่าที่ตั้งใน process.env แล้ว (เช่น prisma-with-db-env ใส่ mysql จำลองก่อน import)
config({ path: path.join(__dirname, ".env"), override: false });

/** @type {import("mysql2/promise").Pool | undefined} */
let pool;

/**
 * ประกอบ mysql:// จาก (ลำดับรองรับแบบแยกส่วน):
 *   • Railway MySQL: MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE, MYSQLPORT
 *   • cPanel / ทั่วไป: DB_HOST, DB_DATABASE, DB_USERNAME|DB_USER, DB_PASSWORD, DB_PORT
 * DATABASE_URL ใช้ได้เฉพาะที่ขึ้นต้นด้วย mysql:// — ค่าอื่นจะถูกข้าม (ใช้ MYSQL* / DB_* แทน)
 */
function resolveMysqlDatabaseUrl() {
  const enc = encodeURIComponent;

  const fromRailway = (() => {
    const host = process.env.MYSQLHOST?.trim();
    const database = process.env.MYSQLDATABASE?.trim();
    const user = process.env.MYSQLUSER;
    const password = process.env.MYSQLPASSWORD ?? "";
    const port = process.env.MYSQLPORT?.trim() || "3306";
    if (host && database && user !== undefined && user !== null) {
      return `mysql://${enc(String(user))}:${enc(String(password))}@${host}:${port}/${enc(database)}`;
    }
    return null;
  })();

  const host = process.env.DB_HOST?.trim();
  const database =
    process.env.DB_DATABASE?.trim() || process.env.DB_NAME?.trim();
  const user = process.env.DB_USERNAME ?? process.env.DB_USER;
  const password = process.env.DB_PASSWORD ?? "";
  const port = process.env.DB_PORT?.trim() || "3306";
  const fromDbParts =
    host && database && user !== undefined && user !== null
      ? `mysql://${enc(String(user))}:${enc(String(password))}@${host}:${port}/${enc(database)}`
      : null;

  /** Railway มาก่อน DB_* ถ้ามีทั้งคู่ (บน Railway มักมีแค่ MYSQL*) */
  const fromDiscrete = fromRailway ?? fromDbParts;

  /**
   * ให้ค่าจาก MYSQL* / DB_* มาก่อน DATABASE_URL เสมอ
   * เพื่อกันกรณีโฮสต์ inject DATABASE_URL (เช่น root@...) แล้วทับค่าที่ตั้งใน server/.env
   */
  if (fromRailway) {
    return { urlStr: fromRailway, source: "MYSQL_*" };
  }
  if (fromDbParts) {
    return { urlStr: fromDbParts, source: "DB_*" };
  }

  const direct = process.env.DATABASE_URL?.trim();
  if (direct) {
    const lower = direct.toLowerCase();
    if (lower.startsWith("mysql:")) {
      return { urlStr: direct, source: "DATABASE_URL" };
    }
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[db] DATABASE_URL ไม่ใช่ mysql:// — ข้ามค่านี้ ใช้ MYSQL* / DB_* หรือแก้เป็น mysql:// เท่านั้น",
      );
    }
  }
  return { urlStr: null, source: null };
}

export function buildMysqlDatabaseUrl() {
  return resolveMysqlDatabaseUrl().urlStr;
}

/** อ่าน DATABASE_URL=mysql:// จากไฟล์ server/.env โดยตรง (ไม่ผ่าน process.env) — ใช้เปรียบเทียบกับค่าที่โหลดจริง */
function readMysqlDatabaseUrlFromServerEnvFile() {
  const fp = path.join(__dirname, ".env");
  if (!fs.existsSync(fp)) return null;
  try {
    const text = fs.readFileSync(fp, "utf8");
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      if (key !== "DATABASE_URL") continue;
      let val = line.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      val = val.trim();
      if (!val.toLowerCase().startsWith("mysql:")) continue;
      return val;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * สรุปการตั้งค่า MySQL ที่แอปใช้จริง (ไม่มีรหัสผ่าน) + คำใบ้เมื่อไฟล์ server/.env ไม่ตรงกับ process.env
 * dotenv โหลดด้วย override:false — ถ้า Platform ตั้ง DATABASE_URL ไว้แล้ว ค่าในไฟล์จะไม่ทับ
 */
export function getMysqlConnectionDebugSummary() {
  const { urlStr, source } = resolveMysqlDatabaseUrl();
  /** @type {Record<string, unknown>} */
  const out = {
    mysqlResolvedFrom: source,
  };
  if (urlStr) {
    try {
      const u = new URL(urlStr);
      out.mysqlUser = decodeURIComponent(u.username);
      out.mysqlHost = u.hostname;
      out.mysqlPort = Number(u.port) || 3306;
      out.mysqlDatabase = u.pathname.replace(/^\//, "").split("?")[0] || null;
    } catch {
      out.mysqlUrlParseError = true;
    }
  } else {
    out.mysqlConfigured = false;
  }

  const fileUrl = readMysqlDatabaseUrlFromServerEnvFile();
  if (fileUrl) {
    try {
      const fu = new URL(fileUrl);
      out.envFileMysqlUser = decodeURIComponent(fu.username);
      out.envFileMysqlHost = fu.hostname;
    } catch {
      /* ignore */
    }
  }

  if (
    typeof out.mysqlUser === "string" &&
    typeof out.envFileMysqlUser === "string" &&
    out.envFileMysqlUser !== out.mysqlUser
  ) {
    out.hint =
      `แอปกำลังใช้ MySQL user "${out.mysqlUser}" (จาก ${out.mysqlResolvedFrom ?? "?"}) แต่ไฟล์ server/.env ระบุ user "${out.envFileMysqlUser}" — โฮสต์ (Enhance/Railway ฯลฯ) ตั้งตัวแปรแวดล้อมไว้แล้ว dotenv จะไม่ทับค่าที่มีอยู่แล้ว ให้ลบ DATABASE_URL / MYSQLUSER ในแผงโฮสต์ หรือแก้ให้ตรงกับ server/.env แล้วรีสตาร์ท Node`;
  }

  return out;
}

function createPool() {
  const urlStr = resolveMysqlDatabaseUrl().urlStr;
  if (!urlStr) {
    const raw = process.env.DATABASE_URL?.trim() ?? "";
    const nonMysqlUrl = raw !== "" && !raw.toLowerCase().startsWith("mysql:");
    throw new Error(
      nonMysqlUrl
        ? "ใช้ MySQL เท่านั้น — ลบหรือแก้ DATABASE_URL ให้เป็น mysql:// หรือใช้ MYSQLHOST, MYSQLDATABASE, MYSQLUSER, MYSQLPASSWORD (Railway — ดู server/.env.example)"
        : "ยังไม่ได้ตั้ง MySQL — ใส่ DATABASE_URL=mysql://... หรือ MYSQLHOST+MYSQLDATABASE+MYSQLUSER+MYSQLPASSWORD (+MYSQLPORT) หรือ DB_* (ดู server/.env.example)",
    );
  }
  const u = new URL(urlStr);
  const database = u.pathname.replace(/^\//, "").split("?")[0];
  if (!database) {
    throw new Error("connection ต้องมีชื่อฐานข้อมูลหลัง /");
  }
  return mysql.createPool({
    host: u.hostname,
    port: Number(u.port) || 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database,
    waitForConnections: true,
    connectionLimit: 10,
    enableKeepAlive: true,
  });
}

/**
 * คืนค่าแบบเดียวกับ mysql2 pool.query: [rows, fields]
 */
export function getPool() {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

/** MySQL: ER_BAD_FIELD_ERROR เมื่อไม่มีคอลัมน์ */
export function isMissingColumnError(err) {
  const c = err?.code;
  return c === "ER_BAD_FIELD_ERROR" || c === "42703";
}

/** MySQL: ER_NO_SUCH_TABLE เมื่ออ้างอิงตารางที่ยังไม่ถูกสร้าง */
export function isMissingTableError(err) {
  return err?.code === "ER_NO_SUCH_TABLE";
}
