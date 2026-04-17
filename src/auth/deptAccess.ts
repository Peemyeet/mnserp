import type { DepartmentId } from "../data/departments";
import { DEPARTMENTS } from "../data/departments";
import type { PmUser } from "../types/pmUser";
import { isWarehouseKind } from "../data/warehouseNav";
import type { WarehouseKind } from "../types/orgSettings";

const ALL_DEPTS: DepartmentId[] = DEPARTMENTS.map((d) => d.id);

/** รหัสแผนกจาก PM → รหัสแผนกใน ERP */
const PM_CODE_TO_DEPT: Record<string, DepartmentId> = {
  SALES: "sales",
  PRODUCTION: "production",
  PURCHASE: "purchase",
  ACCOUNTING: "accounting",
};

function norm(s: string | null | undefined): string {
  return (s ?? "").trim().toUpperCase();
}

/** ผู้ดูแล / สำนักงานกลาง / PMO ดูทุกแผนกในเมนู */
export function hasFullDepartmentAccess(user: PmUser): boolean {
  const r = norm(user.roleCode);
  const d = norm(user.departmentCode);
  if (r === "ADMIN") return true;
  if (d === "HQ") return true;
  if (d === "PMO") return true;
  return false;
}

/** แผนกที่ผู้ใช้เห็นได้ในระบบ ERP */
export function allowedDepartmentIds(user: PmUser): DepartmentId[] {
  if (hasFullDepartmentAccess(user)) {
    return [...ALL_DEPTS];
  }
  const code = norm(user.departmentCode);
  const mapped = PM_CODE_TO_DEPT[code];
  if (mapped) {
    return [mapped];
  }
  const role = norm(user.roleCode);
  if (role === "SALES") return ["sales"];
  if (role === "PRODUCTION") return ["production"];
  if (role === "PURCHASE" || role === "BUYER") return ["purchase"];
  if (role === "ACCOUNTING" || role === "FINANCE") return ["accounting"];
  return [];
}

export function canAccessDepartment(
  user: PmUser,
  deptId: DepartmentId
): boolean {
  return allowedDepartmentIds(user).includes(deptId);
}

/** คลังที่แสดงตามแผนก (คนนอกแผนกไม่เห็นคลังที่ไม่เกี่ยว) */
export function allowedWarehouseKinds(user: PmUser): WarehouseKind[] {
  if (hasFullDepartmentAccess(user)) {
    return ["spare", "production", "sales"];
  }
  const depts = allowedDepartmentIds(user);
  const kinds = new Set<WarehouseKind>();
  if (depts.includes("sales")) kinds.add("sales");
  if (depts.includes("production")) {
    kinds.add("production");
    kinds.add("spare");
  }
  if (depts.includes("purchase")) kinds.add("spare");
  if (depts.includes("accounting")) {
    /* บัญชีไม่บังคับคลัง — ถ้าต้องการให้เห็นทั้งหมดในอนาคตแก้ที่นี่ */
  }
  return kinds.size > 0 ? [...kinds] : [];
}

/**
 * เส้นทาง "หน้าทำงาน" หลักตามผู้ใช้ — แผนกเดียวไปที่โฟลเดอร์งานของแผนกนั้นเลย;
 * ผู้ดูแลระบบ / HQ / PMO ยังใช้ `/` (แดชบอร์ดรวม)
 */
export function defaultHomePath(user: PmUser): string {
  if (hasFullDepartmentAccess(user)) {
    return "/";
  }
  const ids = allowedDepartmentIds(user);
  if (ids.length !== 1) {
    return "/";
  }
  switch (ids[0]) {
    case "sales":
      return "/dept/sales/dashboard";
    case "purchase":
      return "/dept/purchase/work";
    case "production":
      return "/dept/production/work";
    case "accounting":
      return "/dept/accounting";
    default:
      return "/";
  }
}

/**
 * ถ้า path นี้ผูกกับแผนกใดแผนกหนึ่ง — คืนรหัสแผนก; ถ้าไม่ผูก คืน null (เข้าได้ทุกคน)
 */
export function requiredDepartmentForPath(pathname: string): DepartmentId | null {
  if (pathname.startsWith("/stage/")) {
    return "sales";
  }
  if (pathname === "/sales" || pathname.startsWith("/sales/")) {
    return "sales";
  }
  if (pathname.startsWith("/dept/sales")) {
    return "sales";
  }
  if (pathname.startsWith("/dept/purchase")) {
    return "purchase";
  }
  if (pathname.startsWith("/dept/production")) {
    return "production";
  }
  if (
    pathname.startsWith("/dept/accounting") ||
    pathname === "/dept/accounting"
  ) {
    return "accounting";
  }
  if (pathname.startsWith("/dept/")) {
    const seg = pathname.split("/")[2];
    if (
      seg === "sales" ||
      seg === "purchase" ||
      seg === "production" ||
      seg === "accounting"
    ) {
      return seg;
    }
  }
  return null;
}

export function canAccessPath(user: PmUser, pathname: string): boolean {
  if (!hasFullDepartmentAccess(user)) {
    const allowSettingsForDeptUser = new Set([
      "/settings/accounting-payables",
      "/settings/customers",
      "/settings/chart-of-accounts",
    ]);
    if (
      pathname.startsWith("/settings/") &&
      !allowSettingsForDeptUser.has(pathname)
    ) {
      return false;
    }
    if (pathname.startsWith("/approve")) {
      return false;
    }
    if (pathname.startsWith("/documents")) {
      return false;
    }
  }
  if (pathname.startsWith("/warehouse/")) {
    const seg = pathname.split("/")[2];
    return isWarehouseKind(seg);
  }
  const need = requiredDepartmentForPath(pathname);
  if (need == null) {
    return true;
  }
  return canAccessDepartment(user, need);
}
