import { useMemo, useState } from "react";
import {
  Folder,
  MessageCircle,
  Printer,
  Check,
} from "lucide-react";
import { WarehouseExportToolbar } from "../warehouse/WarehouseExportToolbar";

const PAGE = 10;

function usePaged<T>(list: T[], search: string, getBlob: (row: T) => string) {
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) => getBlob(r).toLowerCase().includes(q));
  }, [list, search, getBlob]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const safe = Math.min(page, totalPages);
  const start = (safe - 1) * PAGE;
  const slice = filtered.slice(start, start + PAGE);
  return { filtered, slice, page: safe, totalPages, setPage, start };
}

function TableFooter({
  from,
  to,
  total,
  page,
  totalPages,
  setPage,
}: {
  from: number;
  to: number;
  total: number;
  page: number;
  totalPages: number;
  setPage: (n: number | ((p: number) => number)) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
      <span>
        {total === 0
          ? "Showing 0 to 0 of 0 entries"
          : `Showing ${from} to ${to} of ${total} entries`}
      </span>
      <div className="flex gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="rounded border border-slate-200 px-3 py-1 disabled:opacity-40"
        >
          Previous
        </button>
        <span className="flex items-center rounded bg-violet-600 px-3 py-1 text-white">
          {page}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="rounded border border-slate-200 px-3 py-1 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/** 1 — PR ไม่มี JOB */
export function ApprovePrNoJobPanel() {
  const rows = useMemo(
    () =>
      [1, 2, 3, 4].map((i) => ({
        id: String(i),
        dateOpen: "0000-00-00",
        pr: "",
        market: "",
        price: "0.00",
        vat: "0.00",
        userReq: "",
      })),
    []
  );
  const [search, setSearch] = useState("");
  const { filtered, slice, page, totalPages, setPage, start } = usePaged(
    rows,
    search,
    (r) => [r.dateOpen, r.pr, r.market, r.price].join(" ")
  );
  const matrix = {
    head: ["Date Open PR", "PR", "Market", "Price", "VAT", "User Require"],
    rows: filtered.map((r) => [
      r.dateOpen,
      r.pr || "-",
      r.market || "-",
      r.price,
      r.vat,
      r.userReq || "-",
    ]),
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <WarehouseExportToolbar
        search={search}
        onSearchChange={(v) => setSearch(v)}
        matrixForExport={matrix}
        exportBasename="approve-pr-no-job"
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <th className="w-10 px-3 py-3">
                <Check className="h-4 w-4 text-violet-600" />
              </th>
              <th className="px-3 py-3">Date Open PR</th>
              <th className="px-3 py-3">PR</th>
              <th className="px-3 py-3">Market</th>
              <th className="px-3 py-3">Price (Total)</th>
              <th className="px-3 py-3">VAT</th>
              <th className="px-3 py-3">User Require</th>
              <th className="px-3 py-3">Part List</th>
              <th className="px-3 py-3">Manage</th>
              <th className="px-3 py-3">ใบเสนอราคา</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((r, i) => (
              <tr
                key={r.id}
                className={i % 2 ? "bg-slate-50/50" : "bg-white"}
              >
                <td className="px-3 py-2">
                  <input type="checkbox" className="rounded border-slate-300" />
                </td>
                <td className="px-3 py-2 text-slate-700">{r.dateOpen}</td>
                <td className="px-3 py-2">-</td>
                <td className="px-3 py-2">-</td>
                <td className="px-3 py-2">{r.price}</td>
                <td className="px-3 py-2">{r.vat}</td>
                <td className="px-3 py-2">-</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="text-teal-600 hover:text-teal-800"
                    aria-label="Part list"
                  >
                    <Folder className="h-5 w-5" />
                  </button>
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="text-violet-600 hover:text-violet-800"
                    aria-label="Print"
                  >
                    <Printer className="h-5 w-5" />
                  </button>
                </td>
                <td className="px-3 py-2 text-sm font-medium text-red-500">
                  ไม่มีไฟล์แนบ
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TableFooter
        from={filtered.length ? start + 1 : 0}
        to={Math.min(start + PAGE, filtered.length)}
        total={filtered.length}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
      <div className="border-t border-slate-100 px-4 py-4">
        <button
          type="button"
          className="rounded-lg bg-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-600"
        >
          ยืนยันการอนุมัติ PO
        </button>
      </div>
    </div>
  );
}

/** 2 — ใบลา */
export function ApproveLeavePanel() {
  const rows = useMemo(
    () => [
      {
        id: "1",
        no: "1",
        name: "-",
        nick: "-",
        dept: "-",
        submit: "-",
        from: "-",
        to: "-",
        days: "-",
        type: "-",
        reason: "-",
        quota: "-",
        file: "-",
      },
    ],
    []
  );
  const [search, setSearch] = useState("");
  const { filtered, slice, page, totalPages, setPage, start } = usePaged(
    rows,
    search,
    (r) => Object.values(r).join(" ")
  );
  const matrix = {
    head: [
      "ลำดับ",
      "ชื่อพนักงาน",
      "ชื่อเล่น",
      "แผนก",
      "ยื่นใบลาวันที่",
      "ลาตั้งแต่วันที่",
      "ถึงวันที่",
      "ลาที่วัน",
      "ประเภทการลา",
      "เหตุผล",
      "โควต้า",
      "ไฟล์แนบ",
    ],
    rows: filtered.map((r) => [
      r.no,
      r.name,
      r.nick,
      r.dept,
      r.submit,
      r.from,
      r.to,
      r.days,
      r.type,
      r.reason,
      r.quota,
      r.file,
    ]),
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-lg font-bold text-slate-900">ใบลา</h2>
        <p className="text-sm text-slate-500">Approve Leave</p>
      </div>
      <WarehouseExportToolbar
        search={search}
        onSearchChange={setSearch}
        matrixForExport={matrix}
        exportBasename="approve-leave"
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <th className="w-10 px-2 py-3" />
              <th className="px-2 py-3">ลำดับ</th>
              <th className="px-2 py-3">ชื่อพนักงาน</th>
              <th className="px-2 py-3">ชื่อเล่น</th>
              <th className="px-2 py-3">แผนก</th>
              <th className="px-2 py-3">ยื่นใบลาวันที่</th>
              <th className="px-2 py-3">ลาตั้งแต่วันที่</th>
              <th className="px-2 py-3">ถึงวันที่</th>
              <th className="px-2 py-3">ลาที่วัน</th>
              <th className="px-2 py-3">ประเภทการลา</th>
              <th className="px-2 py-3">เหตุผลการลา</th>
              <th className="px-2 py-3">โควต้า</th>
              <th className="px-2 py-3">ไฟล์แนบ</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((r, i) => (
              <tr key={r.id} className={i % 2 ? "bg-slate-50/50" : ""}>
                <td className="px-2 py-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                </td>
                <td className="px-2 py-2">{r.no}</td>
                <td className="px-2 py-2">{r.name}</td>
                <td className="px-2 py-2">{r.nick}</td>
                <td className="px-2 py-2">{r.dept}</td>
                <td className="px-2 py-2">{r.submit}</td>
                <td className="px-2 py-2">{r.from}</td>
                <td className="px-2 py-2">{r.to}</td>
                <td className="px-2 py-2">{r.days}</td>
                <td className="px-2 py-2">{r.type}</td>
                <td className="px-2 py-2">{r.reason}</td>
                <td className="px-2 py-2">{r.quota}</td>
                <td className="px-2 py-2">{r.file}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TableFooter
        from={filtered.length ? start + 1 : 0}
        to={Math.min(start + PAGE, filtered.length)}
        total={filtered.length}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
      <div className="flex flex-wrap gap-3 border-t border-slate-100 px-4 py-4">
        <button
          type="button"
          className="rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600"
        >
          ยืนยันการอนุมัติลางาน
        </button>
        <button
          type="button"
          className="rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
        >
          ไม่อนุมัติลางาน
        </button>
      </div>
    </div>
  );
}

/** 3 — ใบเบิกรถ */
export function ApproveVehiclePanel() {
  const rows = useMemo(
    () => [
      {
        id: "1",
        doc: "-",
        reqDate: "-",
        to: "-",
        topic: "-",
        useDate: "-",
        goTime: "-",
        returnDate: "-",
        backTime: "-",
        status: "-",
      },
    ],
    []
  );
  const [search, setSearch] = useState("");
  const { filtered, slice, page, totalPages, setPage, start } = usePaged(
    rows,
    search,
    (r) => Object.values(r).join(" ")
  );
  const matrix = {
    head: [
      "เลขที่เอกสาร",
      "วันที่ขอเบิก",
      "เดินทางไป",
      "ไปติดต่อเรื่อง",
      "วันที่ใช้รถ",
      "ไปเวลา",
      "วันที่คืนรถ",
      "กลับเวลา",
      "Status",
    ],
    rows: filtered.map((r) => [
      r.doc,
      r.reqDate,
      r.to,
      r.topic,
      r.useDate,
      r.goTime,
      r.returnDate,
      r.backTime,
      r.status,
    ]),
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          <h2 className="text-base font-bold leading-snug text-slate-900 sm:text-lg">
            ขอเบิกรถไปงานนอกสถานที่ (รออนุมัติ)
          </h2>
        </div>
        <button
          type="button"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          รายการเบิกทั้งหมด
        </button>
      </div>
      <WarehouseExportToolbar
        search={search}
        onSearchChange={setSearch}
        matrixForExport={matrix}
        exportBasename="approve-vehicle"
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-violet-700">
              <th className="px-3 py-3">เลขที่เอกสาร</th>
              <th className="px-3 py-3">วันที่ขอเบิก</th>
              <th className="px-3 py-3">เดินทางไป</th>
              <th className="px-3 py-3">ไปติดต่อเรื่อง</th>
              <th className="px-3 py-3">วันที่ใช้รถ</th>
              <th className="px-3 py-3">ไปเวลา</th>
              <th className="px-3 py-3">วันที่คืนรถ</th>
              <th className="px-3 py-3">กลับเวลา</th>
              <th className="px-3 py-3">Action</th>
              <th className="px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((r, i) => (
              <tr key={r.id} className={i % 2 ? "bg-slate-50/50" : ""}>
                <td className="px-3 py-2 font-medium text-violet-700">{r.doc}</td>
                <td className="px-3 py-2">{r.reqDate}</td>
                <td className="px-3 py-2">{r.to}</td>
                <td className="px-3 py-2">{r.topic}</td>
                <td className="px-3 py-2">{r.useDate}</td>
                <td className="px-3 py-2">{r.goTime}</td>
                <td className="px-3 py-2">{r.returnDate}</td>
                <td className="px-3 py-2">{r.backTime}</td>
                <td className="px-3 py-2">-</td>
                <td className="px-3 py-2">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TableFooter
        from={filtered.length ? start + 1 : 0}
        to={Math.min(start + PAGE, filtered.length)}
        total={filtered.length}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
      <div className="px-4 py-4">
        <button
          type="button"
          className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
        >
          ย้อนกลับ
        </button>
      </div>
    </div>
  );
}

/** 4 — ตรวจสอบรายการจ่าย */
export function ApproveAuditPaymentPanel() {
  const rows = useMemo(
    () => [
      {
        id: "1",
        no: "1",
        ref: "EXPM690849",
        payType: "งบเงินสดปลีก",
        shop: "งบเงินสดปลีก ฝ่ายผลิต",
        total: "2,019.62",
        due: "",
        company: "บริษัท มณีสูรย์ กรุ๊ป จำกัด",
        note: "",
      },
      {
        id: "2",
        no: "2",
        ref: "EXPM690850",
        payType: "งบเงินสดปลีก",
        shop: "งบเงินสดปลีก ฝ่ายผลิต",
        total: "1,500.00",
        due: "",
        company: "บริษัท มณีสูรย์ กรุ๊ป จำกัด",
        note: "",
      },
      {
        id: "3",
        no: "3",
        ref: "EXPM690851",
        payType: "งบเงินสดปลีก",
        shop: "งบเงินสดปลีก ฝ่ายผลิต",
        total: "890.25",
        due: "",
        company: "บริษัท มณีสูรย์ กรุ๊ป จำกัด",
        note: "",
      },
      {
        id: "4",
        no: "4",
        ref: "EXPM690852",
        payType: "งบเงินสดปลีก",
        shop: "งบเงินสดปลีก ฝ่ายผลิต",
        total: "450.00",
        due: "",
        company: "บริษัท มณีสูรย์ กรุ๊ป จำกัด",
        note: "",
      },
    ],
    []
  );
  const [search, setSearch] = useState("");
  const { filtered, slice, page, totalPages, setPage, start } = usePaged(
    rows,
    search,
    (r) => [r.ref, r.payType, r.shop, r.total, r.company].join(" ")
  );
  const matrix = {
    head: [
      "ลำดับ",
      "เลขที่เอกสารอ้างอิง",
      "ประเภทการจ่าย",
      "ร้านค้า",
      "ราคารวม",
      "วันที่ครบกำหนด",
      "ชื่อบริษัท",
      "หมายเหตุ",
    ],
    rows: filtered.map((r) => [
      r.no,
      r.ref,
      r.payType,
      r.shop,
      r.total,
      r.due,
      r.company,
      r.note,
    ]),
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-lg font-bold text-slate-900">รอตรวจสอบ</h2>
        <p className="text-sm text-slate-500">Audit Account</p>
      </div>
      <WarehouseExportToolbar
        search={search}
        onSearchChange={setSearch}
        matrixForExport={matrix}
        exportBasename="approve-audit-payment"
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <th className="px-3 py-3">ลำดับ</th>
              <th className="px-3 py-3">เลขที่เอกสารอ้างอิง</th>
              <th className="px-3 py-3">ประเภทการจ่าย</th>
              <th className="px-3 py-3">ร้านค้า</th>
              <th className="px-3 py-3">ราคารวม</th>
              <th className="px-3 py-3">วันที่ครบกำหนด</th>
              <th className="px-3 py-3">ชื่อบริษัท</th>
              <th className="px-3 py-3">เอกสารแนบ</th>
              <th className="px-3 py-3">หมายเหตุ</th>
              <th className="px-3 py-3">CHAT</th>
              <th className="px-3 py-3">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((r, i) => (
              <tr key={r.id} className={i % 2 ? "bg-slate-50/50" : ""}>
                <td className="px-3 py-2">{r.no}</td>
                <td className="px-3 py-2 font-medium text-violet-600 hover:underline">
                  {r.ref}
                </td>
                <td className="px-3 py-2">{r.payType}</td>
                <td className="px-3 py-2">{r.shop}</td>
                <td className="px-3 py-2">{r.total}</td>
                <td className="px-3 py-2">{r.due || "—"}</td>
                <td className="px-3 py-2">{r.company}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="rounded bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800 hover:bg-violet-200"
                  >
                    ไฟล์แนบ
                  </button>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    className="w-full min-w-[100px] rounded border border-slate-200 px-2 py-1 text-sm"
                    placeholder="หมายเหตุ"
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white"
                    aria-label="Chat"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      className="rounded bg-orange-500 px-2 py-1 text-xs font-semibold text-white"
                    >
                      แก้ไข
                    </button>
                    <button
                      type="button"
                      className="rounded bg-violet-600 px-2 py-1 text-xs font-semibold text-white"
                    >
                      ยืนยัน
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TableFooter
        from={filtered.length ? start + 1 : 0}
        to={Math.min(start + PAGE, filtered.length)}
        total={filtered.length}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
  );
}

/** 5 — ทำใบสั่งซื้อ / ยืนยันร้านค้า */
export function ApproveCreatePoPanel() {
  const rows = useMemo(
    () => [
      {
        id: "1",
        sid: "-",
        job: "-",
        mns: "-",
        part: "-",
        desc: "-",
        storeQty: "-",
        supplier: "-",
        qty: "-",
        days: "-",
        salesNeed: "-",
      },
    ],
    []
  );
  const [search, setSearch] = useState("");
  const { filtered, slice, page, totalPages, setPage, start } = usePaged(
    rows,
    search,
    (r) => Object.values(r).join(" ")
  );
  const matrix = {
    head: [
      "Service ID",
      "Job Name",
      "Mns Part No",
      "Part No",
      "Description",
      "Store QTY",
      "Supplier",
      "QTY",
      "จำนวนวันหลังจากถูกเพิ่ม",
      "วันที่ฝ่ายขายต้องการของ",
    ],
    rows: filtered.map((r) => [
      r.sid,
      r.job,
      r.mns,
      r.part,
      r.desc,
      r.storeQty,
      r.supplier,
      r.qty,
      r.days,
      r.salesNeed,
    ]),
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-lg font-bold text-slate-900">ยืนยันร้านค้า</h2>
        <p className="text-sm text-slate-500">Market confirmation / Create PO</p>
      </div>
      <WarehouseExportToolbar
        search={search}
        onSearchChange={setSearch}
        matrixForExport={matrix}
        exportBasename="approve-create-po"
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <th className="w-10 px-2 py-3" />
              <th className="px-2 py-3 text-violet-700">Service ID</th>
              <th className="px-2 py-3">Job Name</th>
              <th className="px-2 py-3">Mns Part No</th>
              <th className="px-2 py-3">Part No</th>
              <th className="px-2 py-3">Description</th>
              <th className="px-2 py-3">Store QTY</th>
              <th className="px-2 py-3">Supplier</th>
              <th className="px-2 py-3">QTY</th>
              <th className="px-2 py-3">จำนวนวันหลังจากถูกเพิ่ม</th>
              <th className="px-2 py-3">วันที่ฝ่ายขายต้องการของ</th>
              <th className="px-2 py-3">Manage</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((r, i) => (
              <tr key={r.id} className={i % 2 ? "bg-slate-50/50" : ""}>
                <td className="px-2 py-2">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="px-2 py-2 text-violet-600">{r.sid}</td>
                <td className="px-2 py-2">{r.job}</td>
                <td className="px-2 py-2">{r.mns}</td>
                <td className="px-2 py-2">{r.part}</td>
                <td className="px-2 py-2">{r.desc}</td>
                <td className="px-2 py-2">{r.storeQty}</td>
                <td className="px-2 py-2">{r.supplier}</td>
                <td className="px-2 py-2">{r.qty}</td>
                <td className="px-2 py-2">{r.days}</td>
                <td className="px-2 py-2">{r.salesNeed}</td>
                <td className="px-2 py-2">-</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TableFooter
        from={filtered.length ? start + 1 : 0}
        to={Math.min(start + PAGE, filtered.length)}
        total={filtered.length}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
  );
}

/** สรุปอนุมัติรายการจ่าย (ใบวางบิล / จ่ายร้านค้า) — แสดงเมื่อเลือกมุมมองรวม */
export function ApprovePaymentSummaryPanel() {
  const rows = useMemo(
    () => [
      {
        id: "1",
        type: "ใบวางบิล",
        docRef: "PV-000108",
        statusLine: "อนุมัติมาแล้ว : เปิดมาแล้ว 26 วัน",
        payType: "จ่ายร้านค้า",
        name: "",
        vendor: "บริษัท อีเลคทรอนิคส์ ซอร์ส จำกัด",
        total: "1,637.80",
        due: "2024-03-15",
        note: "",
      },
    ],
    []
  );
  const [search, setSearch] = useState("");
  const [itemType, setItemType] = useState("ทั้งหมด");
  const { filtered, slice, page, totalPages, setPage, start } = usePaged(
    rows,
    search,
    (r) =>
      [r.type, r.docRef, r.payType, r.vendor, r.total, r.name].join(" ")
  );
  const matrix = {
    head: [
      "ชนิดรายการ",
      "เลขที่อ้างอิงเอกสาร",
      "ประเภทการจ่าย",
      "รายชื่อ",
      "ร้านค้า",
      "ราคารวม",
      "วันครบกำหนด",
      "หมายเหตุ",
    ],
    rows: filtered.map((r) => [
      r.type,
      r.docRef,
      r.payType,
      r.name || "-",
      r.vendor,
      r.total,
      r.due,
      r.note,
    ]),
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-slate-600">
            ชนิดรายการ:
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              className="ml-2 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            >
              <option value="ทั้งหมด">ทั้งหมด</option>
              <option value="ใบวางบิล">ใบวางบิล</option>
              <option value="ใบแจ้งหนี้">ใบแจ้งหนี้</option>
            </select>
          </label>
          <button
            type="button"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
          >
            ค้นหา
          </button>
        </div>
      </div>
      <WarehouseExportToolbar
        search={search}
        onSearchChange={setSearch}
        matrixForExport={matrix}
        exportBasename="approve-payment-summary"
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-violet-700">
              <th className="w-10 px-2 py-3" />
              <th className="px-2 py-3">ลำดับที่</th>
              <th className="px-2 py-3">ชนิดรายการ</th>
              <th className="px-2 py-3">เลขที่อ้างอิงเอกสาร</th>
              <th className="px-2 py-3">ประเภทการจ่าย</th>
              <th className="px-2 py-3">รายชื่อ</th>
              <th className="px-2 py-3">ร้านค้า</th>
              <th className="px-2 py-3">ราคารวม</th>
              <th className="px-2 py-3">วันครบกำหนด</th>
              <th className="px-2 py-3">หมายเหตุ</th>
              <th className="px-2 py-3">ไฟล์แนบ</th>
              <th className="px-2 py-3">CHAT</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((r, i) => (
              <tr key={r.id} className={i % 2 ? "bg-slate-50/50" : ""}>
                <td className="px-2 py-2">
                  <input type="radio" name="pay-sel" className="text-violet-600" />
                </td>
                <td className="px-2 py-2">{start + i + 1}</td>
                <td className="px-2 py-2">{r.type}</td>
                <td className="px-2 py-2">
                  <div className="font-medium text-slate-900">{r.docRef}</div>
                  <div className="text-xs text-red-600">{r.statusLine}</div>
                </td>
                <td className="px-2 py-2">{r.payType}</td>
                <td className="px-2 py-2">{r.name || "—"}</td>
                <td className="px-2 py-2">{r.vendor}</td>
                <td className="px-2 py-2">{r.total}</td>
                <td className="px-2 py-2">{r.due}</td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    className="w-full rounded border border-slate-200 px-2 py-1 text-sm"
                  />
                </td>
                <td className="px-2 py-2 text-slate-400">-</td>
                <td className="px-2 py-2 text-center">
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TableFooter
        from={filtered.length ? start + 1 : 0}
        to={Math.min(start + PAGE, filtered.length)}
        total={filtered.length}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
  );
}
