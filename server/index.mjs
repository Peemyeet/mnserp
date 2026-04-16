import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import customers from "./routes/customers.mjs";
import jobs from "./routes/jobs.mjs";
import meta from "./routes/meta.mjs";
import reports from "./routes/reports.mjs";
import salesDashboard from "./routes/salesDashboard.mjs";
import users from "./routes/users.mjs";
import accounting from "./routes/accounting.mjs";
import store from "./routes/store.mjs";
import deptWork from "./routes/deptWork.mjs";
import approve from "./routes/approve.mjs";
import { closePool } from "./db.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "..", "dist");
const serveWeb = fs.existsSync(path.join(distPath, "index.html"));

const app = express();
const PORT = Number(process.env.PORT || process.env.MNS_API_PORT) || 8787;

const apiIndex = {
  name: "ERP MNS API (MySQL)",
  docs: [
    "GET  /api/health",
    "GET  /api/server-info",
    "GET  /api/legacy-tables",
    "GET  /api/stats",
    "GET  /api/customers",
    "POST /api/customers",
    "GET  /api/jobs",
    "POST /api/jobs",
    "PATCH /api/jobs/:jobId/stage",
    "GET  /api/workstatus",
    "GET  /api/sales/dashboard",
    "GET  /api/reports/sales",
    "GET  /api/reports/production",
    "GET  /api/reports/purchase",
    "GET  /api/reports/accounting",
    "GET  /api/accounting/work-summary",
    "GET  /api/approve/counts",
    "GET  /api/store/items?warehouse=spare|production|sales",
    "GET  /api/store/categories?warehouse=spare|production|sales",
    "POST /api/store/items",
    "GET  /api/dept-work/purchase-summary",
    "GET  /api/dept-work/production-summary",
    "GET  /api/users",
    "GET  /api/users/groups",
    "PATCH /api/users/:userId",
    "DELETE /api/users/:userId",
  ],
};

app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/server-info", (_req, res) => {
  res.json(serveWeb ? { ...apiIndex, web: "dist (SPA + /api same host)" } : apiIndex);
});

if (!serveWeb) {
  app.get("/", (_req, res) => {
    res.json(apiIndex);
  });
}

app.use("/api/customers", customers);
app.use("/api/jobs", jobs);
app.use("/api/users", users);
app.use("/api/sales", salesDashboard);
app.use("/api/reports", reports);
app.use("/api/accounting", accounting);
app.use("/api/approve", approve);
app.use("/api/store", store);
app.use("/api/dept-work", deptWork);
app.use("/api", meta);

if (serveWeb) {
  app.use(
    express.static(distPath, {
      index: "index.html",
      fallthrough: true,
    }),
  );
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ ok: false, message: "Not found" });
  }
  res.status(404).type("text").send("Not found");
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, message: err.message });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`MNS API listening on http://127.0.0.1:${PORT}`);
  if (serveWeb) console.log(`  Web: static from ${distPath} (รวมเส้นทาง SPA)`);
  console.log(`  DB: GET http://127.0.0.1:${PORT}/api/health (db: true = เชื่อม MySQL ได้ — mysql:// ใน server/.env)`);
  console.log(`  Vite dev: ตั้ง proxy /api → พอร์ตนี้ (ดู vite.config.ts)`);
});

async function shutdown() {
  await closePool().catch(() => {});
  server.close(() => process.exit(0));
}
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\nพอร์ต ${PORT} ถูกใช้งานอยู่แล้ว (มักเป็น API เก่าที่ยังรัน)\n` +
        `  แก้: ปิดเทอร์มินัลที่รัน node อยู่ หรือรัน  lsof -i :${PORT}  แล้ว  kill <PID>\n` +
        `  หรือตั้ง PORT / MNS_API_PORT=8788 ใน server/.env และ VITE_API_PROXY_TARGET=http://127.0.0.1:8788 ใน .env ที่รากโปรเจกต์\n`
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});
