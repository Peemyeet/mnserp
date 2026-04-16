-- PostgreSQL / Neon — เป้าหมายยอดขาย (บาท) สำหรับ KPI ฝ่ายขาย
-- รัน: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/migrations/002_sales_target_baht.sql
-- เวอร์ชัน MySQL: database/migrations/mysql/002_sales_target_baht.sql

ALTER TABLE user_data ADD COLUMN IF NOT EXISTS sales_target_baht double precision NOT NULL DEFAULT 0;

COMMENT ON COLUMN user_data.sales_target_baht IS 'เป้าหมายยอดขาย KPI ฝ่ายขาย (บาท)';
