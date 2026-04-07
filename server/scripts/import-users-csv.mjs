/**
 * นำเข้าข้อมูลจาก CSV (รูปแบบหน้าตั้งค่าผู้ใช้) ไปอัปเดต user_data
 *
 *   node scripts/import-users-csv.mjs [path/to/file.csv] [--dry-run]
 *
 * จับคู่แถว: เบอร์โทร (ตัวเลขเท่ากัน) หรือ ชื่อ+นามสกุล ตรงกับ fname/lname ใน DB
 * ต้องมีคอลัมน์จาก migration 001 (nickname, employment_status, ...)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env"), override: true });

function parseCsv(content) {
  const lines = content.split(/\r?\n/).filter((l) => l.length > 0);
  const rows = [];
  for (const line of lines) {
    const cells = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQ = !inQ;
        continue;
      }
      if (!inQ && c === ",") {
        cells.push(cur);
        cur = "";
        continue;
      }
      cur += c;
    }
    cells.push(cur);
    rows.push(cells.map((s) => s.trim()));
  }
  return rows;
}

function normSpace(s) {
  return String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTitles(s) {
  let t = normSpace(s);
  t = t.replace(
    /^(นาย|นาง|นางสาว|น\.ส\.|น\.ส|ด\.ช\.|ด\.ญ\.|Mr\.|Mrs\.|Miss|Ms\.)\s*/gi,
    ""
  );
  t = t.replace(/^(นาย|นาง|นางสาว)\s+/u, "").trim();
  return normSpace(t);
}

function splitFullName(full) {
  const s = stripTitles(full);
  const parts = s.split(" ").filter(Boolean);
  if (parts.length === 0) return { fname: "", lname: "" };
  if (parts.length === 1) return { fname: parts[0], lname: "" };
  const lname = parts[parts.length - 1];
  const fname = parts.slice(0, -1).join(" ");
  return { fname, lname };
}

function normPhone(p) {
  return String(p ?? "").replace(/\D/g, "");
}

function loginStatusFromStatus(th) {
  const s = String(th ?? "").trim();
  if (s === "บรรจุ" || s === "ประจำ") return 1;
  return 0;
}

