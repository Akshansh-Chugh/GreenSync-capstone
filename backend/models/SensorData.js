const mongoose = require("mongoose");

const sensorDataSchema = new mongoose.Schema(
  {
    potId: {
      type: Number,
      required: true,
      index: true,
    },
    potName: {
      type: String,
      default: "",
    },
    temperature: {
      type: Number,
      required: true,
    },
    moisture: {
      type: Number,
      required: true,
    },
    humidity: {
      type: Number,
      required: true,
    },
    nitrogen: {
      type: Number,
      default: 0,
    },
    phosphorus: {
      type: Number,
      default: 0,
    },
    potassium: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Index for fast time-range queries per pot
sensorDataSchema.index({ potId: 1, createdAt: -1 });

module.exports = mongoose.model("SensorData", sensorDataSchema);
