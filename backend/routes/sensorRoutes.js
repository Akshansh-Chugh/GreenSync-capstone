const express = require("express");
const router = express.Router();
const SensorData = require("../models/SensorData");
const Pot = require("../models/Pot");

// ─── Middleware: verify ESP API key ───
const verifyEspKey = (req, res, next) => {
  const key = req.headers["x-api-key"];
  if (!key || key !== process.env.ESP_API_KEY) {
    return res.status(401).json({ error: "Unauthorized – invalid API key" });
  }
  next();
};

// ─── POST /api/sensor-data ───
// ESP32 sends sensor readings here
router.post("/sensor-data", verifyEspKey, async (req, res) => {
  try {
    const { potId, potName, temperature, moisture, humidity, nitrogen, phosphorus, potassium } = req.body;

    if (potId == null || temperature == null || moisture == null || humidity == null) {
      return res.status(400).json({ error: "Missing required fields: potId, temperature, moisture, humidity" });
    }

    const reading = await SensorData.create({
      potId,
      potName: potName || "",
      temperature,
      moisture,
      humidity,
      nitrogen: nitrogen || 0,
      phosphorus: phosphorus || 0,
      potassium: potassium || 0,
    });

    // Upsert pot record
    await Pot.findOneAndUpdate(
      { potId },
      { potId, name: potName || `Pot ${potId}`, $setOnInsert: { icon: "🌱", autoWater: false } },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, id: reading._id });
  } catch (err) {
    console.error("POST /sensor-data error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/pots ───
// Dashboard fetches list of all pots with latest readings
router.get("/pots", async (req, res) => {
  try {
    const pots = await Pot.find().lean();
    const result = [];

    for (const pot of pots) {
      // Latest reading
      const latest = await SensorData.findOne({ potId: pot.potId })
        .sort({ createdAt: -1 })
        .lean();

      // Last 7 readings for chart
      const history = await SensorData.find({ potId: pot.potId })
        .sort({ createdAt: -1 })
        .limit(7)
        .lean();

      const chartData = history.reverse();

      result.push({
        id: pot.potId,
        name: pot.name,
        icon: pot.icon,
        autoWater: pot.autoWater,
        temp: latest?.temperature ?? 0,
        moisture: latest?.moisture ?? 0,
        humidity: latest?.humidity ?? 0,
        nitrogen: latest?.nitrogen ?? 0,
        phosphorus: latest?.phosphorus ?? 0,
        potassium: latest?.potassium ?? 0,
        chartLabels: chartData.map((d) =>
          new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        ),
        chartMoisture: chartData.map((d) => d.moisture),
        chartTemp: chartData.map((d) => d.temperature),
        chartHumidity: chartData.map((d) => d.humidity),
      });
    }

    res.json(result);
  } catch (err) {
    console.error("GET /pots error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/pots/:potId ───
// Dashboard fetches single pot detail
router.get("/pots/:potId", async (req, res) => {
  try {
    const potId = Number(req.params.potId);
    const pot = await Pot.findOne({ potId }).lean();
    if (!pot) return res.status(404).json({ error: "Pot not found" });

    const latest = await SensorData.findOne({ potId }).sort({ createdAt: -1 }).lean();
    const history = await SensorData.find({ potId }).sort({ createdAt: -1 }).limit(7).lean();
    const chartData = history.reverse();

    res.json({
      id: pot.potId,
      name: pot.name,
      icon: pot.icon,
      autoWater: pot.autoWater,
      temp: latest?.temperature ?? 0,
      moisture: latest?.moisture ?? 0,
      humidity: latest?.humidity ?? 0,
      nitrogen: latest?.nitrogen ?? 0,
      phosphorus: latest?.phosphorus ?? 0,
      potassium: latest?.potassium ?? 0,
      chartLabels: chartData.map((d) =>
        new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      ),
      chartMoisture: chartData.map((d) => d.moisture),
      chartTemp: chartData.map((d) => d.temperature),
      chartHumidity: chartData.map((d) => d.humidity),
    });
  } catch (err) {
    console.error("GET /pots/:potId error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/pots/:potId/water ───
// Dashboard triggers water pump
router.post("/pots/:potId/water", async (req, res) => {
  try {
    const potId = Number(req.params.potId);
    // In production, this would send a command to ESP32 via MQTT or stored command queue
    console.log(`💧 Water pump activated for pot ${potId}`);
    res.json({ success: true, message: `Water pump activated for pot ${potId}` });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PATCH /api/pots/:potId/auto-water ───
// Toggle auto-water setting
router.patch("/pots/:potId/auto-water", async (req, res) => {
  try {
    const potId = Number(req.params.potId);
    const { autoWater } = req.body;
    const pot = await Pot.findOneAndUpdate({ potId }, { autoWater }, { new: true });
    if (!pot) return res.status(404).json({ error: "Pot not found" });
    res.json({ success: true, autoWater: pot.autoWater });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