async function loadColumns(conn) {
  const [rows] = await conn.query(
    `SELECT COLUMN_NAME AS n FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_data'`
  );
  return new Set((rows ?? []).map((r) => r.n));
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--dry-run");
  const dryRun = process.argv.includes("--dry-run");
  const csvPath = path.resolve(
    args[0] ??
      path.join(__dirname, "..", "..", "database", "imports", "mns-users-group2.csv")
  );

  if (!fs.existsSync(csvPath)) {
    console.error("ไม่พบไฟล์:", csvPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(csvPath, "utf8");
  /** @type {string[][]} */
  const table = parseCsv(raw);
  if (table.length < 2) {
    console.error("CSV ว่าง");
    process.exit(1);
  }

  const header = table[0].join(",");
  if (!header.includes("ชื่อ-นามสกุล") || !header.includes("ชื่อเล่น")) {
    console.error("รูปแบบ CSV ไม่ตรง (ต้องมีคอลัมน์ ชื่อ-นามสกุล, ชื่อเล่น)");
    process.exit(1);
  }

  const dataRows = table.slice(1);

  const host = process.env.MNS_DB_HOST ?? "127.0.0.1";
  const port = Number(process.env.MNS_DB_PORT) || 3306;
  const user = process.env.MNS_DB_USER ?? "root";
  const password = process.env.MNS_DB_PASSWORD ?? "";
  const db = (process.env.MNS_DB_NAME ?? "db_mns").replace(/[^a-zA-Z0-9_]/g, "") || "db_mns";

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database: db,
  });

  const col = await loadColumns(conn);
  const has = (c) => col.has(c);

  const [dbUsers] = await conn.query(
    `SELECT user_id, fname, lname, phonenumber FROM user_data WHERE public = 1`
  );

  /** @type {Map<string, object[]>} */
  const byPhone = new Map();
  for (const u of dbUsers) {
    const key = normPhone(u.phonenumber);
    if (!key || key.length < 9) continue;
    if (!byPhone.has(key)) byPhone.set(key, []);
    byPhone.get(key).push(u);
  }

  function findUser(csvRow) {
    const fullName = csvRow[1] ?? "";
    const phone = normPhone(csvRow[3] ?? "");
    const { fname: cf, lname: cl } = splitFullName(fullName);
    const nf = normSpace(cf);
    const nl = normSpace(cl);

    const nameMatches = dbUsers.filter(
      (u) => normSpace(u.fname) === nf && normSpace(u.lname) === nl
    );
    if (nameMatches.length === 1) return nameMatches[0];
    if (nameMatches.length > 1) {
      if (phone.length >= 9) {
        const withPhone = nameMatches.filter(
          (u) => normPhone(u.phonenumber) === phone
        );
        if (withPhone.length === 1) return withPhone[0];
      }
      return null;
    }

    if (phone.length >= 9) {
      const list = byPhone.get(phone) ?? [];
      if (list.length === 1) return list[0];
      if (list.length > 1) {
        const exact = list.find(
          (u) => normSpace(u.fname) === nf && normSpace(u.lname) === nl
        );
        return exact ?? null;
      }
    }

    return null;
  }

  let updated = 0;
  let skipped = 0;
  const unmatched = [];
  /** @type {Set<number>} */
  const seenUserIds = new Set();
  const duplicateUpdates = [];

  for (const row of dataRows) {
    if (row.length < 8) continue;
    const u = findUser(row);
    if (!u) {
      unmatched.push(row[1] ?? "?");
      skipped++;
      continue;
    }

    if (seenUserIds.has(u.user_id)) {
      duplicateUpdates.push({ user_id: u.user_id, name: row[1] ?? "?" });
    }
    seenUserIds.add(u.user_id);

    const nickname = normSpace(row[2] ?? "");
    const phoneRaw = normSpace(row[3] ?? "");
    const employment = normSpace(row[4] ?? "ทดลองงาน");
    let company = normSpace(row[5] ?? "");
    if (company === "ยังไม่ได้ระบุ") company = "";
    const sick = Math.max(0, parseInt(row[6], 10) || 0);
    const vac = Math.max(0, parseInt(row[7], 10) || 0);
    const ls = loginStatusFromStatus(employment);

    const sets = [];
    const vals = [];

    if (has("nickname")) {
      sets.push("nickname = ?");
      vals.push(nickname);
    }
    if (has("employment_status")) {
      sets.push("employment_status = ?");
      vals.push(employment || "ทดลองงาน");
    }
    if (has("company_display")) {
      sets.push("company_display = ?");
      vals.push(company);
    }
    if (has("sick_leave_days")) {
      sets.push("sick_leave_days = ?");
      vals.push(sick);
    }
    if (has("vacation_days")) {
      sets.push("vacation_days = ?");
      vals.push(vac);
    }
    sets.push("loginstatus = ?");
    vals.push(ls);

    if (phoneRaw && normPhone(phoneRaw).length >= 9) {
      sets.push("phonenumber = ?");
      vals.push(phoneRaw.replace(/\s/g, ""));
    }

    sets.push("lastupdate = NOW()");
    vals.push(u.user_id);

    const sql = `UPDATE user_data SET ${sets.join(", ")} WHERE user_id = ? AND public = 1`;

    if (dryRun) {
      console.log("[dry-run] user_id", u.user_id, row[1], "->", sql.slice(0, 120) + "...");
    } else {
      await conn.query(sql, vals);
    }
    updated++;
  }

  await conn.end();

  console.log(
    dryRun ? "[dry-run] " : "",
    `อัปเดตได้ ${updated} แถว, ข้าม/ไม่จับคู่ ${skipped} แถว`
  );
  if (duplicateUpdates.length) {
    console.warn(
      "คำเตือน: มีหลายแถวใน CSV ชี้ไป user_id เดียวกัน (แถวหลังจะทับค่าแถวก่อน):",
      duplicateUpdates.length
    );
    duplicateUpdates.slice(0, 15).forEach((d) =>
      console.warn(" - user_id", d.user_id, d.name)
    );
  }
  if (unmatched.length && unmatched.length <= 30) {
    console.log("ไม่พบคู่ในฐานข้อมูล (ตัวอย่าง):");
    unmatched.slice(0, 20).forEach((n) => console.log(" -", n));
  } else if (unmatched.length > 30) {
    console.log("ไม่พบคู่จำนวน", unmatched.length, "แถว (ตัวอย่างชื่อแรก):");
    unmatched.slice(0, 15).forEach((n) => console.log(" -", n));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
