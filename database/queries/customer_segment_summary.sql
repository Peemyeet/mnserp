-- =============================================================================
-- Customer segment summary (MySQL 5.7+ / 8.x) — db_mns
-- ใช้สรุปจำนวนงานและมูลค่าใบเสนอราคาต่อลูกค้า พร้อมชื่อจังหวัด
-- รันบนฐานข้อมูลจริงหลัง import; ปรับช่วงวันที่ตามต้องการ
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) สรุปต่อลูกค้า: จำนวน job, งานล่าสุด, ยอดรวมใบเสนอราคา (รวม quota ต่อลูกค้าแบบไม่ซ้ำ)
-- -----------------------------------------------------------------------------
SELECT
  c.cus_id,
  c.cus_code,
  c.cus_name,
  p.PROVINCE_ID,
  TRIM(p.PROVINCE_NAME) AS province_name,
  COALESCE(jm.job_count, 0) AS job_count,
  jm.first_job_date,
  jm.last_job_date,
  jm.last_job_modified,
  COALESCE(qs.quota_grand_total_sum, 0) AS quota_grand_total_sum
FROM customer c
LEFT JOIN province p ON p.PROVINCE_ID = c.cus_province
LEFT JOIN (
  SELECT
    customer_id,
    COUNT(*) AS job_count,
    MIN(recive_job) AS first_job_date,
    MAX(recive_job) AS last_job_date,
    MAX(modified) AS last_job_modified
  FROM job_data
  WHERE customer_id > 0
  GROUP BY customer_id
) jm ON jm.customer_id = c.cus_id
LEFT JOIN (
  SELECT
    j.customer_id AS cid,
    SUM(bq.grand_total) AS quota_grand_total_sum
  FROM bill_quota bq
  INNER JOIN job_data j ON j.job_id = bq.job_id AND j.profile_id = bq.profile_id
  WHERE j.customer_id > 0
  GROUP BY j.customer_id
) qs ON qs.cid = c.cus_id
ORDER BY job_count DESC, quota_grand_total_sum DESC;


-- -----------------------------------------------------------------------------
-- 2) ทางเลือก: นับ job อย่างเดียว (เบา ไม่ join quota ซ้ำ)
-- -----------------------------------------------------------------------------
SELECT
  c.cus_id,
  c.cus_code,
  c.cus_name,
  TRIM(p.PROVINCE_NAME) AS province_name,
  COUNT(*) AS job_count,
  MAX(j.recive_job) AS last_job_date
FROM customer c
INNER JOIN job_data j ON j.customer_id = c.cus_id AND j.customer_id > 0
LEFT JOIN province p ON p.PROVINCE_ID = c.cus_province
GROUP BY c.cus_id, c.cus_code, c.cus_name, p.PROVINCE_NAME
ORDER BY job_count DESC;


-- -----------------------------------------------------------------------------
-- 3) ยอดรวมใบเสนอราคาต่อลูกค้า (aggregate ที่ quota ก่อน แล้วค่อย join job)
--    ลดความเสี่ยงนับซ้ำเมื่อหนึ่ง job มีหลายแถว quota
-- -----------------------------------------------------------------------------
SELECT
  c.cus_id,
  c.cus_code,
  c.cus_name,
  TRIM(p.PROVINCE_NAME) AS province_name,
  COALESCE(q.sum_grand_total, 0) AS quota_grand_total_sum,
  COALESCE(q.quota_rows, 0) AS quota_line_count
FROM customer c
LEFT JOIN province p ON p.PROVINCE_ID = c.cus_province
LEFT JOIN (
  SELECT
    j.customer_id AS cid,
    SUM(bq.grand_total) AS sum_grand_total,
    COUNT(*) AS quota_rows
  FROM bill_quota bq
  INNER JOIN job_data j ON j.job_id = bq.job_id AND j.profile_id = bq.profile_id
  WHERE j.customer_id > 0
  GROUP BY j.customer_id
) q ON q.cid = c.cus_id
ORDER BY quota_grand_total_sum DESC;


-- -----------------------------------------------------------------------------
-- 4) แปลง bill_order.grandtotal (varchar) — ใช้เมื่อต้องการสรุปจากใบสั่งซื้อ
--    ค่าที่ไม่ใช่ตัวเลขจะกลายเป็น NULL
-- -----------------------------------------------------------------------------
SELECT
  c.cus_id,
  c.cus_code,
  SUM(
    CASE
      WHEN bo.grandtotal REGEXP '^[0-9]+(\\.[0-9]+)?$'
      THEN CAST(bo.grandtotal AS DECIMAL(14, 2))
      ELSE 0
    END
  ) AS order_grandtotal_sum
FROM customer c
JOIN job_data j ON j.customer_id = c.cus_id AND j.customer_id > 0
JOIN bill_order bo ON bo.job_id = j.job_id AND bo.profile_id = j.profile_id
GROUP BY c.cus_id, c.cus_code;


-- -----------------------------------------------------------------------------
-- 5) ลูกค้าที่ไม่มีงานใหม่นาน (ตัวอย่าง: เงียบเกิน 365 วัน — ปรับ INTERVAL ได้)
--    ต้องการ MySQL ที่รองรับการเปรียบเทียบวันที่กับ CURDATE()
-- -----------------------------------------------------------------------------
SELECT
  c.cus_id,
  c.cus_code,
  c.cus_name,
  MAX(j.recive_job) AS last_receive_job,
  MAX(j.modified) AS last_modified
FROM customer c
JOIN job_data j ON j.customer_id = c.cus_id AND j.customer_id > 0
GROUP BY c.cus_id, c.cus_code, c.cus_name
HAVING MAX(j.recive_job) < DATE_SUB(CURDATE(), INTERVAL 365 DAY)
   OR MAX(j.recive_job) = '0000-00-00'
ORDER BY last_receive_job ASC;
