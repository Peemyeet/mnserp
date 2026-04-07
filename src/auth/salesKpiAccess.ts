import { SALES_KPI_SEED, type SalesPersonKpiRow } from "../data/salesKpiSeed";
import type { PmUser } from "../types/pmUser";
import { canAccessDepartment, hasFullDepartmentAccess } from "./deptAccess";

/**
 * KPI รายคน: ผู้มีสิทธิ์ภาพรวมเห็นทุกแถว — พนักขายทั่วไปเห็นเฉพาะแถวที่ผูก user.id
 */
export function getSalesKpiRowsForUser(user: PmUser | null): SalesPersonKpiRow[] {
  if (user == null) return [];
  if (!canAccessDepartment(user, "sales")) return [];
  if (hasFullDepartmentAccess(user)) {
    return [...SALES_KPI_SEED];
  }
  return SALES_KPI_SEED.filter((r) => r.linkedUserId === user.id);
}

export function canSeeAllSalesKpi(user: PmUser | null): boolean {
  return user != null && hasFullDepartmentAccess(user);
}
