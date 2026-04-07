import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { JobSheetCompanyGate } from "../../components/dept/JobSheetCompanyGate";
import { DeptPageFrame } from "../../components/dept/DeptPageFrame";
import { DeptPageHeader } from "../../components/dept/DeptPageHeader";
import { MNS_COMPANY_OPTIONS, mnsCompanyLabel } from "../../data/mnsCompanies";
import { useMnsConnection } from "../../context/MnsConnectionContext";
import { mnsFetch } from "../../services/mnsApi";
import { isSalesDeptUser } from "../../utils/salesDeptUsers";

function CompanyValidationModal({
  open,
  draftKey,
  onDraftChange,
  onConfirm,
  onClose,
}: {
  open: boolean;
  draftKey: string;
  onDraftChange: (k: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="company-val-title"
    >
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-slate-100 shadow-xl">
        <h2
          id="company-val-title"
          className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800"
        >
          Select field validation
        </h2>
        <div className="p-4">
          <label className="sr-only" htmlFor="company-select-val">
            เลือกบริษัท
          </label>
          <select
            id="company-select-val"
            value={draftKey}
            onChange={(e) => onDraftChange(e.target.value)}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="">เลือกบริษัท</option>
            {MNS_COMPANY_OPTIONS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SalesSaleJobSheetPage() {
  const navigate = useNavigate();
  const conn = useMnsConnection();
  const provisionalRef = useMemo(
    () =>
      `MG${Date.now().toString(36).toUpperCase().slice(-4)}${Math.floor(Math.random() * 900 + 100)}`,
    []
  );

  const [companyGateOpen, setCompanyGateOpen] = useState(true);
  const [companyKey, setCompanyKey] = useState("");
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [companyDraft, setCompanyDraft] = useState("");

  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState<
    { cus_id: number; cus_name: string }[]
  >([]);

  const [saleId, setSaleId] = useState<number | null>(null);
  const [salesOptions, setSalesOptions] = useState<
    { user_id: number; label: string }[]
  >([]);

  const [productName, setProductName] = useState("");
  const [model, setModel] = useState("");
  const [brand, setBrand] = useState("");
  const [sn, setSn] = useState("");
  const [qty, setQty] = useState(1);
  const [sendDate, setSendDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadLists = useCallback(async () => {
    if (!conn.ready || !conn.apiOk || !conn.db) return;
    try {
      const [uRes, cRes] = await Promise.all([
        mnsFetch<{
          ok?: boolean;
          rows?: {
            user_id: number;
            fname: string;
            lname: string;
            user_gid?: number;
            group_name?: string;
          }[];
        }>("/users"),
        mnsFetch<{
          ok?: boolean;
          rows?: { cus_id: number; cus_name: string }[];
        }>("/customers?limit=600"),
      ]);
      const sRows = (uRes.rows ?? []).filter(isSalesDeptUser);
      setSalesOptions(
        sRows.map((r) => ({
          user_id: r.user_id,
          label:
            `${String(r.fname ?? "").trim()} ${String(r.lname ?? "").trim()}`.trim() ||
            `ผู้ใช้ ${r.user_id}`,
        }))
      );
      setCustomers(
        (cRes.rows ?? []).map((r) => ({
          cus_id: r.cus_id,
          cus_name: String(r.cus_name ?? "").trim(),
        }))
      );
    } catch {
      /* ignore */
    }
  }, [conn.ready, conn.apiOk, conn.db]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  useEffect(() => {
    if (saleId != null || salesOptions.length === 0) return;
    setSaleId(salesOptions[0].user_id);
  }, [saleId, salesOptions]);

  const companyLabel = mnsCompanyLabel(companyKey);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers.slice(0, 80);
    return customers.filter((c) => c.cus_name.toLowerCase().includes(q)).slice(0, 80);
  }, [customers, customerSearch]);

  const openCompanyModal = () => {
    setCompanyDraft(companyKey || "");
    setCompanyModalOpen(true);
  };

  const confirmCompany = () => {
    if (!companyDraft) return;
    setCompanyKey(companyDraft);
    setCompanyModalOpen(false);
  };

  const submit = async () => {
    setSaveError(null);
    if (!companyKey) {
      setSaveError("กรุณาเลือกบริษัท");
      setCompanyGateOpen(true);
      return;
    }
    if (!customerId) {
      setSaveError("กรุณาเลือกลูกค้าในระบบ");
      return;
    }
    if (!saleId) {
      setSaveError("กรุณาเลือกพนักงานขาย");
      return;
    }
    const pname = productName.trim();
    if (!pname) {
      setSaveError("กรุณาระบุชื่อสินค้า");
      return;
    }
    setSaving(true);
    try {
      await mnsFetch<{ ok?: boolean; row?: { service_id?: string } }>("/jobs", {
        method: "POST",
        body: JSON.stringify({
          jobKind: "sale",
          workgroup_id: 3,
          customer_id: customerId,
          product_name: pname,
          model: model.trim(),
          brand: brand.trim(),
          sn: sn.trim(),
          quantity: qty,
          job_amount: qty,
          send_job: sendDate,
          recive_job: sendDate,
          sale_id: saleId,
          user_id: saleId,
          company_label: companyLabel,
          info: remark.trim(),
          job_condition: "",
        }),
      });
      navigate("/dept/sales/work");
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DeptPageFrame>
      <DeptPageHeader
        deptId="sales"
        titleTh="แผนกขาย — ใบงานขาย"
        titleEn="Sales job sheet"
        dashboardPath="/dept/sales/dashboard"
        workPath="/dept/sales/work"
        reportPath="/dept/sales/report"
      />

      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-xl border border-sky-200 bg-sky-50/80 px-4 py-3 text-center">
          <h1 className="text-lg font-bold text-sky-900">ระบบบันทึกข้อมูลงาน</h1>
          <p className="text-sm text-sky-800">{companyLabel}</p>
        </div>

        {saveError ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {saveError}
          </p>
        ) : null}

        <section className="rounded-2xl border border-sky-200/90 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-slate-900">
            ข้อมูลทั่วไปของลูกค้า
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                ชื่อลูกค้า
              </label>
              <input
                readOnly
                value={customerName}
                placeholder="ยังไม่ได้เลือก"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => setCustomerModalOpen(true)}
                className="mt-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
              >
                คลิกเลือกลูกค้าในระบบ
              </button>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                พนักงานขาย
              </label>
              <select
                value={saleId ?? ""}
                onChange={(e) =>
                  setSaleId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                <option value="">เลือกพนักงานขาย</option>
                {salesOptions.map((o) => (
                  <option key={o.user_id} value={o.user_id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">แสดงเฉพาะกลุ่มงานขาย</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-sky-200/90 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-slate-900">
            ข้อมูลสินค้า/บริการ
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                เลขที่ใบงาน
              </label>
              <input
                readOnly
                value={provisionalRef}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              />
              <p className="mt-0.5 text-xs text-slate-400">อ้างอิงชั่วคราว — เลขจริงตามระบบหลังบันทึก</p>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                ชื่อสินค้า
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="กรอกชื่อ หรือ Model"
                  className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                รุ่น
              </label>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="ดูที่ตัวสินค้า"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                ยี่ห้อ
              </label>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="ดูที่ตัวสินค้า"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                หมายเลขเครื่อง / SN
              </label>
              <input
                value={sn}
                onChange={(e) => setSn(e.target.value)}
                placeholder="ดูที่ตัวสินค้า"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                จำนวน
              </label>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) =>
                  setQty(Math.max(1, parseInt(e.target.value, 10) || 1))
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                วัน/เดือน/ปี ที่ต้องการส่งงาน
              </label>
              <input
                type="date"
                value={sendDate}
                onChange={(e) => setSendDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                หมายเหตุ
              </label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-200/90 bg-white p-4">
          <button
            type="button"
            onClick={() => navigate("/dept/sales/work")}
            className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
          >
            ย้อนกลับ
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openCompanyModal}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
            >
              เลือกบริษัท
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={submit}
              className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-60"
            >
              {saving ? "กำลังบันทึก…" : "บันทึกข้อมูล"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          ต้องการจัดการลูกค้า?{" "}
          <Link to="/settings/customers" className="text-indigo-600 underline">
            ตั้งค่าลูกค้า
          </Link>
        </p>
      </div>

      <JobSheetCompanyGate
        open={companyGateOpen}
        onConfirm={(k) => {
          setCompanyKey(k);
          setCompanyGateOpen(false);
        }}
        onBack={() => navigate("/dept/sales/work")}
      />

      <CompanyValidationModal
        open={companyModalOpen}
        draftKey={companyDraft}
        onDraftChange={setCompanyDraft}
        onConfirm={confirmCompany}
        onClose={() => setCompanyModalOpen(false)}
      />

      {customerModalOpen ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-100 px-4 py-3">
              <h3 className="font-semibold text-slate-900">เลือกลูกค้า</h3>
              <input
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="ค้นหาชื่อ…"
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <ul className="flex-1 overflow-y-auto p-2">
              {filteredCustomers.map((c) => (
                <li key={c.cus_id}>
                  <button
                    type="button"
                    className="w-full rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-100"
                    onClick={() => {
                      setCustomerId(c.cus_id);
                      setCustomerName(c.cus_name);
                      setCustomerModalOpen(false);
                      setCustomerSearch("");
                    }}
                  >
                    {c.cus_name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-100 p-3">
              <button
                type="button"
                onClick={() => setCustomerModalOpen(false)}
                className="w-full rounded-lg border border-slate-200 py-2 text-sm"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DeptPageFrame>
  );
}
