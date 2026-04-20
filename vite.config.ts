import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

/**
 * - dev (`vite`): base `/`
 * - build: ค่าเริ่มต้น `/pm2026/` — override ด้วย `VITE_BASE` หรือ (ใน CI) `GITHUB_REPOSITORY`
 */
function viteBase(command: string, envBase: string | undefined, repo: string): string {
  if (command === "serve") return "/";
  const raw = envBase?.trim();
  if (raw) {
    let b = raw.startsWith("/") ? raw : `/${raw}`;
    if (b !== "/" && !b.endsWith("/")) b += "/";
    return b;
  }
  if (process.env.GITHUB_REPOSITORY) return `/${repo}/`;
  return "/pm2026/";
}

export default defineConfig(({ command, mode }) => {
  const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "mnserp";
  const env = loadEnv(mode, process.cwd(), "");
  const base = viteBase(command, env.VITE_BASE, repo);
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET ?? "http://127.0.0.1:3000";

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
