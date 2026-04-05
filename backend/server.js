require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const sensorRoutes = require("./routes/sensorRoutes.js");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───
app.use(cors());
app.use(express.json());

// ─── Routes ───
app.use("/api", sensorRoutes);

// ─── Health check ───
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Start ───
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🌿 GreenSync API running on http://localhost:${PORT}`);
  });
});
