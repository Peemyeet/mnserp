#!/usr/bin/env bash
# แพ็กโฟลเดอร์สำหรับอัปโหลด Enhance / cPanel (โครง public_html/pm2026/ …)
# ไม่ใส่ .env / node_modules — บนโฮสต์รัน: cd server && npm install && npm run db:generate && npm start
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

npm run build

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="${ROOT}/erp-mns-deploy-${STAMP}.tar.gz"

tar -czf "$OUT" \
  --exclude='server/node_modules' \
  --exclude='server/.env' \
  --exclude='.env' \
  --exclude='.env.*' \
  dist \
  server

echo ""
echo "✓ สร้างแพ็กแล้ว: $OUT"
echo "  อัปโหลดแล้วแตกไฟล์ไปที่โฟลเดอร์โปรเจกต์ (เช่น public_html/pm2026/)"
echo "  ถ้ารัน Node รวมเว็บ+API: เปิดเบราว์เซอร์ที่ /pm2026/ (ราก / จะ redirect มาที่นี่)"
echo "  จากนั้น SSH หรือเทอร์มินัลโฮสต์:"
echo "    cd server && npm install && npm run db:generate && npm start"
echo "  ตั้ง server/.env บนโฮสต์แยก (อย่า commit) — ทดสอบ GET /api/health"
