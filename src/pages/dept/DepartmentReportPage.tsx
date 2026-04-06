import { Navigate, useParams } from "react-router-dom";
import type { DepartmentId } from "../../data/departments";
import { AccountingDeptReport } from "./AccountingDeptReport";
import { ProductionDeptReport } from "./ProductionDeptReport";
import { PurchaseDeptReport } from "./PurchaseDeptReport";
import { SalesDeptReport } from "./SalesDeptReport";

const IDS: DepartmentId[] = ["sales", "production", "purchase", "accounting"];

export function DepartmentReportPage() {
  const { deptId } = useParams<{ deptId: string }>();
  if (!deptId || !IDS.includes(deptId as DepartmentId)) {
    return <Navigate to="/" replace />;
  }

  switch (deptId as DepartmentId) {
    case "sales":
      return <SalesDeptReport />;
    case "production":
      return <ProductionDeptReport />;
    case "purchase":
      return <PurchaseDeptReport />;
    case "accounting":
      return <AccountingDeptReport />;
    default:
      return <Navigate to="/" replace />;
  }
}
