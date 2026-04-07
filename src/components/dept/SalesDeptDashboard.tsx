import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LayoutGrid, Settings, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMnsConnection } from "../../context/MnsConnectionContext";
import { mnsFetch } from "../../services/mnsApi";

function waitPoDaysSinceModified(modified: string | undefined): number {
  if (!modified?.trim()) return 0;
  const d = new Date(modified.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}

const WAIT_PO_DAY_SPLIT = 60;

type Tone = "red" | "orange" | "purple" | "teal";

const toneClass: Record<Tone, string> = {
  red: "bg-red-500 hover:bg-red-600",
  orange: "bg-orange-500 hover:bg-orange-600",
  purple: "bg-violet-600 hover:bg-violet-700",
  teal: "bg-teal-500 hover:bg-teal-600",
};

type CardTheme = "violet" | "teal" | "amber" | "sky" | "emerald" | "rose";

const CARD_THEME: Record<
  CardTheme,
  { shell: string; blur: string; total: string; iconBg: string }
> = {
  violet: {
    shell:
      "border-violet-200/80 bg-gradient-to-br from-violet-100/90 via-violet-50 to-white ring-violet-100/60",
    blur: "-right-8 -top-12 h-40 w-40 bg-violet-200/40",
    total: "bg-violet-600",
    iconBg: "bg-violet-500",
  },
  teal: {
    shell:
      "border-teal-200/80 bg-gradient-to-br from-teal-100/90 via-cyan-50/80 to-white ring-teal-100/60",
    blur: "-right-6 -top-10 h-36 w-36 bg-teal-200/35",
    total: "bg-teal-600",
    iconBg: "bg-teal-500",
  },
  amber: {
    shell:
      "border-amber-200/80 bg-gradient-to-br from-amber-100/90 via-yellow-50 to-white ring-amber-100/60",
    blur: "-right-8 -bottom-8 h-36 w-36 bg-amber-200/35",
    total: "bg-amber-500",
    iconBg: "bg-amber-500",
  },
  sky: {
    shell:
      "border-sky-200/80 bg-gradient-to-br from-sky-100/90 via-cyan-50/70 to-white ring-sky-100/60",
    blur: "-left-6 -top-8 h-32 w-32 bg-sky-200/40",
    total: "bg-sky-600",
    iconBg: "bg-sky-500",
  },
  emerald: {
    shell:
      "border-emerald-200/80 bg-gradient-to-br from-emerald-100/90 via-green-50/80 to-white ring-emerald-100/60",
    blur: "-right-6 -bottom-10 h-36 w-36 bg-emerald-200/35",
    total: "bg-emerald-600",
    iconBg: "bg-emerald-500",
  },
  rose: {
    shell:
      "border-rose-200/80 bg-gradient-to-br from-rose-100/90 via-pink-50 to-white ring-rose-100/60",
    blur: "-left-6 -top-8 h-32 w-32 bg-rose-200/40",
    total: "bg-rose-600",
    iconBg: "bg-rose-500",
  },
};

function SubStatButton({
  label,
  count,
  tone,
  wide,
  to,
}: {
  label: string;
  count: number;
  tone: Tone;
  wide?: boolean;
  to?: string;
}) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => {
        if (to) navigate(to);
      }}
      className={`relative flex items-center justify-between gap-2 rounded-xl px-3 py-3 text-left text-xs font-semibold text-white shadow-md transition sm:text-sm ${toneClass[tone]} ${wide ? "col-span-2" : ""}`}
    >
      <span className="min-w-0 leading-tight">{label}</span>
      <span className="shrink-0 tabular-nums rounded-full bg-white/25 px-2 py-0.5 text-[11px] font-bold">
        {count}
      </span>
    </button>
  );
}

function CornerTotal({ n, className }: { n: number; className: string }) {
  return (
    <span
      className={`absolute right-3 top-3 flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-bold text-white shadow ${className}`}
    >
      {n}
    </span>
  );
}

