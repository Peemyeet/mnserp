/**
 * โปรไฟล์ผู้ใช้ที่ออกแบบให้สอดคล้องกับข้อมูลจาก project manager (users / roles / org)
 * เมื่อเชื่อม API/DB จริง ให้ map ฟิลด์จาก response ของ PM เข้ามาที่ type นี้
 */
export type PmUser = {
  id: string;
  /** รหัสอ้างอิงจากตารางผู้ใช้ในระบบ PM (ถ้ามี) */
  pmUserId?: string;
  username: string;
  displayNameTh: string;
  email?: string | null;
  /** รหัสบทบาทใน PM เช่น admin, sales, pm */
  roleCode?: string | null;
  /** รหัสแผนก / หน่วยงาน สำหรับสิทธิ์และรายงาน */
  departmentCode?: string | null;
};

export type AuthSession = {
  user: PmUser;
  /** access token จาก PM หรือ IdP — ใช้แนบ header เมื่อเรียก API */
  accessToken?: string;
};
