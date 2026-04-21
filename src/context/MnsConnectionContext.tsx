import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getMnsConnection,
  type MnsHealthDbDebug,
} from "../services/mnsApi";

export type MnsConnectionState = {
  /** โหลด /health ครั้งแรกเสร็จแล้ว */
  ready: boolean;
  /** มี response จาก API (ไม่ใช่ network error / HTML ผิดพลาด) */
  apiOk: boolean;
  /** การ query ใน /health ผ่าน (MySQL) */
  db: boolean;
  message?: string;
  /** เมื่อ db ล้มเหลว — สรุป user/แหล่งค่า (ไม่มีรหัสผ่าน) */
  dbDebug?: MnsHealthDbDebug;
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
        dbDebug: c.dbDebug,
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
