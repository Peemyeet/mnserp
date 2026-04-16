-- MySQL เท่านั้น
-- mysql -u root -p db_mns < database/migrations/mysql/002_sales_target_baht.sql

ALTER TABLE `user_data`
  ADD COLUMN `sales_target_baht` DECIMAL(15, 2) NOT NULL DEFAULT 0.00
  COMMENT 'เป้าหมายยอดขาย KPI ฝ่ายขาย (บาท)';
