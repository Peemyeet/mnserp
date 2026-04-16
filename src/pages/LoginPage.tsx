import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import { defaultHomePath } from "../auth/deptAccess";
import {
  AUTH_SESSION_STORAGE_KEY,
  useAuth,
} from "../context/AuthContext";
import type { PmUser } from "../types/pmUser";

function readSessionUser(): PmUser | null {
  try {
    const raw = sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { user?: PmUser };
    if (!parsed?.user?.id || !parsed?.user?.username) return null;
    return parsed.user;
  } catch {
    return null;
  }
}

function resolveAfterLogin(from: string, user: PmUser | null): string {
  if (from === "/" && user) return defaultHomePath(user);
  return from;
}

export function LoginPage() {
  const { isAuthenticated, login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const rawFrom = (location.state as { from?: string } | null)?.from;
  const from =
    typeof rawFrom === "string" && rawFrom.startsWith("/") ? rawFrom : "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    navigate(resolveAfterLogin(from, user), { replace: true });
  }, [isAuthenticated, user, from, navigate]);

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">
        กำลังเข้าสู่ระบบ…
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const err = await login(username.trim(), password);
      if (err) {
        setError(err);
        return;
      }
      const sessionUser = readSessionUser();
      navigate(resolveAfterLogin(from, sessionUser), { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-indigo-50/80 to-violet-100/90 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <span className="text-xl font-bold tracking-tight">M</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ERP MNS
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            เข้าสู่ระบบด้วยบัญชี project manager
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100/80 sm:p-8"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              ชื่อผู้ใช้
            </span>
            <div className="relative">
              <User
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-slate-900 shadow-inner outline-none ring-0 transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                placeholder="เช่น admin, sale, pm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    passwordInputRef.current?.focus();
                  }
                }}
              />
            </div>
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              รหัสผ่าน
            </span>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                ref={passwordInputRef}
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-slate-900 shadow-inner outline-none ring-0 transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                placeholder="กรอกรหัสผ่าน"
              />
            </div>
          </label>

          {error && (
            <p
              className="mt-3 text-sm font-medium text-rose-600"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
          ข้อมูลผู้ใช้และงานจะอ้างอิงจากฐานข้อมูล project manager เมื่อตั้งค่า{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] text-slate-700">
            VITE_PM_API_BASE_URL
          </code>
        </p>
      </div>
    </div>
  );
}
