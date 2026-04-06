import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptPageHeader } from "../../components/dept/DeptPageHeader";
import { ChartCardShell } from "../../components/dept/ChartCardShell";

const trend = [
  { x: "W1", v: 12 },
  { x: "W2", v: 18 },
  { x: "W3", v: 15 },
  { x: "W4", v: 22 },
  { x: "W5", v: 20 },
  { x: "W6", v: 28 },
];

export function PurchaseDeptReport() {
  return (
    <DeptPageFrame>
      <DeptPageHeader
        deptId="purchase"
        titleTh="รีพอร์ต — ฝ่ายจัดซื้อ"
        titleEn="Purchase report"
        workPath="/dept/purchase/work"
        reportPath="/dept/purchase/report"
      />
      <ChartCardShell title="แนวโน้มการสั่งซื้อ (ตัวอย่าง)">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="v"
                name="จำนวน PO"
                stroke="#7c3aed"
                fill="#c4b5fd"
                fillOpacity={0.5}
              />
            </AreaChart>
          </ResponsiveContainer>
      </ChartCardShell>
    </DeptPageFrame>
  );
}
