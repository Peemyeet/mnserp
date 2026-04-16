#!/usr/bin/env bash
# ตั้งค่าโปรเจกต์ ERP MNS บนเครื่อง — รันจากโฟลเดอร์โปรเจกต์: bash scripts/dev-setup.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "== ERP MNS: dev setup (${ROOT}) =="

if [[ ! -f server/.env ]]; then
  echo "→ สร้าง server/.env จาก server/.env.example"
  cp server/.env.example server/.env
fi

echo "→ ใส่ DATABASE_URL (mysql://...) ใน server/.env — ดู database/CPANEL-MYSQL.txt"
echo "→ docker compose ในโปรเจกต์ยก MySQL สำหรับโหลด database/mns_pm_2021.sql (ทางเลือก)"

echo "→ npm install (โปรเจกต์หลัก)"
npm install

echo "→ npm install (server)"
npm install --prefix server

echo ""
echo "เสร็จแล้ว — รันแอป:"
echo "  npm run dev:all"
echo ""
echo "ถ้ายังไม่มีฐาน: import database/mns_pm_2021.sql (หรือ db_mns.sql) แล้วรัน npm run db:setup"
