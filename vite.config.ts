import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * - `vite` / dev: base `/` เปิดที่ localhost ได้ตรงๆ
 * - `vite build`: base `/<ชื่อ repo>/` — บน GitHub Actions ใช้ GITHUB_REPOSITORY อัตโนมัติ
 */
export default defineConfig(({ command }) => {
  const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "mnserp";
  const base = command === "serve" ? "/" : `/${repo}/`;

  return {
    plugins: [react()],
    base,
  };
});