function SalesStageCard({
  titleTh,
  titleEn,
  total,
  icon: Icon,
  theme,
  children,
}: {
  titleTh: string;
  titleEn: string;
  total: number;
  icon: LucideIcon;
  theme: CardTheme;
  children?: ReactNode;
}) {
  const t = CARD_THEME[theme];
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm ring-1 ${t.shell}`}
    >
      <div
        className={`pointer-events-none absolute rounded-full blur-2xl ${t.blur}`}
        aria-hidden
      />
      <CornerTotal n={total} className={t.total} />
      <div className="mb-4 flex items-start gap-3 pr-14">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${t.iconBg}`}
        >
          <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 pt-0.5">
          <h2 className="text-lg font-bold text-slate-900">{titleTh}</h2>
          <p className="text-xs font-medium text-slate-500">{titleEn}</p>
        </div>
      </div>
      {children != null ? (
        <div className="relative grid grid-cols-2 gap-2.5 sm:gap-3">{children}</div>
      ) : (
        <p className="relative text-center text-sm text-slate-400">—</p>
      )}
    </section>
  );
}

export function SalesDeptDashboard() {
  const conn = useMnsConnection();
  const [qCounts, setQCounts] = useState({
    receive: 0,
    check: 0,
    salesInfo: 0,
    spare: 0,
    priceDone: 0,
  });

  useEffect(() => {
    if (!conn.ready || !conn.apiOk || !conn.db) return;
    let cancelled = false;
    (async () => {
      try {
        const [r1, r2, r3, r4, r5] = await Promise.all(
          [1, 2, 3, 4, 5].map((ws) =>
            mnsFetch<{ rows?: unknown[] }>(`/jobs?job_status=${ws}&limit=1000`)
          )
        );
        if (cancelled) return;
        setQCounts({
          receive: r1.rows?.length ?? 0,
          check: r2.rows?.length ?? 0,
          salesInfo: r3.rows?.length ?? 0,
          spare: r4.rows?.length ?? 0,
          priceDone: r5.rows?.length ?? 0,
        });
      } catch {
        if (!cancelled) {
          setQCounts({
            receive: 0,
            check: 0,
            salesInfo: 0,
            spare: 0,
            priceDone: 0,
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conn.ready, conn.apiOk, conn.db]);

  const [waitPoCounts, setWaitPoCounts] = useState({
    within60: 0,
    over60: 0,
  });

  useEffect(() => {
    if (!conn.ready || !conn.apiOk || !conn.db) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await mnsFetch<{ rows?: { modified?: string }[] }>(
          `/jobs?job_status=7&limit=1000`
        );
        if (cancelled) return;
        const rows = res.rows ?? [];
        let within60 = 0;
        let over60 = 0;
        for (const r of rows) {
          const days = waitPoDaysSinceModified(r.modified);
          if (days <= WAIT_PO_DAY_SPLIT) within60++;
          else over60++;
        }
        setWaitPoCounts({ within60, over60 });
      } catch {
        if (!cancelled) setWaitPoCounts({ within60: 0, over60: 0 });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conn.ready, conn.apiOk, conn.db]);

  const quotationTotal =
    qCounts.receive +
    qCounts.check +
    qCounts.salesInfo +
    qCounts.spare +
    qCounts.priceDone;

  return (
    <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
      <SalesStageCard
        titleTh="เสนอราคา"
        titleEn="Quotation"
        total={quotationTotal}
        icon={Settings}
        theme="violet"
      >
        <SubStatButton
          label="รับงาน"
          count={qCounts.receive}
          tone="red"
          to="/dept/sales/quotation/receive"
        />
        <SubStatButton
          label="ตรวจเช็ค"
          count={qCounts.check}
          tone="orange"
          to="/dept/sales/quotation/check"
        />
        <SubStatButton
          label="ขอข้อมูลฝ่ายขาย"
          count={qCounts.salesInfo}
          tone="purple"
          to="/dept/sales/quotation/sales-info"
        />
        <SubStatButton
          label="หาราคาอะไหล่"
          count={qCounts.spare}
          tone="teal"
          to="/dept/sales/quotation/spare-price"
        />
        <SubStatButton
          label="ราคาเสร็จสิ้น"
          count={qCounts.priceDone}
          tone="purple"
          to="/dept/sales/quotation/price-done"
        />
      </SalesStageCard>

      <SalesStageCard
        titleTh="รอ PO ลูกค้า"
        titleEn="Wait PO"
        total={waitPoCounts.within60 + waitPoCounts.over60}
        icon={Wrench}
        theme="teal"
      >
        <SubStatButton
          label="1-60 วัน"
          count={waitPoCounts.within60}
          tone="orange"
          to="/dept/sales/wait-po/within60"
        />
        <SubStatButton
          label="60+ วัน"
          count={waitPoCounts.over60}
          tone="red"
          to="/dept/sales/wait-po/over60"
        />
      </SalesStageCard>

      <SalesStageCard
        titleTh="ได้ PO"
        titleEn="Received PO"
        total={7}
        icon={LayoutGrid}
        theme="amber"
      >
        <SubStatButton
          label="PO มาแล้ว"
          count={2}
          tone="red"
          to="/dept/sales/po-arrived"
        />
        <SubStatButton
          label="ระบบสั่งซื้อ"
          count={3}
          tone="orange"
          to="/dept/sales/purchase-system"
        />
        <SubStatButton label="ของมาแล้ว" count={0} tone="purple" />
        <SubStatButton label="ดำเนินการผลิต" count={1} tone="teal" />
        <SubStatButton
          label="ซ่อมเสร็จแล้ว"
          count={1}
          tone="teal"
          wide
          to="/dept/sales/repair-completed"
        />
      </SalesStageCard>

      <SalesStageCard
        titleTh="ระบบทดสอบ"
        titleEn="Delivery"
        total={2}
        icon={Settings}
        theme="sky"
      >
        <SubStatButton label="ส่งของเทส" count={0} tone="purple" wide />
        <SubStatButton label="เทสไม่ผ่าน" count={0} tone="red" />
        <SubStatButton label="เทสผ่าน" count={2} tone="orange" />
      </SalesStageCard>

      <SalesStageCard
        titleTh="รอเก็บเงิน"
        titleEn="Wait Money"
        total={7}
        icon={Settings}
        theme="emerald"
      />

      <SalesStageCard
        titleTh="เคลม"
        titleEn="Claim"
        total={0}
        icon={Settings}
        theme="rose"
      />
    </div>
  );
}

const headerActionBtn =
  "inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white";

export function SalesDeptHeaderActions() {
  const navigate = useNavigate();
  const [openJobMenu, setOpenJobMenu] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openJobMenu) return;
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpenJobMenu(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openJobMenu]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative" ref={wrapRef}>
        <button
          type="button"
          aria-expanded={openJobMenu}
          aria-haspopup="menu"
          onClick={() => setOpenJobMenu((o) => !o)}
          className={headerActionBtn}
        >
          + เปิดใบงาน
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition ${openJobMenu ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
        {openJobMenu && (
          <div
            className="absolute right-0 top-full z-20 mt-1 min-w-[200px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-100"
            role="menu"
          >
            <button
              type="button"
              className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
              role="menuitem"
              onClick={() => {
                setOpenJobMenu(false);
                navigate("/dept/sales/work/job-sale");
              }}
            >
              ใบงานขาย
            </button>
            <button
              type="button"
              className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
              role="menuitem"
              onClick={() => {
                setOpenJobMenu(false);
                navigate("/dept/sales/work/job-repair");
              }}
            >
              ใบงานซ่อม
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        className={`${headerActionBtn} relative pr-3`}
        onClick={() => navigate("/dept/sales/requirements")}
      >
        ความต้องการฝ่ายขาย
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
          1
        </span>
      </button>
    </div>
  );
}
