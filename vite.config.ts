import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** GitHub Pages แบบ project site: https://<user>.github.io/mnserp/ */
export default defineConfig({
  plugins: [react()],
  base: "/mnserp/",
});
