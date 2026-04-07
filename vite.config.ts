import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

/**
 * - `vite` / dev: base `/` เปิดที่ localhost ได้ตรงๆ
 * - `vite build`: base `/<ชื่อ repo>/` — บน GitHub Actions ใช้ GITHUB_REPOSITORY อัตโนมัติ
 */
export default defineConfig(({ command, mode }) => {
  const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "mnserp";
  const base = command === "serve" ? "/" : `/${repo}/`;
  const env = loadEnv(mode, process.cwd(), "");
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET ?? "http://127.0.0.1:8787";

  /** ใช้ทั้ง dev และ preview — ไม่มี proxy ตอน preview จะทำให้ fetch `/api/*` ได้หน้า index.html (HTML แทน JSON) */
  const apiProxy: Record<string, import("vite").ProxyOptions> = {
    "/api": {
      target: apiProxyTarget,
      changeOrigin: true,
    },
  };

  return {
    plugins: [react()],
    base,
    server: {
      /** ตั้ง `VITE_API_PROXY_TARGET` ใน `.env` ที่รากโปรเจกต์ ให้ตรงกับ `MNS_API_PORT` ใน `server/.env` */
      proxy: apiProxy,
    },
    preview: {
      port: 4173,
      proxy: apiProxy,
    },
  };
});
