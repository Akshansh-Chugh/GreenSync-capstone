const mongoose = require("mongoose");

const potSchema = new mongoose.Schema(
  {
    potId: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "🌱",
    },
    autoWater: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pot", potSchema);
