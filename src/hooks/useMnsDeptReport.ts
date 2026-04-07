import { useEffect, useState } from "react";
import { useMnsConnection } from "../context/MnsConnectionContext";
import { mnsFetch } from "../services/mnsApi";
import type {
  AccountingReportPayload,
  ProductionReportPayload,
  PurchaseReportPayload,
  SalesReportPayload,
} from "../types/mnsReports";

type Dept = "sales" | "production" | "purchase" | "accounting";

export type SalesReportQuery = {
  username?: string;
  period?: string;
  year?: number;
  filterUserId?: number | null;
};

export function useMnsDeptReport(
  dept: Dept,
  opts?: SalesReportQuery
) {
  const conn = useMnsConnection();
  const [loading, setLoading] = useState(true);
  const [fromDb, setFromDb] = useState(false);
  const [data, setData] = useState<
    | SalesReportPayload
    | ProductionReportPayload
    | PurchaseReportPayload
    | AccountingReportPayload
    | null
  >(null);

  useEffect(() => {
    if (!conn.ready) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (!conn.apiOk || !conn.db || cancelled) {
          setData(null);
          setFromDb(false);
          return;
        }
        let path = `/reports/${dept}`;
        if (dept === "sales") {
          const params = new URLSearchParams();
          if (opts?.username) params.set("username", opts.username);
          if (opts?.period) params.set("period", opts.period);
          if (opts?.year != null) params.set("year", String(opts.year));
          if (opts?.filterUserId != null && opts.filterUserId > 0) {
            params.set("filterUserId", String(opts.filterUserId));
          }
          const qs = params.toString();
          if (qs) path += `?${qs}`;
        }
        const res = await mnsFetch<
          | SalesReportPayload
          | ProductionReportPayload
          | PurchaseReportPayload
          | AccountingReportPayload
        >(path);
        if (cancelled) return;
        if (res && typeof res === "object" && "ok" in res && res.ok) {
          setData(res);
          setFromDb(true);
        } else {
          setData(null);
          setFromDb(false);
        }
      } catch {
        if (!cancelled) {
          setData(null);
          setFromDb(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    conn.ready,
    conn.apiOk,
    conn.db,
    dept,
    opts?.username,
    opts?.period,
    opts?.year,
    opts?.filterUserId,
  ]);

  return { loading, fromDb, data };
}
