import { useEffect, useState } from "react";
import type { SparePartRow, StockPartRow } from "../data/warehouseInventorySeed";
import { useMnsConnection } from "../context/MnsConnectionContext";
import { mnsFetch } from "../services/mnsApi";
import type { WarehouseKind } from "../types/orgSettings";

type StoreItemsResponse = {
  ok?: boolean;
  warehouse?: string;
  spareParts?: SparePartRow[];
  stockParts?: StockPartRow[];
  message?: string;
};

export function useWarehouseStoreData(kind: WarehouseKind) {
  const conn = useMnsConnection();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromDb, setFromDb] = useState(false);
  const [spareRows, setSpareRows] = useState<SparePartRow[]>([]);
  const [stockRows, setStockRows] = useState<StockPartRow[]>([]);

  useEffect(() => {
    if (!conn.ready) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      if (!conn.apiOk || !conn.db) {
        setFromDb(false);
        setSpareRows([]);
        setStockRows([]);
        setLoading(false);
        return;
      }
      try {
        const res = await mnsFetch<StoreItemsResponse>(
          `/store/items?warehouse=${encodeURIComponent(kind)}&limit=800`
        );
        if (cancelled) return;
        if (res?.ok) {
          setFromDb(true);
          if (kind === "spare" && Array.isArray(res.spareParts)) {
            setSpareRows(res.spareParts);
            setStockRows([]);
          } else if (Array.isArray(res.stockParts)) {
            setStockRows(res.stockParts);
            setSpareRows([]);
          } else {
            setSpareRows([]);
            setStockRows([]);
          }
        } else {
          setFromDb(false);
          setSpareRows([]);
          setStockRows([]);
          setError(typeof res?.message === "string" ? res.message : "โหลดคลังไม่สำเร็จ");
        }
      } catch (e) {
        if (!cancelled) {
          setFromDb(false);
          setSpareRows([]);
          setStockRows([]);
          setError(e instanceof Error ? e.message : "โหลดคลังไม่สำเร็จ");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conn.ready, conn.apiOk, conn.db, kind]);

  if (kind === "spare") {
    return { loading, error, fromDb, spareRows, stockRows: [] as StockPartRow[] };
  }
  return { loading, error, fromDb, spareRows: [] as SparePartRow[], stockRows };
}
