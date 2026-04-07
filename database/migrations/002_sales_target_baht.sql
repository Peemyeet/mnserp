-- เป้าหมายยอดขายรายคน (บาท) — ใช้วัด KPI ฝ่ายขาย ร่วมกับ bill_quota
-- mysql -u root -p db_mns < database/migrations/002_sales_target_baht.sql

ALTER TABLE `user_data`
  ADD COLUMN `sales_target_baht` DECIMAL(15, 2) NOT NULL DEFAULT 0.00
  COMMENT 'เป้าหมายยอดขาย KPI ฝ่ายขาย (บาท)';
