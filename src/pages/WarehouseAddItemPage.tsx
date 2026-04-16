import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, PackagePlus } from "lucide-react";
import { DeptPageFrame } from "../components/dept/DeptPageFrame";
import { useMnsConnection } from "../context/MnsConnectionContext";
import { WAREHOUSE_NAV_ITEMS, isWarehouseKind } from "../data/warehouseNav";
import { mnsFetch } from "../services/mnsApi";
import type { WarehouseKind } from "../types/orgSettings";

type CategoryRow = { id: number; name: string; parent_id: number | null };

const LABELS: Record<
  WarehouseKind,
  { th: string; en: string; hint: string }
> = {
  spare: {
    th: "เพิ่มอะไหล่ / สต็อกทั่วไป",
    en: "Add spare / general stock",
    hint: "บันทึกลงตาราง store_data ตามหมวดที่เลือก (ค่าเริ่มต้น 63 หากไม่ระบุ)",
  },
  production: {
    th: "เพิ่มสินค้าในคลังผลิต",
    en: "Add production warehouse item",
    hint: "หมวด PCB รอผลิต (71) — ใช้รหัสสินค้า (s_no) ไม่ซ้ำกับที่มีอยู่",
  },
  sales: {
    th: "เพิ่มสินค้าในคลังขาย",
    en: "Add sales warehouse item",
    hint: "หมวดพร้อมขาย (67)",
  },
};

export function WarehouseAddItemPage() {
  const { warehouseKind } = useParams<{ warehouseKind: string }>();
  const conn = useMnsConnection();
  const [loading, setLoading] = useState(false);
  const [cats, setCats] = useState<CategoryRow[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [partNo, setPartNo] = useState("");
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [qty, setQty] = useState("0");
  const [store, setStore] = useState("");
  const [locker, setLocker] = useState("");
  const [floor, setFloor] = useState("");
  const [box, setBox] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const kind = warehouseKind as WarehouseKind;
  const meta = useMemo(
    () => (isWarehouseKind(warehouseKind ?? "") ? LABELS[kind] : null),
    [warehouseKind, kind]
  );
  const navLabel = WAREHOUSE_NAV_ITEMS.find((w) => w.id === warehouseKind);

  useEffect(() => {
    if (!conn.ready || !conn.apiOk || !conn.db) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await mnsFetch<{ ok?: boolean; rows?: CategoryRow[] }>(
          `/store/categories?warehouse=${encodeURIComponent(warehouseKind ?? "spare")}`
        );
        if (cancelled || !res?.rows?.length) return;
        setCats(res.rows);
        setCategoryId(String(res.rows[0].id));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conn.ready, conn.apiOk, conn.db, warehouseKind]);

  if (!warehouseKind || !isWarehouseKind(warehouseKind) || !meta) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(null);
    if (!conn.apiOk || !conn.db) {
      setError("เชื่อมต่อ API / ฐานข้อมูลก่อน");
      return;
    }
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        warehouse: kind,
        partNo: partNo.trim(),
        name: name.trim(),
        model: model.trim(),
        qty: parseInt(qty, 10) || 0,
        store: store.trim(),
        locker: locker.trim(),
        floor: floor.trim(),
        box: box.trim(),
        info: info.trim(),
      };
      if (categoryId.trim() !== "") {
        const cid = parseInt(categoryId, 10);
        if (!Number.isNaN(cid) && cid > 0) body.categoryId = cid;
      }
      const res = await mnsFetch<{ ok?: boolean; message?: string }>("/store/items", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (res?.ok) {
        setDone(res.message ?? "บันทึกแล้ว");
        setPartNo("");
        setName("");
        setModel("");
        setQty("0");
        setStore("");
        setLocker("");
        setFloor("");
        setBox("");
        setInfo("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DeptPageFrame>
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <Link
            to={`/warehouse/${warehouseKind}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-violet-700 hover:text-violet-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            กลับ {navLabel?.labelTh ?? "คลัง"}
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <PackagePlus className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{meta.th}</h1>
              <p className="text-sm text-slate-500">{meta.en}</p>
              <p className="mt-1 text-xs text-slate-600">{meta.hint}</p>
            </div>
          </div>

          {!conn.ready || !conn.apiOk || !conn.db ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              เปิด API และเชื่อม MySQL ก่อน — ดู{" "}
              <code className="rounded bg-white px-1">server/.env</code> และ{" "}
              <code className="rounded bg-white px-1">database/IMPORT.txt</code>
            </p>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit}>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">หมวดหมู่</span>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {cats.length === 0 ? (
                    <option value="">ใช้หมวดเริ่มต้นตามประเภทคลัง (ฝั่งเซิร์ฟเวอร์)</option>
                  ) : (
                    cats.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  รหัสสินค้า / MNS Part No <span className="text-rose-600">*</span>
                </span>
                <input
                  value={partNo}
                  onChange={(e) => setPartNo(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  required
                  autoComplete="off"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  ชื่อ / รายละเอียดสั้น <span className="text-rose-600">*</span>
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">รุ่น / Model (s_model)</span>
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">จำนวน (s_num)</span>
                <input
                  type="number"
                  min={0}
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Store</span>
                  <input
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Locker</span>
                  <input
                    value={locker}
                    onChange={(e) => setLocker(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Floor</span>
                  <input
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">Box</span>
                  <input
                    value={box}
                    onChange={(e) => setBox(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">หมายเหตุ (info)</span>
                <textarea
                  value={info}
                  onChange={(e) => setInfo(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </label>

              {error && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                  {error}
                </p>
              )}
              {done && (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                  {done}
                </p>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "กำลังบันทึก…" : "บันทึกลง store_data"}
                </button>
                <Link
                  to={`/warehouse/${warehouseKind}`}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  ยกเลิก
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </DeptPageFrame>
  );
}
