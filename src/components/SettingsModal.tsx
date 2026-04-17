import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Settings, X, Hexagon } from "lucide-react";
import { allowedDepartmentIds, hasFullDepartmentAccess } from "../auth/deptAccess";
import { useAuth } from "../context/AuthContext";

type SettingRow = {
  th: string;
  en: string;
  highlightTh?: boolean;
  route?: string;
  iconTone?: "teal" | "yellow" | "rose";
};

const settingItems: SettingRow[] = [
  {
    th: "ตั้งค่าลูกค้า",
    en: "Customer Setting",
    highlightTh: true,
    route: "/settings/customers",
  },
  {
    th: "ตั้งค่าผู้ใช้",
    en: "User Setting",
    route: "/settings/users",
  },
  { th: "ตั้งค่าบัตรเครดิต", en: "Credit Setting" },
  {
    th: "ตั้งค่าฝ่าย",
    en: "Group Setting",
    route: "/settings/divisions",
  },
  {
    th: "ตั้งค่าแผนก",
    en: "Department Setting",
    route: "/settings/department-units",
  },
  { th: "ตั้งค่าประเภทงาน", en: "Groupwork Setting" },
  { th: "ตั้งค่าสถานะของงาน", en: "Statuswork Setting" },
  {
    th: "ตั้งค่าคลังสินค้า",
    en: "Warehouse (อะไหล่ / ผลิต / ขาย)",
    route: "/settings/warehouses",
  },
  {
    th: "ตั้งค่าชื่อบริษัท",
    en: "Name Company Setting",
    route: "/settings/company-names",
  },
];

const manageItems: SettingRow[] = [
  { th: "จัดการรถ", en: "ManageCar" },
  { th: "Organization & Workflow", en: "Organization & Workflow" },
  {
    th: "จัดการเป้าหมาย ขาย",
    en: "Manage Sale target",
    highlightTh: true,
  },
  {
    th: "จัดการตำแหน่งและ Organize",
    en: "Manage Position And Organize",
  },
  {
    th: "ผังบัญชี",
    en: "Chart Of Account",
    route: "/settings/chart-of-accounts",
  },
];

