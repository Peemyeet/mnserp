export type DepartmentId = "sales" | "production" | "purchase" | "accounting";

export const DEPARTMENTS: {
  id: DepartmentId;
  labelTh: string;
  labelEn: string;
}[] = [
  { id: "sales", labelTh: "ฝ่ายขาย", labelEn: "Sales" },
  { id: "production", labelTh: "ฝ่ายผลิต", labelEn: "Production" },
  { id: "purchase", labelTh: "ฝ่ายจัดซื้อ", labelEn: "Purchase" },
  { id: "accounting", labelTh: "แผนกบัญชี", labelEn: "Accounting" },
];

export function getDepartment(id: string): (typeof DEPARTMENTS)[number] | undefined {
  return DEPARTMENTS.find((d) => d.id === id);
}
