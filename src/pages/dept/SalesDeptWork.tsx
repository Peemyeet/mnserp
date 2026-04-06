import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptPageHeader } from "../../components/dept/DeptPageHeader";
import {
  SalesDeptDashboard,
  SalesDeptHeaderActions,
} from "../../components/dept/SalesDeptDashboard";

export function SalesDeptWork() {
  return (
    <DeptPageFrame>
      <DeptPageHeader
        deptId="sales"
        titleTh="แผนกขาย"
        titleEn="Sale Department"
        workPath="/dept/sales/work"
        reportPath="/dept/sales/report"
        extraAction={<SalesDeptHeaderActions />}
      />
      <SalesDeptDashboard />
    </DeptPageFrame>
  );
}
