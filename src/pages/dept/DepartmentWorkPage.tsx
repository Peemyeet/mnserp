import { Navigate, useParams } from "react-router-dom";
import { AccountingDeptWork } from "./AccountingDeptWork";

const WORK_DEPT_IDS = ["accounting"] as const;
type WorkDeptId = (typeof WORK_DEPT_IDS)[number];

export function DepartmentWorkPage() {
  const { deptId } = useParams<{ deptId: string }>();
  if (!deptId || !WORK_DEPT_IDS.includes(deptId as WorkDeptId)) {
    return <Navigate to="/" replace />;
  }

  switch (deptId as WorkDeptId) {
    case "accounting":
      return <AccountingDeptWork />;
    default:
      return <Navigate to="/" replace />;
  }
}
