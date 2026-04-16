import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { canAccessDepartment } from "../../auth/deptAccess";
import { useAuth } from "../../context/AuthContext";
import {
  getExpenseClaimById,
  type ExpenseClaimRecord,
} from "../../data/expenseClaimStorage";
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
};

function emptyLine(id: string): ExpenseLine {
  return {
    id,
    account: "",
    detail: "",
    unitPrice: "",
    qty: "",
    unit: "บาท",
    discount: "0",
  };
}

function claimToLines(claim: ExpenseClaimRecord): ExpenseLine[] {
  if (claim.lines.length === 0) {
    return [emptyLine("1")];
  }
  return claim.lines.map((l) => ({
    id: l.lineId,
    account: "",
    detail: l.productName,
    unitPrice: String(l.unitPrice),
    qty: String(l.quantity),
    unit: "บาท",
    discount: "0",
  }));
}

/** หน้าแก้ไขค่าใช้จ่าย (มีผังบัญชี) — จากสรุปใบขอเบิกส่ง claimId */
export function AccountingExpenseVerifyFormPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const claimId = searchParams.get("claimId")?.trim() ?? "";

  const claim = useMemo(
    () => (claimId ? getExpenseClaimById(claimId) : undefined),
    [claimId],
  );

  const [lines, setLines] = useState<ExpenseLine[]>(() => [
    emptyLine("1"),
  ]);
  const [includeVat, setIncludeVat] = useState(true);

  useEffect(() => {
    if (claim) {
      setLines(claimToLines(claim));
    } else if (!claimId) {
      setLines([emptyLine("1")]);
    }
  }, [claim, claimId]);

  const updateLine = useCallback((id: string, patch: Partial<ExpenseLine>) => {
    setLines((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }, []);

  const addLine = () => {
    setLines((prev) => [...prev, emptyLine(`n-${Date.now()}`)]);
  };

  const discountTotal = useMemo(
    () =>
      lines.reduce((sum, row) => {
        const d = Number(row.discount || 0);
        return sum + (Number.isFinite(d) ? d : 0);
      }, 0),
    [lines],
  );

  const subtotal = useMemo(
    () =>
      lines.reduce((sum, row) => {
        const unitPrice = Number(row.unitPrice || 0);
        const qty = Number(row.qty || 0);
        const discount = Number(row.discount || 0);
        const base = (Number.isFinite(unitPrice) ? unitPrice : 0) * (Number.isFinite(qty) ? qty : 0);
        const line = Math.max(0, base - (Number.isFinite(discount) ? discount : 0));
        return sum + line;
      }, 0),
    [lines],
  );

  const vatAmount = includeVat ? subtotal * 0.07 : 0;
  const grandTotal = subtotal + vatAmount;

  if (!user || !canAccessDepartment(user, "accounting")) {
    return <Navigate to="/forms/expense" replace />;
  }

  if (claimId && !claim) {
    return (
      <Navigate to="/dept/accounting/expense-claim-summary" replace />
    );
  }

  const isEdit = Boolean(claim);
  const backTo = isEdit
    ? "/dept/accounting/expense-claim-summary"
    : "/dept/accounting";
  const titleTh = isEdit ? "แก้ไขค่าใช้จ่าย" : "ค่าใช้จ่าย";
  const titleEn = isEdit ? "Edit expense" : "Expenses";

  return (
    <DeptPageFrame>
      <DeptSubPageHeader
        backTo={backTo}
        backLabel={isEdit ? "สรุปใบขอเบิก" : "แผนกบัญชี"}
        titleTh={titleTh}
        titleEn={titleEn}
      />

      {isEdit && claim ? (
        <p className="mt-2 text-sm text-slate-600">
          อ้างอิงใบขอเบิก:{" "}
          <span className="font-mono text-slate-800">{claim.jobNumber}</span> ·{" "}
          {claim.jobTitle.trim() || "ไม่ระบุชื่อ"}
        </p>
      ) : null}

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
                <option>หจก. เจอาร์ เอนจิเนียริ่ง (0 วัน)</option>
              </select>
            </Field>
            <Field label="ชื่อบริษัท">
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option>บริษัท มณีสถิตย์ กรุ๊ป จำกัด</option>
              </select>
            </Field>
            <Field label="วันที่">
              <input
                type="text"
                defaultValue="08/04/2026"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="ครบกำหนด">
              <input
                type="text"
                defaultValue="08/04/2026"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </Field>
            <Field label="ชื่อโปรเจค">
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                defaultValue={claim?.jobTitle || "งบสาธารณูปโภค"}
              >
                <option value={claim?.jobTitle || "งบสาธารณูปโภค"}>
                  {claim?.jobTitle || "งบสาธารณูปโภค"}
                </option>
              </select>
            </Field>
          </div>

          <div className="space-y-2 pt-1">
            <RadioLine label="จ่ายร้านค้า" defaultChecked />
            <div className="pl-7">
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option>เลือกรายการ</option>
              </select>
            </div>
            <RadioLine label="รายการเบิกคืนกรรมการ" />
            <div className="pl-7">
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option>เลือกกรรมการ</option>
              </select>
            </div>
            <RadioLine label="งบเงินสดย่อย" />
            <div className="pl-7">
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option>เลือกพนักงาน</option>
              </select>
            </div>
            <RadioLine label="รายการเบิกคืนพนักงาน" />
            <div className="pl-7">
              <select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <option>เลือกพนักงาน</option>
              </select>
            </div>
            <RadioLine label="รายการเบิกคืนระหว่างบริษัท" />
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[820px] border-collapse text-sm">
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
                    <select
                      value={r.account}
                      onChange={(e) =>
                        updateLine(r.id, { account: e.target.value })
                      }
                      className="w-full min-w-[10rem] rounded border border-slate-200 px-2 py-1.5"
                    >
                      <option value="">เลือกผังบัญชี</option>
                      <option value="ค่าไฟฟ้า">ค่าไฟฟ้า</option>
                      <option value="ค่าน้ำประปา">ค่าน้ำประปา</option>
                      <option value="ค่าเดินทาง">ค่าเดินทาง</option>
                    </select>
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <input
                      value={r.detail}
                      onChange={(e) =>
                        updateLine(r.id, { detail: e.target.value })
                      }
                      className="w-full min-w-[8rem] rounded border border-slate-200 px-2 py-1.5"
                    />
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <input
                      type="number"
                      value={r.unitPrice}
                      onChange={(e) =>
                        updateLine(r.id, { unitPrice: e.target.value })
                      }
                      className="w-full rounded border border-slate-200 px-2 py-1.5"
                    />
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <input
                      type="number"
                      value={r.qty}
                      onChange={(e) =>
                        updateLine(r.id, { qty: e.target.value })
                      }
                      className="w-full rounded border border-slate-200 px-2 py-1.5"
                    />
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <input
                      value={r.unit}
                      onChange={(e) =>
                        updateLine(r.id, { unit: e.target.value })
                      }
                      className="w-full rounded border border-slate-200 px-2 py-1.5"
                    />
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <input
                      type="number"
                      value={r.discount}
                      onChange={(e) =>
                        updateLine(r.id, { discount: e.target.value })
                      }
                      className="w-full rounded border border-slate-200 px-2 py-1.5"
                    />
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <input
                      readOnly
                      value={(
                        Math.max(
                          0,
                          Number(r.unitPrice || 0) * Number(r.qty || 0) - Number(r.discount || 0),
                        ) || 0
                      ).toFixed(2)}
                      className="w-full rounded border border-slate-100 bg-slate-50 px-2 py-1.5 text-slate-500"
                    />
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
            className="rounded-xl bg-teal-500 px-4 py-2 text-xl font-bold leading-none text-white shadow-sm hover:bg-teal-600"
            aria-label="เพิ่มแถว"
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
            <Link
              to={backTo}
              className="inline-block rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-amber-600"
            >
              ย้อนกลับ
            </Link>
          </div>
          <div className="min-w-[220px] space-y-1 text-sm text-slate-700">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" />
              หัก ณ ที่จ่าย
            </label>
            <p>รวม : {subtotal.toFixed(2)}</p>
            <p>VAT : {vatAmount.toFixed(2)}</p>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeVat}
                onChange={(e) => setIncludeVat(e.target.checked)}
              />
              VAT
            </label>
            <p>ส่วนลด : {discountTotal.toFixed(2)}</p>
            <p>รวมทั้งสิ้น : {grandTotal.toFixed(2)}</p>
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

function RadioLine({
  label,
  defaultChecked,
}: {
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-700">
      <input type="radio" name="expense-kind" defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}
