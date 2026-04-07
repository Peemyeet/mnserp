import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getMnsConnection } from "../services/mnsApi";

export type MnsConnectionState = {
  /** โหลด /health ครั้งแรกเสร็จแล้ว */
  ready: boolean;
  /** มี response จาก API (ไม่ใช่ network error / HTML ผิดพลาด) */
  apiOk: boolean;
  /** MySQL query ใน /health ผ่าน */
  db: boolean;
  message?: string;
};

const defaultState: MnsConnectionState = {
  ready: false,
  apiOk: false,
  db: false,
};

const MnsConnectionContext = createContext<MnsConnectionState>(defaultState);

export function MnsConnectionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MnsConnectionState>(defaultState);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = await getMnsConnection();
      if (cancelled) return;
      setState({
        ready: true,
        apiOk: c.apiOk,
        db: c.db,
        message: c.healthMessage,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => state, [state]);

  return (
    <MnsConnectionContext.Provider value={value}>
      {children}
    </MnsConnectionContext.Provider>
  );
}

export function useMnsConnection() {
  return useContext(MnsConnectionContext);
}
