import { useEffect, useState } from "react";
import type { ApprovalDocKind } from "../data/approvalCategories";

export type ApproveCountsState = {
  paymentSummary: number;
  prNoJob: number;
  leave: number;
  vehicle: number;
  auditPayment: number;
  createPo: number;
};

const ZERO: ApproveCountsState = {
  paymentSummary: 0,
  prNoJob: 0,
  leave: 0,
  vehicle: 0,
  auditPayment: 0,
  createPo: 0,
};

const POLL_MS = 45_000;

/** ดึงจำนวนรายการอนุมัติจาก GET /api/approve/counts */
export function useApproveCounts() {
  const [counts, setCounts] = useState<ApproveCountsState | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/approve/counts");
        const j = (await res.json()) as Partial<ApproveCountsState> & {
          ok?: boolean;
        };
        if (cancelled || !j?.ok) return;
        setCounts({
          paymentSummary: Number(j.paymentSummary) || 0,
          prNoJob: Number(j.prNoJob) || 0,
          leave: Number(j.leave) || 0,
          vehicle: Number(j.vehicle) || 0,
          auditPayment: Number(j.auditPayment) || 0,
          createPo: Number(j.createPo) || 0,
        });
      } catch {
        if (!cancelled) setCounts(ZERO);
      }
    }

    void load();
    const t = window.setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, []);

  return counts ?? ZERO;
}

export function countForApprovalKind(
  id: ApprovalDocKind,
  counts: ApproveCountsState,
): number {
  switch (id) {
    case "pr-no-job":
      return counts.prNoJob;
    case "leave":
      return counts.leave;
    case "vehicle":
      return counts.vehicle;
    case "audit-payment":
      return counts.auditPayment;
    case "create-po":
      return counts.createPo;
    default:
      return 0;
  }
}
