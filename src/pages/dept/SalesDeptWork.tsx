import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptPageHeader } from "../../components/dept/DeptPageHeader";
import {
  SalesDeptDashboard,
  SalesDeptHeaderActions,
} from "../../components/dept/SalesDeptDashboard";

/** หน้าทำงานฝ่ายขาย — การ์ดสถานะแผนกและทางลัดงาน */
export function SalesDeptWork() {
  return (
    <DeptPageFrame>
      <DeptPageHeader
        deptId="sales"
        titleTh="ทำงาน — แผนกขาย"
        titleEn="Sales — work"
        dashboardPath="/dept/sales/dashboard"
        workPath="/dept/sales/work"
        reportPath="/dept/sales/report"
        extraAction={<SalesDeptHeaderActions />}
      />
      <section>
        <h2 className="mb-1 text-base font-bold text-slate-900">
          ภาพรวมสถานะแผนก
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          สรุปจำนวนงานตามขั้น — เปิดแดชบอร์ดเพื่อดู KPI และงานส่วนตัว
        </p>
        <SalesDeptDashboard />
      </section>
    </DeptPageFrame>
  );
}
