import { useState } from "react";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptSubPageHeader } from "../../components/dept/DeptSubPageHeader";

type ExpenseLine = {
  id: string;
  account: string;
  detail: string;
  unitPrice: string;
  qty: string;
  unit: string;
  discount: string;
  total: string;
  vat: string;
};

export function AccountingAddCreditorPage() {
  const [lines, setLines] = useState<ExpenseLine[]>([
    {
      id: "1",
      account: "",
      detail: "",
      unitPrice: "",
      qty: "",
      unit: "",
      discount: "",
      total: "",
      vat: "",
    },
  ]);

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: String(prev.length + 1),
        account: "",
        detail: "",
        unitPrice: "",
        qty: "",
        unit: "",
        discount: "",
        total: "",
        vat: "",
      },
    ]);
  };

  return (
    <DeptPageFrame>
      <DeptSubPageHeader
        backTo="/dept/accounting"
        backLabel="แผนกบัญชี"
        titleTh="ค่าใช้จ่าย"
        titleEn="Expenses"
      />

      <div className="mt-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <Field label="ปี">
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option>2569</option>
              </select>
            </Field>
            <Field label="ชื่อลูกค้า">
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option>หจก. เออาร์ เอนจิเนียริ่ง (3 วัน)</option>
              </select>
            </Field>
            <Field label="ชื่อบริษัท">
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option>บริษัท มณีฐฐรี กรุ๊ป จำกัด</option>
              </select>
            </Field>
            <Field label="วันที่">
              <input
                value="07/04/2026"
                readOnly
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="ครบกำหนด">
              <input
                value="07/04/2026"
                readOnly
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="ชื่อโปรเจค">
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option>งบสาธารณูปโภค</option>
              </select>
            </Field>
          </div>

          <div className="space-y-2 pt-1">
            <RadioLine label="จ่ายร้านค้า" checked />
            <div className="pl-7">
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option>เลือกรายการ</option>
              </select>
            </div>
            <RadioLine label="รายการเบิกกับกรรมการ" />
            <div className="pl-7">
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option>เลือกพนักงาน</option>
              </select>
            </div>
            <RadioLine label="งบโบนัสลอย" />
            <div className="pl-7">
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option>เลือกพนักงาน</option>
              </select>
            </div>
            <RadioLine label="รายการเบิกกับพนักงาน" />
            <RadioLine label="รายการเบิกระหว่างบริษัท" />
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50">
                {[
                  "ลำดับ",
                  "ผังบัญชี",
                  "รายละเอียด",
                  "ราคาต่อหน่วย",
                  "จำนวน",
                  "หน่วย",
                  "ส่วนลด",
                  "ราคารวม",
                  "vat%",
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.map((r, idx) => (
                <tr key={r.id}>
                  <td className="border-b border-slate-100 px-3 py-2">{idx + 1}</td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <input className="w-full rounded border border-slate-200 px-2 py-1.5" />
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <input className="w-full rounded border border-slate-200 px-2 py-1.5" />
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <input className="w-full rounded border border-slate-200 px-2 py-1.5" />
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <input className="w-full rounded border border-slate-200 px-2 py-1.5" />
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <input className="w-full rounded border border-slate-200 px-2 py-1.5" />
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <input className="w-full rounded border border-slate-200 px-2 py-1.5" />
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <input className="w-full rounded border border-slate-200 px-2 py-1.5" />
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <input className="w-full rounded border border-slate-200 px-2 py-1.5" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={addLine}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-xl font-bold text-white hover:bg-cyan-600"
          >
            +
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">หมายเหตุ</span>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">แนบไฟล์</span>
              <input type="file" className="text-sm" />
            </label>
            <button
              type="button"
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
            >
              ย้อนกลับ
            </button>
          </div>
          <div className="min-w-[220px] space-y-1 text-sm text-slate-700">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" />
              หัก ณ ที่จ่าย
            </label>
            <p>รวม :</p>
            <p>VAT :</p>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" />
              VAT
            </label>
            <p>ส่วนลด :</p>
            <p>รวมทั้งสิ้น :</p>
            <button
              type="button"
              className="mt-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              สร้าง
            </button>
          </div>
        </div>
      </div>
    </DeptPageFrame>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function RadioLine({ label, checked }: { label: string; checked?: boolean }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
      <input type="radio" checked={checked} readOnly />
      {label}
    </label>
  );
}
