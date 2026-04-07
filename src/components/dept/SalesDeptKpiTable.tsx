import { useMemo } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  canSeeAllSalesKpi,
  getSalesKpiRowsForUser,
} from "../../auth/salesKpiAccess";
import { useAuth } from "../../context/AuthContext";
import type { SalesPersonKpiRow } from "../../data/salesKpiSeed";

export type LiveSalesKpiRow = {
  user_id: number;
  name: string;
  targetBaht: number;
  actualBaht: number;
};

function formatBaht(n: number) {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 0 });
}

function computeKpi(row: SalesPersonKpiRow) {
  const { targetBaht, actualBaht } = row;
  if (targetBaht <= 0) {
    return {
      met: true,
      progressPct: 100,
      shortfallBaht: 0,
      shortfallPctOfTarget: 0,
    };
  }
  const met = actualBaht >= targetBaht;
  const progressPct = (actualBaht / targetBaht) * 100;
  const shortfallBaht = Math.max(0, targetBaht - actualBaht);
  const shortfallPctOfTarget = (shortfallBaht / targetBaht) * 100;
  return { met, progressPct, shortfallBaht, shortfallPctOfTarget };
}

function mapLiveToSeed(live: LiveSalesKpiRow[]): SalesPersonKpiRow[] {
  return live.map((k) => ({
    id: `db-${k.user_id}`,
    linkedUserId: "",
    name: k.name,
    targetBaht: k.targetBaht,
    actualBaht: k.actualBaht,
  }));
}

export function SalesDeptKpiTable({
  liveKpi,
}: {
  /** ถ้าเป็น `undefined` ใช้ seed — ถ้าเป็น array จาก API ใช้ข้อมูลจริง */
  liveKpi?: LiveSalesKpiRow[] | undefined;
}) {
  const { user } = useAuth();
  const rows = useMemo(() => {
    if (liveKpi !== undefined) return mapLiveToSeed(liveKpi);
    return getSalesKpiRowsForUser(user);
  }, [liveKpi, user]);
  const showAll = canSeeAllSalesKpi(user);
  const fromDb = liveKpi !== undefined;

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        {fromDb ? (
          <>
            แสดง KPI จากฐานข้อมูล (bill_quota รวมตามผู้ใช้)
            {showAll ? " — ภาพรวมทุกคนที่มียอด" : " — เฉพาะบัญชีของคุณ"}
          </>
        ) : showAll ? (
          <>
            สิทธิ์ผู้ดูแลภาพรวม — แสดง KPI ของพนักขายทุกคน (หน้า{" "}
            <strong className="text-slate-800">ทำงาน</strong> และกราฟด้านบนยังเป็นภาพรวมทั้งแผนก)
          </>
        ) : (
          <>
            แสดงเฉพาะ KPI ของบัญชีที่เข้าสู่ระบบ (
            <span className="font-medium text-slate-800">
              {user?.displayNameTh ?? user?.username}
            </span>
            ) — ภาพรวมแผนกดูได้ที่กราฟ &quot;ภาพรวมยอดขาย&quot; ด้านบน
          </>
        )}
      </p>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-violet-50/90 text-slate-800">
              <th className="whitespace-nowrap px-4 py-3 font-semibold">
                พนักขาย
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-right">
                เป้าหมาย (บาท)
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-right">
                ยอดทำได้ (บาท)
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-right">
                % เทียบเป้า
              </th>
              <th className="whitespace-nowrap px-4 py-3 font-semibold">
                ถึงเป้า
              </th>
              <th className="min-w-[200px] px-4 py-3 font-semibold">
                ขาดอีก (ถ้ายังไม่ถึงเป้า)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  ไม่พบข้อมูล KPI สำหรับบัญชีนี้ หรือยังไม่ได้ผูกเป้ากับผู้ใช้ในระบบ
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const { met, progressPct, shortfallBaht, shortfallPctOfTarget } =
                  computeKpi(row);
                return (
                  <tr key={row.id} className="bg-white hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                      {row.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-700">
                      {formatBaht(row.targetBaht)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-700">
                      {formatBaht(row.actualBaht)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums font-medium text-slate-800">
                      {progressPct.toLocaleString("th-TH", {
                        maximumFractionDigits: 1,
                        minimumFractionDigits: 0,
                      })}
                      %
                    </td>
                    <td className="px-4 py-3">
                      {met ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
                          <CheckCircle2
                            className="h-4 w-4 shrink-0"
                            aria-hidden
                          />
                          ถึงเป้า
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700">
                          <XCircle className="h-4 w-4 shrink-0" aria-hidden />
                          ยังไม่ถึงเป้า
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {met ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <span>
                          เหลืออีก{" "}
                          <span className="font-semibold text-violet-700">
                            {shortfallPctOfTarget.toLocaleString("th-TH", {
                              maximumFractionDigits: 1,
                              minimumFractionDigits: 0,
                            })}
                            %
                          </span>{" "}
                          ของเป้า{" "}
                          <span className="text-slate-500">(</span>
                          <span className="font-semibold text-slate-900">
                            {formatBaht(shortfallBaht)}
                          </span>
                          <span className="text-slate-500"> บาท)</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
