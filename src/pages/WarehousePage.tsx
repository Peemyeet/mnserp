import { Link, Navigate, useParams } from "react-router-dom";
import { Settings } from "lucide-react";
import { ProductionWarehouseView } from "../components/warehouse/ProductionWarehouseView";
import { SalesWarehouseView } from "../components/warehouse/SalesWarehouseView";
import { SparePartsWarehouseView } from "../components/warehouse/SparePartsWarehouseView";
import { WAREHOUSE_NAV_ITEMS, isWarehouseKind } from "../data/warehouseNav";

export function WarehousePage() {
  const { warehouseKind } = useParams<{ warehouseKind: string }>();

  if (!warehouseKind || !isWarehouseKind(warehouseKind)) {
    return <Navigate to="/" replace />;
  }

  const meta = WAREHOUSE_NAV_ITEMS.find((w) => w.id === warehouseKind);

  return (
    <div className="min-h-full">
      {warehouseKind !== "sales" && (
        <div className="flex justify-end border-b border-slate-100 bg-white px-4 py-2 print:hidden">
          <Link
            to={`/settings/warehouses?tab=${warehouseKind}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-violet-300 hover:text-violet-800"
          >
            <Settings className="h-3.5 w-3.5" aria-hidden />
            ตั้งค่า{meta?.labelTh ?? ""} ({meta?.labelEn})
          </Link>
        </div>
      )}

      {warehouseKind === "spare" && <SparePartsWarehouseView />}
      {warehouseKind === "production" && <ProductionWarehouseView />}
      {warehouseKind === "sales" && <SalesWarehouseView />}
    </div>
  );
}
