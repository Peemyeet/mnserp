import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { PmUser } from "../types/pmUser";
import { loginWithPm } from "../services/pmAuthService";

const SESSION_KEY = "erp-mns-session";
const LEGACY_AUTH_KEY = "erp-mns-authenticated";

function readSession(): { user: PmUser; accessToken?: string } | null {
  try {
    sessionStorage.removeItem(LEGACY_AUTH_KEY);
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as {
      user?: PmUser;
      accessToken?: string;
    };
    if (!parsed?.user?.id || !parsed?.user?.username) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return { user: parsed.user, accessToken: parsed.accessToken };
  } catch {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    return null;
  }
}

type AuthContextValue = {
  user: PmUser | null;
  accessToken: string | undefined;
  isAuthenticated: boolean;
  /** คืน `null` เมื่อสำเร็จ, ข้อความเมื่อล้มเหลว */
  login: (username: string, password: string) => Promise<string | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initial = readSession();
  const [user, setUser] = useState<PmUser | null>(initial?.user ?? null);
  const [accessToken, setAccessToken] = useState<string | undefined>(
    initial?.accessToken
  );

  const login = useCallback(async (username: string, password: string) => {
    const result = await loginWithPm(username, password);
    if (!result.ok) {
      return result.message;
    }
    const { session } = result;
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      return "ไม่สามารถบันทึกเซสชันได้";
    }
    setUser(session.user);
    setAccessToken(session.accessToken);
    return null;
  }, []);

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(LEGACY_AUTH_KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
    setAccessToken(undefined);
  }, []);

  const isAuthenticated = user != null;

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated,
      login,
      logout,
    }),
    [user, accessToken, isAuthenticated, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
