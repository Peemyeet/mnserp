export type ExpenseClaimLineStored = {
  lineId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
};

export type ExpenseClaimApprovalStatus = "pending" | "approved";

export type ExpenseClaimRecord = {
  id: string;
  createdAt: string;
  jobTitle: string;
  jobNumber: string;
  lines: ExpenseClaimLineStored[];
  grandTotal: number;
  /** อนุมัติโดยแผนกบัญชี — ไม่มีฟิลด์ = รออนุมัติ */
  approvalStatus?: ExpenseClaimApprovalStatus;
};

export function getExpenseClaimApprovalStatus(
  c: ExpenseClaimRecord,
): ExpenseClaimApprovalStatus {
  return c.approvalStatus === "approved" ? "approved" : "pending";
}

const STORAGE_KEY = "mns_expense_claims_v1";

function notifyClaimsChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("mns-expense-claims-changed"));
}

export function loadExpenseClaims(): ExpenseClaimRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ExpenseClaimRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveExpenseClaims(claims: ExpenseClaimRecord[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
}

function totalFromLines(lines: ExpenseClaimLineStored[]): number {
  let s = 0;
  for (const l of lines) {
    const p = Number.isFinite(l.unitPrice) ? l.unitPrice : 0;
    const q = Number.isFinite(l.quantity) ? l.quantity : 0;
    s += p * q;
  }
  return Math.round(s * 100) / 100;
}

export function addExpenseClaim(payload: {
  jobTitle: string;
  jobNumber: string;
  lines: ExpenseClaimLineStored[];
}): ExpenseClaimRecord {
  const claims = loadExpenseClaims();
  const rec: ExpenseClaimRecord = {
    id: `CLM-${Date.now()}`,
    createdAt: new Date().toISOString(),
    jobTitle: payload.jobTitle.trim(),
    jobNumber: payload.jobNumber.trim(),
    lines: payload.lines.map((l) => ({ ...l })),
    grandTotal: totalFromLines(payload.lines),
  };
  claims.unshift(rec);
  saveExpenseClaims(claims);
  notifyClaimsChanged();
  return rec;
}

/** แผนกบัญชีแก้ชื่อสินค้าตามแถว — อัปเดตยอดรวมอัตโนมัติ */
export function updateExpenseClaimLineProductName(
  claimId: string,
  lineId: string,
  productName: string,
): void {
  const claims = loadExpenseClaims();
  const c = claims.find((x) => x.id === claimId);
  if (!c) return;
  const line = c.lines.find((l) => l.lineId === lineId);
  if (!line) return;
  line.productName = productName.trim();
  c.grandTotal = totalFromLines(c.lines);
  saveExpenseClaims(claims);
  notifyClaimsChanged();
}

export function getExpenseClaimById(id: string): ExpenseClaimRecord | undefined {
  return loadExpenseClaims().find((c) => c.id === id);
}

/** อนุมัติใบขอเบิก (เรียกจาก UI แผนกบัญชีเท่านั้น — ตรวจสิทธิ์ที่หน้า) */
export function approveExpenseClaim(claimId: string): boolean {
  const claims = loadExpenseClaims();
  const c = claims.find((x) => x.id === claimId);
  if (!c) return false;
  if (getExpenseClaimApprovalStatus(c) === "approved") return false;
  c.approvalStatus = "approved";
  saveExpenseClaims(claims);
  notifyClaimsChanged();
  return true;
}
