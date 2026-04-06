import type { PmUser } from "../types/pmUser";

function norm(s: string | null | undefined): string {
  return (s ?? "").trim().toUpperCase();
}

/** ผู้รับการแจ้งเตือนเมื่อมีการแจ้งปัญหา IT (บทบาทแอดมิน) */
export function receivesItAdminAlerts(user: PmUser | null | undefined): boolean {
  if (!user) return false;
  return norm(user.roleCode) === "ADMIN";
}
