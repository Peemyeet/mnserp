import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { canAccessDepartment } from "../auth/deptAccess";
import { useAuth } from "../context/AuthContext";
import {
  approveExpenseClaim,
  getExpenseClaimApprovalStatus,
  getExpenseClaimById,
  type ExpenseClaimRecord,
} from "../data/expenseClaimStorage";

function fmtBaht(n: number): string {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

function formatClaimDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function useLiveClaim(id: string | undefined): ExpenseClaimRecord | undefined {
  const [claim, setClaim] = useState<ExpenseClaimRecord | undefined>(() =>
    id ? getExpenseClaimById(id) : undefined,
  );
  const refresh = useCallback(() => {
    setClaim(id ? getExpenseClaimById(id) : undefined);
  }, [id]);

  useEffect(() => {
    refresh();
    window.addEventListener("mns-expense-claims-changed", refresh);
    return () =>
      window.removeEventListener("mns-expense-claims-changed", refresh);
  }, [refresh]);

  return claim;
}

export function ExpenseClaimSubmissionDetailPage() {
  const { user } = useAuth();
  const { claimId = "" } = useParams<{ claimId: string }>();
  const id = decodeURIComponent(claimId);
  const claim = useLiveClaim(id || undefined);

  const isAccounting =
    user != null && canAccessDepartment(user, "accounting");
  const listOrFormFallback = isAccounting
    ? "/forms/expense/submissions"
    : "/forms/expense";

  if (!id) {
    return <Navigate to={listOrFormFallback} replace />;
  }
  if (!claim) {
    return <Navigate to={listOrFormFallback} replace />;
  }

  const approval = getExpenseClaimApprovalStatus(claim);
  const backTo = isAccounting
    ? "/dept/accounting/expense-claim-lines"
    : "/forms/expense";
  const backLabel = isAccounting
    ? "กลับ — คำขอเบิกจากฟอร์ม"
    : "กลับ — เอกสารขอเบิก";

  const handleApprove = () => {
    approveExpenseClaim(claim.id);
  };

  return (
    <div className="min-h-full bg-slate-100/80">
      <header className="border-b border-slate-200/80 bg-white px-6 py-4">
        <Link
          to={backTo}
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-indigo-700 no-underline hover:text-indigo-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">รายละเอียดใบขอเบิก</h1>
            <p className="mt-1 font-mono text-sm text-indigo-800">{claim.jobNumber}</p>
          </div>
          {approval === "approved" ? (
            <span className="shrink-0 rounded-2xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-md">
              อนุมัติแล้ว
            </span>
          ) : (
            <span className="shrink-0 rounded-2xl bg-rose-600 px-5 py-2 text-sm font-bold text-white shadow-md">
              รออนุมัติ
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-slate-500">
          ส่งเมื่อ {formatClaimDate(claim.createdAt)}
        </p>
      </header>

      <div className="mx-auto max-w-2xl p-6">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              ชื่องานที่เบิก
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {claim.jobTitle.trim() || "ไม่ระบุชื่อ"}
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              รายการสินค้า
            </p>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">
                      สินค้า
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-600">
                      ราคา
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-600">
                      จำนวน
                    </th>
                    <th className="px-3 py-2 text-right font-semibold text-slate-600">
                      รวม
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {claim.lines.map((line, idx) => {
                    const rowSum = line.unitPrice * line.quantity;
                    return (
                      <tr
                        key={line.lineId}
                        className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                      >
                        <td className="border-b border-slate-100 px-3 py-2 text-slate-800">
                          {line.productName.trim() || "—"}
                        </td>
                        <td className="border-b border-slate-100 px-3 py-2 text-right tabular-nums text-slate-700">
                          {fmtBaht(line.unitPrice)}
                        </td>
                        <td className="border-b border-slate-100 px-3 py-2 text-right tabular-nums text-slate-700">
                          {line.quantity}
                        </td>
                        <td className="border-b border-slate-100 px-3 py-2 text-right font-medium tabular-nums text-slate-900">
                          {fmtBaht(rowSum)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <p className="text-lg font-bold text-slate-900">
              รวม {fmtBaht(claim.grandTotal)} บาท
            </p>
          </div>

          {isAccounting ? (
            <div className="rounded-xl border border-violet-200 bg-violet-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-900">
                แผนกบัญชีเท่านั้น
              </p>
              <p className="mt-1 text-sm text-violet-950/90">
                ตรวจสอบไฟล์แนบและรายการสินค้า จากนั้นกดอนุมัติเมื่อครบถ้วน
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/dept/accounting/expense-claim-lines"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-violet-500 bg-white px-5 py-2.5 text-sm font-semibold text-violet-800 no-underline shadow-sm transition hover:bg-violet-50"
                >
                  ตรวจสอบเอกสาร
                </Link>
                {approval === "pending" ? (
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
                  >
                    อนุมัติ
                  </button>
                ) : (
                  <span className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-800">
                    อนุมัติใบนี้แล้ว
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              แผนกบัญชีตรวจและแก้ชื่อสินค้าได้ที่{" "}
              <Link
                to="/dept/accounting/expense-claim-lines"
                className="font-medium text-indigo-600 no-underline hover:underline"
              >
                คำขอเบิกจากฟอร์ม
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
