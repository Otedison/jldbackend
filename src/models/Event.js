const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    coverImageUrl: { type: String },
    venue: { type: String },
    isVirtual: { type: Boolean, default: false },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date },
    registrationUrl: { type: String },
    capacity: { type: Number },
    status: { type: String, enum: ["scheduled", "cancelled", "completed"], default: "scheduled", index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
