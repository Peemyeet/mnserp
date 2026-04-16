import { useCallback, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { DeptAccessGuard } from "./DeptAccessGuard";
import { MnsDbBanner } from "./MnsDbBanner";
import { SettingsModal } from "./SettingsModal";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  return (
    <div className="flex min-h-screen min-h-[100dvh]">
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-[2px] md:hidden"
          aria-label="ปิดเมนู"
          onClick={closeMobileNav}
        />
      )}

      <Sidebar
        mobileOpen={mobileNavOpen}
        onCloseMobile={closeMobileNav}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col md:min-h-screen">
        <header className="safe-area-pt sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-slate-200/80 bg-white/95 px-3 backdrop-blur-md md:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="touch-manipulation flex h-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm active:bg-slate-50"
            aria-expanded={mobileNavOpen}
            aria-label="เปิดเมนู"
          >
            <Menu className="h-6 w-6" strokeWidth={2} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              ERP MNS
            </p>
            <p className="truncate text-xs text-slate-500">แตะเมนูเพื่อไปหน้าอื่น</p>
          </div>
        </header>

        <MnsDbBanner />
        <DeptAccessGuard />
      </div>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
