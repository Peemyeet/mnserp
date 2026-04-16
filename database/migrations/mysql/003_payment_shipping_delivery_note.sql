-- MySQL เท่านั้น — โครงเดียวกับ PostgreSQL ใน database/migrations/003_payment_shipping_delivery_note.sql
-- mysql -u root -p db_mns < database/migrations/mysql/003_payment_shipping_delivery_note.sql

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `mns_payment_ship_confirm` (
  `psc_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `profile_id` int(11) NOT NULL DEFAULT 1 COMMENT 'บริษัท/โปรไฟล์ (เช่น bill_order.profile_id)',
  `job_id` int(11) NOT NULL DEFAULT 0 COMMENT 'อ้างอิง job_data.job_id ถ้ามี',
  `bo_no` varchar(200) NOT NULL DEFAULT '' COMMENT 'เลขที่ใบสั่งซื้อ/อ้างอิง bill_order.bo_no',
  `rfq_no` varchar(50) NOT NULL DEFAULT '',
  `payment_confirmed` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = ยืนยันการชำระเงินแล้ว',
  `transfer_ref` varchar(200) NOT NULL DEFAULT '' COMMENT 'เลขที่อ้างอิงการโอน / ใบทำธุรกรรม',
  `shipped` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 = ส่งของแล้ว',
  `tracking_no` varchar(120) NOT NULL DEFAULT '' COMMENT 'เลขพัสดุ / ขนส่ง',
  `remark` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` int(11) NOT NULL DEFAULT 0 COMMENT 'user_data.user_id',
  PRIMARY KEY (`psc_id`),
  KEY `idx_psc_job` (`job_id`),
  KEY `idx_psc_bo` (`bo_no`(64)),
  KEY `idx_psc_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='บันทึกชำระเงินและจัดส่ง (หลังบันทึกสามารถสร้างใบส่งของ)';

CREATE TABLE IF NOT EXISTS `mns_delivery_note` (
  `dn_id` int(11) NOT NULL AUTO_INCREMENT,
  `profile_id` int(11) NOT NULL DEFAULT 1,
  `job_id` int(11) NOT NULL DEFAULT 0,
  `psc_id` bigint(20) unsigned DEFAULT NULL COMMENT 'อ้างอิง mns_payment_ship_confirm.psc_id',
  `dn_no` varchar(40) NOT NULL COMMENT 'เลขที่ใบส่งของ (unique)',
  `dn_date` date NOT NULL,
  `bo_no` varchar(200) NOT NULL DEFAULT '',
  `cus_id` int(11) NOT NULL DEFAULT 0 COMMENT 'customer.cus_id ถ้ามี',
  `ship_to_name` varchar(300) NOT NULL DEFAULT '',
  `ship_to_address` text NOT NULL,
  `tracking_no` varchar(120) NOT NULL DEFAULT '' COMMENT 'สำเนาจากขั้นส่งของ',
  `status` tinyint(4) NOT NULL DEFAULT 0 COMMENT '0=draft 1=confirmed 2=cancelled',
  `modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`dn_id`),
  UNIQUE KEY `uk_dn_no` (`dn_no`),
  KEY `idx_dn_job` (`job_id`),
  KEY `idx_dn_psc` (`psc_id`),
  KEY `idx_dn_date` (`dn_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='ใบส่งของ (สร้างหลังยืนยันส่งพัสดุ)';

CREATE TABLE IF NOT EXISTS `mns_delivery_note_line` (
  `dnl_id` int(11) NOT NULL AUTO_INCREMENT,
  `dn_id` int(11) NOT NULL,
  `line_no` int(11) NOT NULL DEFAULT 1,
  `part_id` int(11) NOT NULL DEFAULT 0 COMMENT 'sparepart.part_id ถ้าอ้างอะไหล่',
  `description` varchar(500) NOT NULL DEFAULT '',
  `qty` decimal(15,3) NOT NULL DEFAULT 0.000,
  `unit` varchar(30) NOT NULL DEFAULT '',
  `unit_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `line_total` decimal(15,2) NOT NULL DEFAULT 0.00,
  `remark` varchar(500) NOT NULL DEFAULT '',
  PRIMARY KEY (`dnl_id`),
  KEY `idx_dnl_dn` (`dn_id`),
  KEY `idx_dnl_part` (`part_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='รายการในใบส่งของ';
