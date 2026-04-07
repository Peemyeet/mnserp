/** แถวจาก GET /api/users */
export type MnsUserRow = {
  user_id: number;
  fname: string;
  lname: string;
  nickname: string;
  username: string;
  phonenumber: string;
  email: string;
  position: string;
  loginstatus: number;
  employment_status: string;
  company_display: string;
  sick_leave_days: number;
  vacation_days: number;
  /** เป้าหมายยอดขาย KPI ฝ่ายขาย (บาท) — ใช้ในรีพอร์ตฝ่ายขาย */
  sales_target_baht: number;
  user_gid: number;
  group_name: string;
};

export type MnsUserGroupRow = {
  group_id: number;
  group_name: string;
};
