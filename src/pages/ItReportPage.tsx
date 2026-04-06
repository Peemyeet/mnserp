import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowDownUp, MessageCircle, X } from "lucide-react";
import { receivesItAdminAlerts } from "../auth/itAdminAlerts";
import { WarehouseExportToolbar } from "../components/warehouse/WarehouseExportToolbar";
import { useAuth } from "../context/AuthContext";
import { useItSupport } from "../context/ItSupportContext";
import {
  IT_REPORT_ASSIGNEE_OPTIONS,
  IT_REPORT_PRIORITY_OPTIONS,
} from "../data/itReportSeed";
import type { ItReportRow } from "../types/itReport";

type SortKey = keyof ItReportRow;

const PAGE_SIZE = 10;

function ReportItProblemModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (subject: string, details: string) => void;
}) {
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim()) return;
    onSubmit(subject.trim(), details.trim());
    setSubject("");
    setDetails("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-it-title"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="ปิด"
        >
          <X className="h-5 w-5" />
        </button>
        <h2
          id="report-it-title"
          className="text-lg font-bold text-slate-900"
        >
          แจ้งปัญหา IT
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          ระบบจะแจ้งเตือนผู้ดูแลระบบทันทีเมื่อส่งเรื่อง
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">หัวข้อ</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
              placeholder="สรุปปัญหาสั้นๆ"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">รายละเอียด</span>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="mt-1 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
              placeholder="อาการ / ขั้นตอนที่ทำ / หน้าจอที่เกี่ยวข้อง"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
            >
              ส่งแจ้งปัญหา
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ItReportPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    rows,
    patchRow,
    submitProblem,
    markAllSubmissionsRead,
    unreadSubmissionCount,
  } = useItSupport();

  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState("ทั้งหมด");
  const [sortKey, setSortKey] = useState<SortKey>("queueId");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const st = location.state as { openReportModal?: boolean } | null;
    if (st?.openReportModal) {
      setModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (
      user != null &&
      receivesItAdminAlerts(user) &&
      unreadSubmissionCount > 0
    ) {
      markAllSubmissionsRead();
    }
  }, [user, unreadSubmissionCount, markAllSubmissionsRead]);

  const userOptions = useMemo(() => {
    const u = new Set(rows.map((r) => r.reporter));
    return ["ทั้งหมด", ...Array.from(u)];
  }, [rows]);

  const filtered = useMemo(() => {
    let list = rows;
    if (userFilter !== "ทั้งหมด") {
      list = list.filter((r) => r.reporter === userFilter);
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r) =>
      [
        r.queueId,
        r.status,
        r.openDate,
        r.subject,
        r.details,
        r.reporter,
        r.assignee,
        r.priority,
        r.department,
        r.link,
        r.attachments,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, userFilter, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = String(a[sortKey]);
      const vb = String(b[sortKey]);
      const cmp = va.localeCompare(vb, "th");
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const sliceStart = (safePage - 1) * PAGE_SIZE;
  const pageRows = sorted.slice(sliceStart, sliceStart + PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  function handleSubmitProblem(subject: string, details: string) {
    if (user == null) return;
    submitProblem({ subject, details }, user);
  }

  const exportMatrix = {
    head: [
      "คิวงาน",
      "สถานะ",
      "วันที่เปิดงาน",
      "หัวข้อ",
      "รายละเอียด",
      "ไฟล์แนบ",
      "Link",
      "ผู้แจ้งปัญหา",
      "ผู้รับผิดชอบ",
      "ความสำคัญ",
      "วันที่ทำงาน",
      "วันที่คาดว่าจะเสร็จ",
      "แผนก",
    ],
    rows: sorted.map((r) => [
      r.queueId,
      r.status,
      r.openDate,
      r.subject,
      r.details,
      r.attachments,
      r.link,
      r.reporter,
      r.assignee,
      r.priority,
      r.workDate,
      r.dueDate,
      r.department,
    ]),
  };

  const sortableHeader = (key: SortKey, label: string) => (
    <th className="whitespace-nowrap px-2 py-3 text-left">
      <button
        type="button"
        onClick={() => toggleSort(key)}
        className="inline-flex items-center gap-1 font-semibold text-violet-700 hover:text-violet-900"
      >
        {label}
        <ArrowDownUp className="h-3.5 w-3.5 text-violet-400" />
      </button>
    </th>
  );

  return (
    <div className="min-h-full bg-slate-100/80 print:bg-white">
      <ReportItProblemModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitProblem}
      />

      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-white px-6 py-4">
        <div>
          <Link
            to="/it"
            className="text-sm font-medium text-violet-600 hover:text-violet-800"
          >
            ← Dashboard IT
          </Link>
          <h1 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
            แจ้งปัญหา IT
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
        >
          แจ้งปัญหา IT
        </button>
      </header>

      <div className="p-4 sm:p-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <span className="font-medium">เลือก user</span>
              <select
                value={userFilter}
                onChange={(e) => {
                  setUserFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {userOptions.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <WarehouseExportToolbar
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            matrixForExport={exportMatrix}
            exportBasename="it-report"
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1600px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90">
                  {sortableHeader("queueId", "คิวงาน")}
                  {sortableHeader("status", "สถานะ")}
                  {sortableHeader("openDate", "วันที่เปิดงาน")}
                  {sortableHeader("subject", "หัวข้อ")}
                  {sortableHeader("details", "รายละเอียด")}
                  {sortableHeader("attachments", "ไฟล์แนบ")}
                  {sortableHeader("link", "Link")}
                  {sortableHeader("reporter", "ผู้แจ้งปัญหา")}
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold text-violet-700">
                    ผู้รับผิดชอบ
                  </th>
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold text-violet-700">
                    ความสำคัญ
                  </th>
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold text-violet-700">
                    วันที่ทำงาน
                  </th>
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold text-violet-700">
                    วันที่คาดว่าจะเสร็จ
                  </th>
                  {sortableHeader("department", "แผนก")}
                  <th className="whitespace-nowrap px-2 py-3 text-center font-semibold text-violet-700">
                    Chat
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((r, i) => (
                  <tr
                    key={r.id}
                    className={`border-b border-slate-100 ${
                      i % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                    }`}
                  >
                    <td className="whitespace-nowrap px-2 py-2 font-medium text-slate-800">
                      {r.queueId}
                    </td>
                    <td className="px-2 py-2">
                      <span className="inline-block rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">
                        {r.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-slate-700">
                      {r.openDate}
                    </td>
                    <td className="max-w-[140px] px-2 py-2 text-slate-800">
                      {r.subject}
                    </td>
                    <td className="max-w-[280px] px-2 py-2 text-slate-600">
                      {r.details}
                    </td>
                    <td className="px-2 py-2 text-slate-500">{r.attachments || "—"}</td>
                    <td className="px-2 py-2 text-slate-500">{r.link}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-slate-800">
                      {r.reporter}
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={r.assignee}
                        onChange={(e) =>
                          patchRow(r.id, { assignee: e.target.value })
                        }
                        className="w-full min-w-[8rem] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                      >
                        {IT_REPORT_ASSIGNEE_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={r.priority}
                        onChange={(e) =>
                          patchRow(r.id, { priority: e.target.value })
                        }
                        className="w-full min-w-[6rem] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
                      >
                        {IT_REPORT_PRIORITY_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="date"
                        value={r.workDate}
                        onChange={(e) =>
                          patchRow(r.id, { workDate: e.target.value })
                        }
                        className="w-full min-w-[9rem] rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="date"
                        value={r.dueDate}
                        onChange={(e) =>
                          patchRow(r.id, { dueDate: e.target.value })
                        }
                        className="w-full min-w-[9rem] rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                      />
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 font-semibold text-orange-600">
                      {r.department}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-300 text-amber-900 shadow-sm hover:bg-amber-400"
                        aria-label="เปิดแชท"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
            <span>
              {sorted.length === 0
                ? "ไม่มีรายการ"
                : `แสดง ${sliceStart + 1}–${Math.min(sliceStart + PAGE_SIZE, sorted.length)} จาก ${sorted.length}`}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >
                ก่อนหน้า
              </button>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
              >
                ถัดไป
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
