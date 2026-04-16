import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptSubPageHeader } from "../../components/dept/DeptSubPageHeader";
import {
  getExpenseClaimApprovalStatus,
  loadExpenseClaims,
  updateExpenseClaimLineProductName,
  type ExpenseClaimRecord,
} from "../../data/expenseClaimStorage";

function fmtBaht(n: number): string {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

function ProductNameEditor({
  claimId,
  lineId,
  name,
  onSaved,
}: {
  claimId: string;
  lineId: string;
  name: string;
  onSaved: () => void;
}) {
  const [value, setValue] = useState(name);

  useEffect(() => {
    setValue(name);
  }, [name, lineId, claimId]);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        const t = value.trim();
        if (t !== name.trim()) {
          updateExpenseClaimLineProductName(claimId, lineId, t);
          onSaved();
        }
      }}
      className="w-full min-w-[12rem] rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/25"
      aria-label="แก้ไขชื่อสินค้า (บัญชี)"
    />
  );
}

export function AccountingExpenseClaimLinesPage() {
  const [claims, setClaims] = useState<ExpenseClaimRecord[]>([]);
  const refresh = useCallback(() => setClaims(loadExpenseClaims()), []);

  useEffect(() => {
    refresh();
    window.addEventListener("mns-expense-claims-changed", refresh);
    return () =>
      window.removeEventListener("mns-expense-claims-changed", refresh);
  }, [refresh]);

  return (
    <DeptPageFrame>
      <DeptSubPageHeader
        backTo="/dept/accounting"
        backLabel="แผนกบัญชี"
        titleTh="คำขอเบิกจากฟอร์ม — แก้ไขชื่อสินค้า"
        titleEn="Expense claims · product lines"
        titleThClassName="text-xl font-bold tracking-tight text-violet-800 sm:text-2xl"
      />

      <p className="mt-2 text-sm text-slate-600">
        ข้อมูลมาจากการส่งฟอร์ม «เอกสารขอเบิก» —
        พนักงานพิมพ์ชื่อสินค้าได้เอง แผนกบัญชีปรับชื่อให้ตรงบันทึกได้ที่คอลัมน์สินค้า
        (บันทึกเมื่อคลิกออกจากช่อง)
      </p>

      {claims.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center text-sm text-slate-500">
          ยังไม่มีคำขอในคราวนี้ — เมื่อมีผู้ใช้ส่งจากหน้าเอกสารขอเบิก รายการจะแสดงที่นี่
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {claims.map((c) => (
            <article
              key={c.id}
              className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                <div>
                  <p className="font-mono text-sm font-bold text-violet-800">
                    {c.jobNumber}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-slate-800">
                    {c.jobTitle || "—"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    รหัสคำขอ {c.id} · ส่ง{" "}
                    {new Date(c.createdAt).toLocaleString("th-TH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <Link
                    to={`/forms/expense/submissions/${encodeURIComponent(c.id)}`}
                    className="mb-2 inline-block text-sm font-semibold text-violet-700 no-underline hover:underline"
                  >
                    รายละเอียด / อนุมัติ →
                  </Link>
                  <p>
                    <span className="text-xs text-slate-500">รวม</span>
                    <span className="ml-1 text-lg font-bold tabular-nums text-slate-900">
                      {fmtBaht(c.grandTotal)} บาท
                    </span>
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-600">
                    {getExpenseClaimApprovalStatus(c) === "approved"
                      ? "สถานะ: อนุมัติแล้ว"
                      : "สถานะ: รออนุมัติ"}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-white">
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600">
                        ลำดับ
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600">
                        สินค้า (แก้ไขได้)
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600">
                        ราคา/หน่วย
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600">
                        จำนวน
                      </th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600">
                        รวมแถว
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.lines.map((line, idx) => {
                      const rowSum =
                        Math.round(line.unitPrice * line.quantity * 100) / 100;
                      return (
                        <tr
                          key={line.lineId}
                          className={
                            idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                          }
                        >
                          <td className="border-b border-slate-100 px-3 py-2.5 tabular-nums text-slate-700">
                            {idx + 1}
                          </td>
                          <td className="border-b border-slate-100 px-3 py-2">
                            <ProductNameEditor
                              claimId={c.id}
                              lineId={line.lineId}
                              name={line.productName}
                              onSaved={refresh}
                            />
                          </td>
                          <td className="border-b border-slate-100 px-3 py-2.5 text-right tabular-nums text-slate-800">
                            {fmtBaht(line.unitPrice)}
                          </td>
                          <td className="border-b border-slate-100 px-3 py-2.5 text-right tabular-nums text-slate-800">
                            {line.quantity}
                          </td>
                          <td className="border-b border-slate-100 px-3 py-2.5 text-right font-medium tabular-nums text-slate-900">
                            {fmtBaht(rowSum)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      )}
    </DeptPageFrame>
  );
}
