/**
 * ตรวจว่าโปรเจกต์ตั้งใจใช้ MySQL เท่านั้น (ไม่มี dependency postgres / ไม่มีไฟล์ migration แบบ psql ที่ราก database/migrations)
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const serverPkg = JSON.parse(
  readFileSync(join(root, "server", "package.json"), "utf8"),
);
const deps = { ...serverPkg.dependencies, ...serverPkg.devDependencies };
const forbidden = ["pg", "postgres", "@neondatabase/serverless", "neon"];

let bad = false;
for (const name of forbidden) {
  if (deps[name]) {
    console.error(`ไม่ควรมี dependency "${name}" ใน server/package.json (ใช้ MySQL เท่านั้น)`);
    bad = true;
  }
}

const migRoot = join(root, "database", "migrations");
let entries;
try {
  entries = readdirSync(migRoot, { withFileTypes: true });
} catch {
  entries = [];
}
for (const e of entries) {
  if (e.isFile() && e.name.endsWith(".sql")) {
    console.error(
      `พบไฟล์ ${join("database/migrations", e.name)} — ใช้เฉพาะโฟลเดอร์ database/migrations/mysql/ สำหรับไฟล์ .sql`,
    );
    bad = true;
  }
}

if (bad) {
  process.exit(1);
}
console.log("verify-mysql-only: OK — ไม่มี dependency Postgres/Neon และไม่มี .sql ที่ราก database/migrations");
