-- อ้างอิง legacy: store_part.php (Keenthemes) — ไฟล์นั้นเป็น HTML/JS เท่านั้น
-- ไม่มีรายการรหัส/ชื่ออะไหล่ในตัวไฟล์; ข้อมูลโหลดจาก json_data/json_store.php → ตาราง store_data
--
-- แมปฟิลด์หลักกับฟอร์ม Add Part:
--   Category / Sub Category → store_category (category_id) — คอลัมน์ใน DB คือ category (int)
--   Part No (input name s_name ใน PHP) → store_data.s_name (ชื่อ/รายละเอียดสั้น)
--   รหัสภายใน / MNS style → store_data.s_no
--   Description → store_data.info
--   QTY → store_data.s_num
--   Location → s_store, s_locker, s_floor, s_box
--   price → s_price, s_market → รหัสซัพพลาย (legacy)
--
-- หลัง import database/db_mns.sql จะมี store_data จำนวนมากอยู่แล้ว (เช่น R_M001, PCB_1, R-C001…)
-- รันซ้ำ: DELETE FROM store_data WHERE s_no IN ('MNS-DEMO-001','MNS-DEMO-002','MNS-DEMO-003');

SET NAMES utf8mb4;

INSERT INTO `store_data` (
  `category`,
  `s_store`,
  `s_locker`,
  `s_floor`,
  `s_box`,
  `s_no`,
  `s_name`,
  `s_sn`,
  `s_model`,
  `s_brand`,
  `coach`,
  `info`,
  `s_num`,
  `s_unit`,
  `s_price`,
  `s_market`,
  `s_img`,
  `public`,
  `modified`,
  `user_id`
) VALUES
  (
    63,
    '1',
    'R1',
    '1',
    '1',
    'MNS-DEMO-001',
    'ตัวอย่างตามฟอร์ม Store Part (Resister)',
    '',
    '',
    '',
    '',
    'แถวทดสอบจาก migration 004 — หมวด Resister',
    10,
    'PCS',
    0,
    0,
    '',
    1,
    NOW(),
    1
  ),
  (
    67,
    '1',
    'M1',
    '1',
    '1',
    'MNS-DEMO-002',
    'PCB ตัวอย่าง — Goon on hand',
    '',
    '',
    '',
    '',
    'ของพร้อมขาย (หมวดตัวอย่าง)',
    0,
    'PCS',
    0,
    1,
    '',
    1,
    NOW(),
    1
  ),
  (
    69,
    '1',
    'B1',
    '1',
    '1',
    'MNS-DEMO-003',
    'Thick Film Chip ตัวอย่าง',
    '',
    '',
    '',
    '',
    'Thick Film Chip Resistors ตัวอย่าง',
    5000,
    'PCS',
    0,
    71,
    '',
    1,
    NOW(),
    1
  );
