import { Link, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { canAccessDepartment } from "../../auth/deptAccess";
import { useAuth } from "../../context/AuthContext";
import {
  getExpenseClaimApprovalStatus,
  loadExpenseClaims,
  type ExpenseClaimRecord,
} from "../../data/expenseClaimStorage";

function fmtBaht(n: number): string {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

function formatClaimDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function useExpenseClaimsLive(): ExpenseClaimRecord[] {
  const [claims, setClaims] = useState<ExpenseClaimRecord[]>(() =>
    typeof window !== "undefined" ? loadExpenseClaims() : [],
  );

  const refresh = useCallback(
    () => setClaims(typeof window !== "undefined" ? loadExpenseClaims() : []),
    [],
  );

  useEffect(() => {
    refresh();
    window.addEventListener("mns-expense-claims-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("mns-expense-claims-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return claims;
}

/** รายการสรุปใบขอเบิก — กดใบแล้วไปหน้าแก้ไขค่าใช้จ่าย */
export function AccountingExpenseClaimSummaryPage() {
  const { user } = useAuth();
  const claims = useExpenseClaimsLive();

  if (!user || !canAccessDepartment(user, "accounting")) {
    return <Navigate to="/forms/expense" replace />;
  }

  return (
    <div className="min-h-full bg-slate-100/80">
      <header className="border-b border-slate-200/80 bg-white px-6 py-4">
        <Link
          to="/dept/accounting"
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-indigo-700 no-underline hover:text-indigo-900"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับ — แผนกบัญชี
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">สรุปใบขอเบิก</h1>
          <p className="mt-1 text-sm text-slate-600">
            รายการขอเบิกที่ส่งเข้ามา — สถานะรออนุมัติ / อนุมัติแล้ว
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-xl p-6">
        {claims.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
            ยังไม่มีใบที่ส่ง — กรอกฟอร์มแล้วกดส่งจากเมนู{" "}
            <Link
              to="/forms/expense"
              className="font-medium text-indigo-600 no-underline hover:underline"
            >
              เอกสารขอเบิก
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {claims.map((c, i) => (
              <li key={c.id}>
                <Link
                  to={`/dept/accounting/expense-verify?claimId=${encodeURIComponent(c.id)}`}
                  className="block rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md ring-1 ring-slate-100/80 no-underline transition hover:border-indigo-200 hover:ring-indigo-100/80"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <h2 className="text-base font-bold text-slate-900">
                      ใบเลขที่ {i + 1}
                    </h2>
                    <time
                      dateTime={c.createdAt}
                      className="text-sm text-slate-500 tabular-nums"
                    >
                      {formatClaimDate(c.createdAt)}
                    </time>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {c.jobTitle.trim() || "ไม่ระบุชื่อ"} · {c.lines.length}{" "}
                    รายการ · รวม{" "}
                    <strong className="font-semibold text-slate-800 tabular-nums">
                      {fmtBaht(c.grandTotal)}
                    </strong>{" "}
                    บาท
                  </p>
                  <p className="mt-1 font-mono text-xs text-slate-400">
                    {c.jobNumber}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    {getExpenseClaimApprovalStatus(c) === "approved" ? (
                      <span className="inline-block rounded-2xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-md">
                        อนุมัติแล้ว
                      </span>
                    ) : (
                      <span className="inline-block rounded-2xl bg-rose-600 px-5 py-2 text-sm font-bold text-white shadow-md">
                        รออนุมัติ
                      </span>
                    )}
                    <span className="text-sm font-semibold text-indigo-600">
                      เปิดใบนี้ →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
