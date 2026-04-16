#!/usr/bin/env bash
# ตั้งค่าโลคอลครบชุด: Docker MySQL + import mns_pm_2021 + migration เสริม + ทดสอบ API
# รันจากรากโปรเจกต์: bash scripts/full-local-setup.sh

set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "== ERP MNS — full local setup =="

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ ไม่พบคำสั่ง docker — ติดตั้ง Docker Desktop แล้วลองใหม่"
  exit 1
fi

if [[ ! -f database/mns_pm_2021.sql ]]; then
  echo "❌ ไม่พบ database/mns_pm_2021.sql"
  exit 1
fi

if [[ ! -f server/.env ]]; then
  echo "→ สร้าง server/.env จากตัวอย่าง"
  cp server/.env.example server/.env
fi

# ให้ตรงกับ docker-compose.yml
grep -q '^DATABASE_URL=' server/.env || echo 'DATABASE_URL=mysql://root:mns_dev_root@127.0.0.1:3306/mns_pm_2021' >> server/.env
if ! grep -q '^DATABASE_URL=mysql://' server/.env; then
  echo "❌ server/.env ต้องมี DATABASE_URL=mysql://..."
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "VITE_API_PROXY_TARGET=http://127.0.0.1:8787" > .env
fi

echo "→ docker compose up -d (ครั้งแรกอาจใช้เวลาโหลด dump หลายนาที)"
docker compose up -d

echo "→ รอ MySQL พร้อมรับ connection..."
for i in $(seq 1 120); do
  if docker compose exec -T mysql mysqladmin ping -h localhost -uroot -pmns_dev_root --silent 2>/dev/null; then
    echo "   MySQL ping OK"
    break
  fi
  if [[ "$i" -eq 120 ]]; then
    echo "❌ รอ MySQL นานเกินไป — ดู log: docker compose logs mysql"
    exit 1
  fi
  sleep 2
done

# รอให้ initdb โหลด dump เสร็จ (ถ้าเป็นครั้งแรก volume ว่าง)
echo "→ รอให้ฐาน mns_pm_2021 มีตาราง (สูงสุด ~15 นาทีถ้า dump ใหญ่)..."
for i in $(seq 1 180); do
  n=$(docker compose exec -T mysql mysql -uroot -pmns_dev_root -N -e \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='mns_pm_2021';" 2>/dev/null || echo 0)
  if [[ "${n:-0}" -gt 50 ]]; then
    echo "   พบตารางในฐาน mns_pm_2021 แล้ว (~$n ตารางใน information_schema)"
    break
  fi
  if [[ "$i" -eq 180 ]]; then
    echo "⚠️  ยังไม่เห็นตารางเพียงพอ — ลองดู docker compose logs mysql หรือรอแล้วรันสคริปต์นี้อีกครั้ง"
  fi
  sleep 5
done

echo "→ migration เสริม (ข้าม error ถ้ารันซ้ำ)"
set +e
docker compose exec -T mysql mysql -uroot -pmns_dev_root mns_pm_2021 < database/migrations/mysql/001_user_hr_extend.sql
docker compose exec -T mysql mysql -uroot -pmns_dev_root mns_pm_2021 < database/migrations/mysql/002_sales_target_baht.sql
docker compose exec -T mysql mysql -uroot -pmns_dev_root mns_pm_2021 < database/migrations/mysql/003_payment_shipping_delivery_note.sql
set -e

echo "→ npm install"
npm install
npm install --prefix server

echo "→ prisma generate"
npm run db:generate

echo "→ ทดสอบ API"
npm run api:health

echo ""
echo "✅ เสร็จแล้ว — รันแอป: npm run dev:all"
