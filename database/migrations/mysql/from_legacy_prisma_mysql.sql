-- =============================================================================
-- MySQL / MariaDB — ตารางเสริม (เทียบโครงใน server/prisma/schema.prisma)
--
-- การแปลงหลักที่ใช้ในไฟล์นี้: SERIAL/BIGSERIAL → AUTO_INCREMENT, BOOLEAN → TINYINT(1),
--   DOUBLE PRECISION → DOUBLE, TIMESTAMP(3) → DATETIME(3), ฯลฯ
--
-- คำเตือน:
--   • ถ้า import database/db_mns.sql แล้ว — อย่ารัน SECTION B (ตาราง customer, job_data, … ซ้ำ)
--   • ใช้ SECTION B เมื่อฐาน MySQL ว่างหรือมาจาก migration ชุดเดิมเท่านั้น
--   • SECTION A = ตาราง mns_* เทียบเท่า database/migrations/mysql/003_*.sql + FK
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- SECTION A: mns_payment_ship_confirm, mns_delivery_note, mns_delivery_note_line
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `mns_payment_ship_confirm` (
  `psc_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `profile_id` int(11) NOT NULL DEFAULT 1,
  `job_id` int(11) NOT NULL DEFAULT 0,
  `bo_no` varchar(200) NOT NULL DEFAULT '',
  `rfq_no` varchar(50) NOT NULL DEFAULT '',
  `payment_confirmed` tinyint(1) NOT NULL DEFAULT 0,
  `transfer_ref` varchar(200) NOT NULL DEFAULT '',
  `shipped` tinyint(1) NOT NULL DEFAULT 0,
  `tracking_no` varchar(120) NOT NULL DEFAULT '',
  `remark` text NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `modified` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `user_id` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`psc_id`),
  KEY `idx_psc_job` (`job_id`),
  KEY `idx_psc_bo` (`bo_no`(64)),
  KEY `idx_psc_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `mns_delivery_note` (
  `dn_id` int(11) NOT NULL AUTO_INCREMENT,
  `profile_id` int(11) NOT NULL DEFAULT 1,
  `job_id` int(11) NOT NULL DEFAULT 0,
  `psc_id` bigint(20) unsigned DEFAULT NULL,
  `dn_no` varchar(40) NOT NULL,
  `dn_date` date NOT NULL,
  `bo_no` varchar(200) NOT NULL DEFAULT '',
  `cus_id` int(11) NOT NULL DEFAULT 0,
  `ship_to_name` varchar(300) NOT NULL DEFAULT '',
  `ship_to_address` text NOT NULL,
  `tracking_no` varchar(120) NOT NULL DEFAULT '',
  `status` smallint NOT NULL DEFAULT 0,
  `modified` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `user_id` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`dn_id`),
  UNIQUE KEY `mns_delivery_note_dn_no_key` (`dn_no`),
  KEY `idx_dn_job` (`job_id`),
  KEY `idx_dn_psc` (`psc_id`),
  KEY `idx_dn_date` (`dn_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `mns_delivery_note_line` (
  `dnl_id` int(11) NOT NULL AUTO_INCREMENT,
  `dn_id` int(11) NOT NULL,
  `line_no` int(11) NOT NULL DEFAULT 1,
  `part_id` int(11) NOT NULL DEFAULT 0,
  `description` varchar(500) NOT NULL DEFAULT '',
  `qty` decimal(15,3) NOT NULL DEFAULT 0.000,
  `unit` varchar(30) NOT NULL DEFAULT '',
  `unit_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `line_total` decimal(15,2) NOT NULL DEFAULT 0.00,
  `remark` varchar(500) NOT NULL DEFAULT '',
  PRIMARY KEY (`dnl_id`),
  KEY `idx_dnl_dn` (`dn_id`),
  KEY `idx_dnl_part` (`part_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `mns_delivery_note`
  ADD CONSTRAINT `mns_delivery_note_psc_id_fkey`
    FOREIGN KEY (`psc_id`) REFERENCES `mns_payment_ship_confirm` (`psc_id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `mns_delivery_note_line`
  ADD CONSTRAINT `mns_delivery_note_line_dn_id_fkey`
    FOREIGN KEY (`dn_id`) REFERENCES `mns_delivery_note` (`dn_id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ถ้า constraint มีอยู่แล้ว (รันซ้ำ) ให้ ALTER TABLE … DROP FOREIGN KEY `ชื่อ` ก่อน ADD

-- -----------------------------------------------------------------------------
-- SECTION B: โครง ERP + seed (จาก erp_legacy_core) — อย่ารันถ้ามี db_mns.sql แล้ว
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `customer` (
  `cus_id` int(11) NOT NULL AUTO_INCREMENT,
  `cus_code` varchar(11) NOT NULL,
  `cus_name` varchar(300) NOT NULL,
  `cus_address` text NOT NULL DEFAULT '',
  `cus_umpher` varchar(200) NOT NULL DEFAULT '',
  `cus_province` int(11) NOT NULL DEFAULT 0,
  `cus_zipcode` varchar(7) NOT NULL DEFAULT '',
  `cus_tel` varchar(20) NOT NULL DEFAULT '',
  `cus_fax` varchar(20) NOT NULL DEFAULT '',
  `cus_tax` varchar(20) NOT NULL DEFAULT '',
  `cus_contact` varchar(300) NOT NULL DEFAULT '',
  `contact_tel` varchar(20) NOT NULL DEFAULT '',
  `contact_email` varchar(300) NOT NULL DEFAULT '',
  `cus_info` text NOT NULL DEFAULT '',
  `public` int(11) NOT NULL DEFAULT 1,
  `modified` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `user_id` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`cus_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `workstatus` (
  `ws_id` int(11) NOT NULL,
  `ws_name` varchar(200) NOT NULL,
  `info` text NOT NULL DEFAULT '',
  `list` smallint NOT NULL DEFAULT 0,
  `public` int(11) NOT NULL DEFAULT 1,
  `modified` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `user_id` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ws_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `workgroup` (
  `wg_id` int(11) NOT NULL,
  `wg_name` varchar(200) NOT NULL,
  `info` text NOT NULL DEFAULT '',
  `list` smallint NOT NULL DEFAULT 0,
  `public` int(11) NOT NULL DEFAULT 1,
  `modified` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `user_id` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`wg_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_group` (
  `group_id` int(11) NOT NULL,
  `group_tid` int(11) NOT NULL DEFAULT 0,
  `group_name` varchar(200) NOT NULL,
  `file` varchar(100) NOT NULL DEFAULT '',
  `info` varchar(200) NOT NULL DEFAULT '',
  `admin` int(11) NOT NULL DEFAULT 0,
  `public` int(11) NOT NULL DEFAULT 1,
  `datetime` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_data` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_gid` int(11) NOT NULL DEFAULT 1,
  `admin` int(11) NOT NULL DEFAULT 0,
  `fname` varchar(200) NOT NULL DEFAULT '',
  `lname` varchar(100) NOT NULL DEFAULT '',
  `bday` date NOT NULL DEFAULT '1970-01-01',
  `sex` varchar(10) NOT NULL DEFAULT '',
  `position` varchar(200) NOT NULL DEFAULT '',
  `address` varchar(150) NOT NULL DEFAULT '',
  `umpher` varchar(50) NOT NULL DEFAULT '',
  `province` smallint NOT NULL DEFAULT 0,
  `zipcode` varchar(5) NOT NULL DEFAULT '',
  `phonenumber` varchar(15) NOT NULL DEFAULT '',
  `email` varchar(100) NOT NULL DEFAULT '',
  `signup` varchar(100) NOT NULL DEFAULT '',
  `username` varchar(30) NOT NULL,
  `password` varchar(30) NOT NULL DEFAULT '',
  `loginstatus` int(11) NOT NULL DEFAULT 0,
  `lastupdate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `lastlogin` varchar(100) NOT NULL DEFAULT '',
  `user_ip` varchar(15) NOT NULL DEFAULT '',
  `file` varchar(100) NOT NULL DEFAULT '',
  `list` int(11) NOT NULL DEFAULT 0,
  `public` int(11) NOT NULL DEFAULT 1,
  `admin_id` int(11) NOT NULL DEFAULT 0,
  `nickname` varchar(200) NOT NULL DEFAULT '',
  `employment_status` varchar(100) NOT NULL DEFAULT '',
  `company_display` varchar(300) NOT NULL DEFAULT '',
  `sick_leave_days` int(11) NOT NULL DEFAULT 0,
  `vacation_days` int(11) NOT NULL DEFAULT 0,
  `sales_target_baht` double NOT NULL DEFAULT 0,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_data_username_key` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `job_data` (
  `job_id` int(11) NOT NULL AUTO_INCREMENT,
  `profile_id` int(11) NOT NULL DEFAULT 1,
  `job_no` int(11) NOT NULL DEFAULT 0,
  `customer_id` int(11) NOT NULL DEFAULT 0,
  `service_id` varchar(15) NOT NULL DEFAULT '',
  `product_name` varchar(200) NOT NULL DEFAULT '',
  `model` varchar(200) NOT NULL DEFAULT '',
  `brand` varchar(200) NOT NULL DEFAULT '',
  `sn` varchar(100) NOT NULL DEFAULT '',
  `job_amount` int(11) NOT NULL DEFAULT 0,
  `info` text NOT NULL DEFAULT '',
  `recive_job` date NOT NULL,
  `send_job` date NOT NULL,
  `job_condition` text NOT NULL DEFAULT '',
  `workgroup_id` int(11) NOT NULL DEFAULT 0,
  `sale_id` int(11) NOT NULL DEFAULT 0,
  `engeneer_id` int(11) NOT NULL DEFAULT 0,
  `job_status` smallint NOT NULL DEFAULT 0,
  `job_po` varchar(50) NOT NULL DEFAULT '',
  `job_quotation` varchar(20) NOT NULL DEFAULT '',
  `job_invoice` varchar(20) NOT NULL DEFAULT '',
  `job_delivery` varchar(20) NOT NULL DEFAULT '',
  `img1` varchar(50) NOT NULL DEFAULT '',
  `img2` varchar(50) NOT NULL DEFAULT '',
  `public` int(11) NOT NULL DEFAULT 1,
  `modified` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `user_id` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`job_id`),
  KEY `job_data_job_status_idx` (`job_status`),
  KEY `job_data_sale_id_idx` (`sale_id`),
  KEY `job_data_customer_id_idx` (`customer_id`),
  KEY `job_data_recive_job_idx` (`recive_job`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `bill_quota` (
  `quota_id` int(11) NOT NULL AUTO_INCREMENT,
  `profile_id` int(11) NOT NULL DEFAULT 1,
  `job_id` int(11) NOT NULL DEFAULT 0,
  `unit_price` double NOT NULL DEFAULT 0,
  `grand_total` double NOT NULL DEFAULT 0,
  `quota_no` int(11) NOT NULL DEFAULT 0,
  `quota_to` varchar(200) NOT NULL DEFAULT '',
  `quota_date` date NOT NULL,
  `quota_time` time NOT NULL DEFAULT '00:00:00',
  `quota_info` text NOT NULL DEFAULT '',
  `bill_id` varchar(20) NOT NULL DEFAULT '',
  `year` varchar(4) NOT NULL DEFAULT '',
  `modified` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `user_id` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`quota_id`),
  KEY `bill_quota_quota_date_idx` (`quota_date`),
  KEY `bill_quota_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `bill_order` (
  `bo_id` int(11) NOT NULL AUTO_INCREMENT,
  `profile_id` int(11) NOT NULL DEFAULT 1,
  `bo_number` int(11) NOT NULL DEFAULT 0,
  `job_id` int(11) NOT NULL DEFAULT 0,
  `bo_no` varchar(200) NOT NULL DEFAULT '',
  `ref_qt` varchar(50) NOT NULL DEFAULT '',
  `ref_po` varchar(50) NOT NULL DEFAULT '',
  `bo_imoney` varchar(200) NOT NULL DEFAULT '',
  `bo_date` date NOT NULL,
  `bo_cardit` varchar(50) NOT NULL DEFAULT '',
  `send_date` date NOT NULL,
  `audit_status` int(11) NOT NULL DEFAULT 0,
  `bo_receive` int(11) NOT NULL DEFAULT 0,
  `market` int(11) NOT NULL DEFAULT 0,
  `grandtotal` varchar(50) NOT NULL DEFAULT '',
  `bo_info` text NOT NULL DEFAULT '',
  `user_id` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`bo_id`),
  KEY `bill_order_bo_date_idx` (`bo_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `bill_invoice` (
  `inv_id` int(11) NOT NULL AUTO_INCREMENT,
  `profile_id` int(11) NOT NULL DEFAULT 1,
  `job_id` int(11) NOT NULL DEFAULT 0,
  `inv_number` int(11) NOT NULL DEFAULT 0,
  `inv_no` varchar(20) NOT NULL DEFAULT '',
  `inv_date` date NOT NULL,
  `inv_info` text NOT NULL DEFAULT '',
  `modified` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `user_id` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`inv_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pr_data` (
  `pr_id` int(11) NOT NULL AUTO_INCREMENT,
  `profile_id` int(11) NOT NULL DEFAULT 1,
  `job_id` int(11) NOT NULL DEFAULT 0,
  `pr_no` int(11) NOT NULL DEFAULT 0,
  `pr_code` varchar(20) NOT NULL DEFAULT '',
  `pr_date` date NOT NULL,
  `modified` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `user_id` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`pr_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `receive_order` (
  `ro_id` int(11) NOT NULL AUTO_INCREMENT,
  `profile_id` int(11) NOT NULL DEFAULT 1,
  `bo_id` int(11) NOT NULL DEFAULT 0,
  `ro_number` int(11) NOT NULL DEFAULT 0,
  `job_id` int(11) NOT NULL DEFAULT 0,
  `ro_no` varchar(20) NOT NULL DEFAULT '',
  `ro_date` date NOT NULL,
  `ro_po` varchar(100) NOT NULL DEFAULT '',
  `ro_tax` varchar(20) NOT NULL DEFAULT '',
  `ro_ref` varchar(100) NOT NULL DEFAULT '',
  `ro_credit` varchar(100) NOT NULL DEFAULT '',
  `end_date` date NOT NULL,
  `advance_payment` double NOT NULL DEFAULT 0,
  `tax` double NOT NULL DEFAULT 0,
  `ro_info` text NOT NULL DEFAULT '',
  `modified` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `user_id` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ro_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rfq` (
  `rfq_id` int(11) NOT NULL AUTO_INCREMENT,
  `rfq_confirm` int(11) NOT NULL DEFAULT 0,
  `rfq_no` varchar(20) NOT NULL DEFAULT '',
  `rfq_date` date NOT NULL,
  `job_id` int(11) NOT NULL DEFAULT 0,
  `profile_id` int(11) NOT NULL DEFAULT 1,
  `modified` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `user_id` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`rfq_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sparepart` (
  `part_id` int(11) NOT NULL AUTO_INCREMENT,
  `job_id` int(11) NOT NULL DEFAULT 0,
  `sp_img` varchar(200) NOT NULL DEFAULT '',
  `part_no` varchar(100) NOT NULL DEFAULT '',
  `part_detail` text NOT NULL DEFAULT '',
  `case_stype` varchar(200) NOT NULL DEFAULT '',
  `part_num` int(11) NOT NULL DEFAULT 0,
  `part_info` text NOT NULL DEFAULT '',
  `rfq_id` int(11) NOT NULL DEFAULT 0,
  `store_one` int(11) NOT NULL DEFAULT 0,
  `price1` double NOT NULL DEFAULT 0,
  `vat1` double NOT NULL DEFAULT 0,
  `store_two` int(11) NOT NULL DEFAULT 0,
  `price2` double NOT NULL DEFAULT 0,
  `vat2` double NOT NULL DEFAULT 0,
  `store_three` int(11) NOT NULL DEFAULT 0,
  `price3` double NOT NULL DEFAULT 0,
  `vat3` double NOT NULL DEFAULT 0,
  `store_buy` int(11) NOT NULL DEFAULT 0,
  `total` double NOT NULL DEFAULT 0,
  `descount` double NOT NULL DEFAULT 0,
  `unit` varchar(50) NOT NULL DEFAULT '',
  `part_status` int(11) NOT NULL DEFAULT 0,
  `receive_status` int(11) NOT NULL DEFAULT 0,
  `user_id` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`part_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed (ค่าเริ่มต้น)

INSERT INTO `workstatus` (`ws_id`, `ws_name`, `info`, `list`, `public`, `user_id`) VALUES
 (1, 'N01. รับงาน', 'บันทึกข้อมูลงานที่รับเข้าบริษัท', 1, 1, 2),
 (2, 'N02. ออกแบบตรวจเช็ค', 'หัวหน้าช่างเลือกผู้รับผิดชอบงานนั้น(เลือกช่าง) และช่างที่ได้รับมอบหมายดำเนินการตรวจเช็ค, ออกแบบ, ผลิต', 2, 1, 2),
 (3, 'N03. ขอข้อมูลเพิ่มเติมฝ่ายขาย', 'ทางช่างขอข้อมูลเพิ่มเติมจาก SALE ในงานที่อาจจะติดปัญหา', 3, 1, 2),
 (4, 'N04. หาราคาอะไหล่', 'ทางช่างขออะไหล่ กรอกข้อมูลครบถ้วน (หาราคาอะไหล่)', 4, 1, 2),
 (5, 'N05. หาราคาเสร็จสิ้น', 'หาราคาอะไหล่ครบถ้วนทุกรายการเรียบร้อย', 5, 1, 2),
 (6, 'N06. เสนอราคา', 'จัดทำเอกสารใบเสนอราคาให้ทางลูกค้าแล้ว', 6, 1, 0),
 (7, 'N07. รอ PO ลูกค้า', 'เสนอราคาแล้ว รอลูกค้าพิจารณาว่าต้องการซ่อมหรือไม่', 7, 1, 0),
 (8, 'N08. PO มาแล้ว', 'ลูกค้าอนุมัติซ่อมแล้ว', 8, 1, 0),
 (9, 'N09. เปิด PR ', 'ขออนุมัติซื้ออะไหล่ ( เอกสาร )', 9, 1, 0),
 (10, 'N10. เปิด PO จัดซื้อ', 'ได้รับการอนุมัติ PR แล้ว เปิด PO สั่งซื้อสินค้า', 10, 1, 0),
 (11, 'N11. รอบัญชีชำระเงิน', 'ใส่เลข PO I-money เรียบร้อยแล้ว (รอทางบัญชีทำขั้นตอนการจ่ายเงิน เงินสด, เช็ค, โอน, เครดิต)', 11, 1, 0),
 (12, 'N12. รอรับของ(อะไหล่)', 'บัญชีชำระเงินเรียบร้อยแล้ว สั่งของกับ Supplier เรียบร้อย', 12, 1, 0),
 (13, 'N13. ของมาแล้ว ', 'สินค้าที่สั่งกับ Supplier ดำเนินการส่งของแล้ว (Stroe ทำใบรับสินค้า)', 13, 1, 0),
 (14, 'N14. ดำเนินการผลิต(อะไหล่มาครบ)', 'ช่างได้รับอะไหล่เรียบร้อยแล้ว', 14, 1, 0),
 (15, 'N15. ซ่อมเสร็จแล้ว', 'ช่างดำเนินการซ่อม ผลิต เรียบร้อย', 15, 1, 0),
 (16, 'N16. ส่งของเทส', 'ช่างซ่อมเสร็จ Sale นำงานไปเทสให้ลูกค้า (ต้องมีเอกสารใบส่งของอ้างอิง)', 16, 1, 0),
 (17, 'N17. รอเก็บเงิน', 'ใส่เลขที่เอกสารวางบิลและเลขที่เอกสารใบกำกับภาษี', 17, 1, 0),
 (18, 'N18. ปิดงาน', 'ใส่เลขที่เอกสารใบเสร็จรับเงิน (จบงาน)', 18, 1, 0),
 (19, 'N19. ยกเลิก-คืนงาน', 'ลูกค้าไม่ซ่อมหรือถึงกำหนดคืนงาน (ต้องมีเลขที่เอกสารใบส่งของคืนอ้างอิง)', 19, 1, 0),
 (20, 'เครม', 'ไม่ผ่าน', 20, 1, 0)
ON DUPLICATE KEY UPDATE
  `ws_name` = VALUES(`ws_name`),
  `info` = VALUES(`info`),
  `list` = VALUES(`list`),
  `public` = VALUES(`public`),
  `user_id` = VALUES(`user_id`);

INSERT INTO `workgroup` (`wg_id`, `wg_name`, `info`, `list`, `public`, `user_id`) VALUES
 (3, 'งานขาย', 'ซื้อสินค้าและขายออกไป', 1, 1, 0),
 (7, 'งานซ่อม', 'งานซ่อมทุกชนิด', 3, 1, 2),
 (8, 'งานโปรเจค', 'COPY และ วิจัย', 4, 1, 19),
 (9, 'งานผลิต', 'ผลิตสินค้า', 5, 1, 19),
 (10, 'งานออกแบบ', 'เขียนแบบ', 6, 1, 0),
 (11, 'งานสโตร์', 'หาอะไหล่เข้าสโตร์ พร้อมขาย', 7, 1, 0)
ON DUPLICATE KEY UPDATE
  `wg_name` = VALUES(`wg_name`),
  `info` = VALUES(`info`),
  `list` = VALUES(`list`),
  `public` = VALUES(`public`),
  `user_id` = VALUES(`user_id`);

INSERT INTO `user_group` (`group_id`, `group_tid`, `group_name`, `file`, `info`, `admin`, `public`, `datetime`) VALUES
 (1, 1, 'ผู้ดูแลระบบ/Admin', 'Human-Resource-Management.jpg', 'ผู้ดูแลระบบสูงสุด', 1, 1, ''),
 (2, 1, 'พนักงานขาย', 'Human-Resource-Management.jpg', 'พนักงานขายสินค้า', 1, 1, ''),
 (9, 0, 'จัดหา', '', 'หาอะไหล่ที่สโตร์ไม่มี', 0, 1, ''),
 (10, 0, 'ผู้จัดการบัญชี/การเงิน', '', 'จัดการดูแลรับจ่าย', 0, 1, ''),
 (5, 0, 'ฝ่ายผลิต', '', 'ช่าง', 0, 1, ''),
 (6, 0, 'สโตร์', '', 'ผู้ดูแลคลังสินค้า', 0, 1, ''),
 (7, 0, 'Support Sale', '', 'ซัพพลอตพนักงานขาย', 0, 1, ''),
 (8, 0, 'ผู้จัดการฝ่ายผลิต', '', 'ผู้ที่สามารถเลือกผู้รับผิดชอบทีมช่างได้คนเดียวเท่านั้น', 0, 1, ''),
 (11, 0, 'บัญชี/การเงิน', '', 'ดูแลรับจ่าย', 0, 1, ''),
 (13, 0, 'ผู้จัดการบริษัท', '', 'ดูแลทั้งหมด', 0, 1, ''),
 (14, 0, 'ผู้จัดการฝ่ายบุคคล', '', '', 0, 1, ''),
 (15, 0, 'ฝ่ายบุคคล', '', '', 0, 1, ''),
 (17, 0, 'ผู้จัดการฝ่ายขาย', '', 'ดูแลทีมขาย', 0, 1, ''),
 (18, 0, 'บริการ', '', 'ดูแลบริษัท', 0, 1, ''),
 (20, 0, 'หัวหน้าทีมซ่อม', '', 'หัวหน้าทีมซ่อม', 0, 1, ''),
 (21, 0, 'หัวหน้าทีม ASL', '', 'หัวหน้าทีมซ่อม ASL', 0, 1, ''),
 (22, 0, 'หัวหน้าทีม ประกอบ', '', 'หัวหน้าทีมประกอบงาน', 0, 1, '')
ON DUPLICATE KEY UPDATE
  `group_tid` = VALUES(`group_tid`),
  `group_name` = VALUES(`group_name`),
  `file` = VALUES(`file`),
  `info` = VALUES(`info`),
  `admin` = VALUES(`admin`),
  `public` = VALUES(`public`),
  `datetime` = VALUES(`datetime`);

SET FOREIGN_KEY_CHECKS = 1;
