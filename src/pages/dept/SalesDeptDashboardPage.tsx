import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptPageHeader } from "../../components/dept/DeptPageHeader";
import { SalesMyWorkDashboard } from "../../components/dept/SalesMyWorkDashboard";

/** หน้าแรกฝ่ายขาย — แดชบอร์ดส่วนตัว (KPI / งานค้าง / งานที่ต้องทำ) */
export function SalesDeptDashboardPage() {
  return (
    <DeptPageFrame>
      <DeptPageHeader
        deptId="sales"
        titleTh="แดชบอร์ด — ฝ่ายขาย"
        titleEn="Sales dashboard"
        dashboardPath="/dept/sales/dashboard"
        workPath="/dept/sales/work"
        reportPath="/dept/sales/report"
      />
      <SalesMyWorkDashboard />
    </DeptPageFrame>
  );
}
