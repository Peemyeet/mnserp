import {
  allowedDepartmentIds,
  hasFullDepartmentAccess,
} from "../auth/deptAccess";
import { useAuth } from "../context/AuthContext";
import { DashboardPage } from "./DashboardPage";
import { AccountingDeptWork } from "./dept/AccountingDeptWork";
import { ProductionDeptLanding } from "./dept/ProductionDeptLanding";
import { PurchaseDeptLanding } from "./dept/PurchaseDeptLanding";
import { SalesDeptLanding } from "./dept/SalesDeptLanding";

/**
 * หน้าหลัก `/` — admin / PMO เห็นแดชบอร์ดรวม;
 * แผนกอื่นเห็นแดชบอร์ด (landing) ของแผนกตน
 */
export function HomePage() {
  const { user } = useAuth();

  if (user == null) {
    return null;
  }

  if (hasFullDepartmentAccess(user)) {
    return <DashboardPage />;
  }

  const ids = allowedDepartmentIds(user);
  if (ids.length !== 1) {
    return <DashboardPage />;
  }

  switch (ids[0]) {
    case "sales":
      return <SalesDeptLanding />;
    case "purchase":
      return <PurchaseDeptLanding />;
    case "production":
      return <ProductionDeptLanding />;
    case "accounting":
      return <AccountingDeptWork />;
    default:
      return <DashboardPage />;
  }
}
