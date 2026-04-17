-- PM API: รองรับ password_hash() (bcrypt ~60 ตัวอักษร) — รันกับ mns_pm_2021 ครั้งเดียว
-- mysql -u ... -p mns_pm_2021 < database/migrations/mysql/004_pm_api_user_data_password.sql
--
-- ฐานข้อมูลเดิมมักใช้ varchar(30) สำหรับรหัสแบบสั้น — ถ้าคอลัมน์กว้างพอแล้วให้ข้ามหรือแก้ให้เหมาะกับสภาพจริง

ALTER TABLE `user_data`
  MODIFY COLUMN `password` varchar(255) NOT NULL DEFAULT '';
