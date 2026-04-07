#!/usr/bin/env bash
# ตั้งค่าโปรเจกต์ ERP MNS บนเครื่อง — รันจากโฟลเดอร์โปรเจกต์: bash scripts/dev-setup.sh
#   bash scripts/dev-setup.sh           — ติดตั้ง npm ทั้ง root และ server, สร้าง server/.env ถ้ายังไม่มี
#   bash scripts/dev-setup.sh --docker — เหมือนบน + ตั้งรหัสผ่านให้ตรง Docker แล้ว docker compose up -d
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "== ERP MNS: dev setup (${ROOT}) =="

if [[ ! -f server/.env ]]; then
  echo "→ สร้าง server/.env จาก server/.env.example"
  cp server/.env.example server/.env
fi

USE_DOCKER=false
if [[ "${1:-}" == "--docker" ]]; then
  USE_DOCKER=true
fi

if [[ "$USE_DOCKER" == true ]]; then
  _pw_val=""
  if grep -qE '^MNS_DB_PASSWORD=' server/.env; then
    _pw_val=$(grep -E '^MNS_DB_PASSWORD=' server/.env | tail -1 | cut -d= -f2- | tr -d '\r' | xargs || true)
  fi
  if [[ -z "${_pw_val}" ]]; then
    echo "→ ตั้ง MNS_DB_PASSWORD=mns_dev_root ใน server/.env (ใช้กับ docker-compose)"
    if grep -qE '^MNS_DB_PASSWORD=' server/.env; then
      sed -i.bak 's/^MNS_DB_PASSWORD=.*/MNS_DB_PASSWORD=mns_dev_root/' server/.env && rm -f server/.env.bak
    else
      echo "MNS_DB_PASSWORD=mns_dev_root" >> server/.env
    fi
  fi
else
  echo "→ ถ้าใช้ MySQL เอง: แก้ MNS_DB_PASSWORD ใน server/.env ให้ตรง root แล้วรัน npm run db:setup"
fi

echo "→ npm install (โปรเจกต์หลัก)"
npm install

echo "→ npm install (server)"
npm install --prefix server

if [[ "$USE_DOCKER" == true ]]; then
  echo "→ docker compose up -d"
  docker compose up -d
  echo "→ รอ MySQL พร้อมรับการเชื่อมต่อ (สูงสุด ~60 วินาที)"
  for i in $(seq 1 30); do
    if docker compose exec -T mysql mysqladmin ping -h127.0.0.1 -uroot -pmns_dev_root --silent 2>/dev/null; then
      echo "→ MySQL พร้อมแล้ว"
      break
    fi
    sleep 2
    if [[ "$i" == 30 ]]; then
      echo "คำเตือน: ยัง ping MySQL ไม่ได้ — ลองรอแล้วรัน npm run dev:all อีกครั้ง"
    fi
  done
fi

echo ""
echo "เสร็จแล้ว — รันแอป:"
echo "  npm run dev:all"
echo ""
echo "ถ้าไม่ได้ใช้ Docker แต่ยังไม่มี schema: npm run db:setup"
