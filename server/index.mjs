import cors from "cors";
import express from "express";
import customers from "./routes/customers.mjs";
import jobs from "./routes/jobs.mjs";
import meta from "./routes/meta.mjs";
import reports from "./routes/reports.mjs";
import salesDashboard from "./routes/salesDashboard.mjs";
import users from "./routes/users.mjs";

const app = express();
const PORT = Number(process.env.MNS_API_PORT) || 8787;

app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
  res.json({
    name: "ERP MNS — MySQL API",
    docs: [
      "GET  /api/health",
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
      "GET  /api/users",
      "GET  /api/users/groups",
      "PATCH /api/users/:userId",
      "DELETE /api/users/:userId",
    ],
  });
});

app.use("/api/customers", customers);
app.use("/api/jobs", jobs);
app.use("/api/users", users);
app.use("/api/sales", salesDashboard);
app.use("/api/reports", reports);
app.use("/api", meta);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ ok: false, message: err.message });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`MNS API listening on http://127.0.0.1:${PORT}`);
  console.log(`  MySQL: GET http://127.0.0.1:${PORT}/api/health (db: true = เชื่อมต่อได้)`);
  console.log(`  Vite dev: ตั้ง proxy /api → พอร์ตนี้ (ดู vite.config.ts)`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\nพอร์ต ${PORT} ถูกใช้งานอยู่แล้ว (มักเป็น API เก่าที่ยังรัน)\n` +
        `  แก้: ปิดเทอร์มินัลที่รัน node อยู่ หรือรัน  lsof -i :${PORT}  แล้ว  kill <PID>\n` +
        `  หรือตั้ง MNS_API_PORT=8788 ใน server/.env และ VITE_API_PROXY_TARGET=http://127.0.0.1:8788 ใน .env ที่รากโปรเจกต์\n`
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});
