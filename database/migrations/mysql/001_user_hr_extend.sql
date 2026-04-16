-- MySQL เท่านั้น — ใช้กับ Docker MySQL / MariaDB + database/db_mns.sql
-- mysql -u root -p db_mns < database/migrations/mysql/001_user_hr_extend.sql
-- ถ้าคอลัมน์มีอยู่แล้ว MySQL จะ error — ให้ข้ามบรรทัดที่ซ้ำ

ALTER TABLE `user_data`
  ADD COLUMN `nickname` varchar(100) NOT NULL DEFAULT '' AFTER `lname`,
  ADD COLUMN `employment_status` varchar(50) NOT NULL DEFAULT 'บรรจุ' AFTER `nickname`,
  ADD COLUMN `company_display` varchar(200) NOT NULL DEFAULT '' AFTER `employment_status`,
  ADD COLUMN `sick_leave_days` int(11) NOT NULL DEFAULT 0 AFTER `company_display`,
  ADD COLUMN `vacation_days` int(11) NOT NULL DEFAULT 0 AFTER `sick_leave_days`;
