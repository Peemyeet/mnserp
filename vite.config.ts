import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** GitHub Pages แบบ project site: https://<user>.github.io/<repo>/ */
export default defineConfig({
  plugins: [react()],
  base: "/MNSrepoDEMO/",
});
