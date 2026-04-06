import type { PmUser } from "../types/pmUser";

/**
 * ผู้ใช้ตัวอย่างสำหรับพัฒนาเมื่อยังไม่ได้ต่อ API project manager
 * รหัสผ่านเป็นข้อความล้วน (dev เท่านั้น) — production ให้ยืนยันผ่าน PM API เท่านั้น
 */
export type PmUserSeedRow = {
  username: string;
  password: string;
  user: PmUser;
};

export const PM_USERS_SEED: PmUserSeedRow[] = [
  {
    username: "admin",
    password: "mns",
    user: {
      id: "pm-u-1",
      pmUserId: "pm-u-1",
      username: "admin",
      displayNameTh: "ผู้ดูแลระบบ",
      email: "admin@example.local",
      roleCode: "admin",
      departmentCode: "HQ",
    },
  },
  {
    username: "sale",
    password: "mns",
    user: {
      id: "pm-u-2",
      pmUserId: "pm-u-2",
      username: "sale",
      displayNameTh: "พนักงานขาย",
      email: "sale@example.local",
      roleCode: "sales",
      departmentCode: "SALES",
    },
  },
  {
    username: "pm",
    password: "mns",
    user: {
      id: "pm-u-3",
      pmUserId: "pm-u-3",
      username: "pm",
      displayNameTh: "Project Manager",
      email: "pm@example.local",
      roleCode: "pm",
      departmentCode: "PMO",
    },
  },
  {
    username: "prod",
    password: "mns",
    user: {
      id: "pm-u-4",
      pmUserId: "pm-u-4",
      username: "prod",
      displayNameTh: "ฝ่ายผลิต",
      email: "prod@example.local",
      roleCode: "production",
      departmentCode: "PRODUCTION",
    },
  },
  {
    username: "buyer",
    password: "mns",
    user: {
      id: "pm-u-5",
      pmUserId: "pm-u-5",
      username: "buyer",
      displayNameTh: "จัดซื้อ",
      email: "buyer@example.local",
      roleCode: "purchase",
      departmentCode: "PURCHASE",
    },
  },
  {
    username: "acct",
    password: "mns",
    user: {
      id: "pm-u-6",
      pmUserId: "pm-u-6",
      username: "acct",
      displayNameTh: "บัญชี",
      email: "acct@example.local",
      roleCode: "accounting",
      departmentCode: "ACCOUNTING",
    },
  },
];
