import type { SalesPersonKpiRow } from "../data/salesKpiSeed";
import type { PmUser } from "../types/pmUser";
import { canAccessDepartment, hasFullDepartmentAccess } from "./deptAccess";

/**
 * KPI รายคน — ใช้เฉพาะข้อมูลจาก API (/api/reports/sales) ในหน้ารีพอร์ต ไม่ใช้ตัวเลข mock
 */
export function getSalesKpiRowsForUser(user: PmUser | null): SalesPersonKpiRow[] {
  if (user == null) return [];
  if (!canAccessDepartment(user, "sales")) return [];
  return [];
}

export function canSeeAllSalesKpi(user: PmUser | null): boolean {
  return user != null && hasFullDepartmentAccess(user);
}
