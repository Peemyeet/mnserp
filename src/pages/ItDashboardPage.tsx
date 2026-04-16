import { Link, useNavigate } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ItTicketsTable } from "../components/it/ItTicketsTable";
import type { ItTicket } from "../types/itTicket";
export function ItDashboardPage() {
  const navigate = useNavigate();
  const pieSlices: { name: string; value: number; color: string }[] = [];
  const pieLegend: { name: string; color: string; pct: number }[] = [];
  const emptyTickets: ItTicket[] = [];

  return (
    <div className="min-h-full bg-slate-100/80">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Dashboard IT
        </h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              navigate("/it/report", { state: { openReportModal: true } })
            }
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
          >
            Report
          </button>
          <Link
            to="/it/report"
            state={{ openReportModal: true }}
            className="inline-flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm no-underline hover:bg-red-600"
          >
            แจ้งปัญหา
          </Link>
        </div>
      </header>

      <div className="p-4 sm:p-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {pieSlices.length === 0 ? (
            <p className="py-20 text-center text-sm text-slate-500">
              ยังไม่มีสถิติตั๋ว — ข้อมูลจะมาจากระบบแจ้งปัญหาเมื่อมีการบันทึกจริง
            </p>
          ) : (
            <>
              <div className="h-[320px] w-full sm:h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieSlices}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={72}
                      outerRadius={118}
                      paddingAngle={2}
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(1)}%`
                      }
                    >
                      {pieSlices.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, "สัดส่วน"]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <ul className="mx-auto mt-4 grid max-w-xl gap-2 sm:grid-cols-2">
                {pieLegend.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2 font-medium text-slate-800">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full ring-2 ring-white"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </span>
                    <span className="tabular-nums text-slate-600">
                      {item.pct.toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="mx-auto mt-8 grid max-w-[1400px] gap-6 lg:grid-cols-2">
          <ItTicketsTable
            titleTh="แผนก ขาย"
            rows={emptyTickets}
            emptyPlaceholderRow
          />
          <ItTicketsTable titleTh="แผนก SUPPORT" rows={emptyTickets} />
        </div>

        <div className="mx-auto mt-6 grid max-w-[1400px] gap-6 lg:grid-cols-2">
          <ItTicketsTable titleTh="แผนก ออฟฟิศ" rows={emptyTickets} />
          <ItTicketsTable titleTh="แผนก ผลิต" rows={emptyTickets} />
        </div>
      </div>
    </div>
  );
}