export function SettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [openAccountingSection, setOpenAccountingSection] = useState("");
  const { user } = useAuth();
  const userDeptIds = user ? allowedDepartmentIds(user) : [];
  const isSalesOnlyUser =
    user != null &&
    !hasFullDepartmentAccess(user) &&
    userDeptIds.length === 1 &&
    userDeptIds[0] === "sales";
  const isAccountingOnlyUser =
    user != null &&
    !hasFullDepartmentAccess(user) &&
    userDeptIds.length === 1 &&
    userDeptIds[0] === "accounting";
  const salesOnlyItems: SettingRow[] = [
    {
      th: "ตั้งค่าลูกค้า",
      en: "Customer Setting",
      highlightTh: true,
      route: "/settings/customers",
    },
    {
      th: "ตั้งค่า Sale target",
      en: "Sale target Setting",
      highlightTh: true,
    },
  ];
  const accountingOnlyItems: SettingRow[] = [
    {
      th: "บัญชีเจ้าหนี้ (ที่เราต้องจ่าย)",
      en: "System",
      iconTone: "yellow",
      route: "/settings/accounting-payables",
    },
    {
      th: "บัญชีลูกหนี้ (ที่เรารับเงิน)",
      en: "System",
      iconTone: "rose",
    },
    {
      th: "ระบบผังบัญชี",
      en: "Chart of Accounts",
      iconTone: "rose",
      route: "/settings/chart-of-accounts",
    },
  ];
  const accountingAssetSubItems = ["- การจัดการรถยนต์"];
  const accountingAssetItem: SettingRow = {
    th: "การจัดการรถยนต์",
    en: "System",
    iconTone: "rose",
  };
  const visibleSettingItems = isSalesOnlyUser
    ? salesOnlyItems
    : isAccountingOnlyUser
      ? accountingOnlyItems
      : settingItems;
  const visibleManageItems =
    isSalesOnlyUser || isAccountingOnlyUser ? [] : manageItems;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (open) setOpenAccountingSection("");
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/35 backdrop-blur-[2px]"
        aria-label="ปิดหน้าต่าง"
        onClick={onClose}
      />
      <div className="relative flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-5 sm:py-4">
          <h2
            id="settings-modal-title"
            className="text-lg font-semibold tracking-tight text-slate-800"
          >
            Setting
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
            aria-label="ปิด"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-1">
          <div className="px-3 pb-2 pt-1 sm:px-4">
            <p className="border-b border-slate-100 py-3 text-sm font-semibold text-violet-600">
              ตั้งค่า
            </p>
            {isAccountingOnlyUser ? (
              <div className="divide-y divide-slate-200">
                {[
                  { id: "store", title: "ตั้งค่าร้านค้า", item: accountingOnlyItems[0] },
                  { id: "asset", title: "ทะเบียนทรัพย์สิน", item: accountingAssetItem },
                  { id: "customer", title: "ตั้งค่าลูกค้า", item: accountingOnlyItems[1] },
                  { id: "coa", title: "ระบบผังบัญชี", item: accountingOnlyItems[2] },
                ].map((section) => (
                  <div key={section.id} className="py-2">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenAccountingSection((prev) =>
                          prev === section.id ? "" : section.id
                        )
                      }
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1.5 text-left transition hover:bg-slate-50"
                    >
                      <span className="text-xl font-semibold text-violet-500 sm:text-2xl">
                        {section.title}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 text-slate-400 transition ${
                          openAccountingSection === section.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-200 ${
                        openAccountingSection === section.id
                          ? "mt-1 grid-rows-[1fr]"
                          : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        {section.id === "asset" ? (
                          <div className="px-1 pb-1 pt-0.5">
                            {accountingAssetSubItems.map((sub) => (
                              <p
                                key={sub}
                                className="text-lg font-medium leading-snug text-violet-500 sm:text-xl"
                              >
                                {sub}
                              </p>
                            ))}
                            <button
                              type="button"
                              disabled={!section.item.route}
                              onClick={() => {
                                if (section.item.route) {
                                  navigate(section.item.route);
                                  onClose();
                                }
                              }}
                              className="mt-2 flex w-full items-start gap-3 rounded-xl py-2 pl-1 pr-2 text-left transition hover:bg-slate-50/90 disabled:cursor-default"
                            >
                              <span
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-50/80 sm:h-12 sm:w-12"
                                aria-hidden
                              >
                                <Settings
                                  className={`h-5 w-5 ${
                                    section.item.iconTone === "yellow"
                                      ? "text-amber-500"
                                      : section.item.iconTone === "rose"
                                        ? "text-rose-500"
                                        : "text-teal-500"
                                  }`}
                                  strokeWidth={2}
                                />
                              </span>
                              <span className="min-w-0 pt-0.5">
                                <span className="block text-lg font-medium leading-snug text-slate-700 sm:text-xl">
                                  {section.item.th}
                                </span>
                                <span className="mt-0.5 block text-sm text-slate-400 sm:text-base">
                                  {section.item.en}
                                </span>
                              </span>
                            </button>
                          </div>
                        ) : section.item ? (
                          <button
                            type="button"
                            disabled={!section.item.route}
                            onClick={() => {
                              if (section.item.route) {
                                navigate(section.item.route);
                                onClose();
                              }
                            }}
                            className="flex w-full items-start gap-3 rounded-xl py-2 pl-1 pr-2 text-left transition hover:bg-slate-50/90 disabled:cursor-default"
                          >
                            <span
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-50/80 sm:h-12 sm:w-12"
                              aria-hidden
                            >
                              <Settings
                                className={`h-5 w-5 ${
                                  section.item.iconTone === "yellow"
                                    ? "text-amber-500"
                                    : section.item.iconTone === "rose"
                                      ? "text-rose-500"
                                      : "text-teal-500"
                                }`}
                                strokeWidth={2}
                              />
                            </span>
                            <span className="min-w-0 pt-0.5">
                              <span className="block text-lg font-medium leading-snug text-slate-700 sm:text-xl">
                                {section.item.th}
                              </span>
                              <span className="mt-0.5 block text-sm text-slate-400 sm:text-base">
                                {section.item.en}
                              </span>
                            </span>
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {visibleSettingItems.map((item) => (
                  <li key={item.th}>
                    <button
                      type="button"
                      onClick={() => {
                        if (item.route) {
                          navigate(item.route);
                          onClose();
                        }
                      }}
                      className="flex w-full items-start gap-3 py-3.5 pl-1 pr-2 text-left transition hover:bg-slate-50/90"
                    >
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-50/80"
                        aria-hidden
                      >
                        <Settings
                          className="h-[18px] w-[18px] text-teal-500"
                          strokeWidth={2}
                        />
                      </span>
                      <span className="min-w-0 pt-0.5">
                        <span
                          className={`block text-[15px] font-medium leading-snug ${
                            item.highlightTh
                              ? "text-violet-600"
                              : "text-slate-700"
                          }`}
                        >
                          {item.th}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-400">
                          {item.en}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {visibleManageItems.length > 0 ? (
            <div className="px-4 pb-4">
              <p className="border-b border-t border-slate-100 py-3 text-sm font-semibold text-violet-600">
                จัดการ
              </p>
              <ul className="divide-y divide-slate-100">
                {visibleManageItems.map((item) => (
                  <li key={item.th}>
                    <button
                      type="button"
                      onClick={() => {
                        if (item.route) {
                          navigate(item.route);
                          onClose();
                        }
                      }}
                      className="flex w-full items-start gap-3 py-3.5 pl-1 pr-2 text-left transition hover:bg-slate-50/90"
                    >
                      <span
                        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50/80"
                        aria-hidden
                      >
                        <Hexagon
                          className="h-[18px] w-[18px] text-teal-500"
                          strokeWidth={2}
                        />
                        <span className="absolute h-1 w-1 rounded-full bg-white ring-1 ring-teal-500/30" />
                      </span>
                      <span className="min-w-0 pt-0.5">
                        <span
                          className={`block text-[15px] font-medium leading-snug ${
                            item.highlightTh
                              ? "text-violet-600"
                              : "text-slate-700"
                          }`}
                        >
                          {item.th}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-400">
                          {item.en}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
