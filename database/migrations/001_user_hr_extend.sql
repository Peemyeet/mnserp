-- PostgreSQL / Neon — คอลัมน์ HR สำหรับหน้า "ตั้งค่าผู้ใช้"
-- รัน: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/migrations/001_user_hr_extend.sql
-- เวอร์ชัน MySQL: database/migrations/mysql/001_user_hr_extend.sql

ALTER TABLE user_data ADD COLUMN IF NOT EXISTS nickname varchar(200) NOT NULL DEFAULT '';
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS employment_status varchar(100) NOT NULL DEFAULT 'บรรจุ';
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS company_display varchar(300) NOT NULL DEFAULT '';
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS sick_leave_days integer NOT NULL DEFAULT 0;
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS vacation_days integer NOT NULL DEFAULT 0;
