import { useCallback, useEffect, useState } from "react";
import {
  fetchPmUsers,
  getPm2021ApiBase,
  type PmUserRow,
} from "../services/pmUsersApi";

export type UseUsersState = {
  users: PmUserRow[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * ดึงรายการผู้ใช้จาก GET /api/v1/users/read.php (PHP บนโฮสต์ PM2021)
 * ตั้ง VITE_PM2021_API_BASE ถ้า endpoint ไม่ได้อยู่ที่โดเมนเริ่มต้น
 */
export function useUsers(apiBase?: string): UseUsersState {
  const base = apiBase ?? getPm2021ApiBase();
  const [users, setUsers] = useState<PmUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchPmUsers(base);
      setUsers(rows);
    } catch (e) {
      setUsers([]);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await fetchPmUsers(base);
        if (!cancelled) setUsers(rows);
      } catch (e) {
        if (!cancelled) {
          setUsers([]);
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [base]);

  return { users, loading, error, refetch };
}
