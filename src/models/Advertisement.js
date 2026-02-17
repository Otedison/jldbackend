const mongoose = require("mongoose");

const advertisementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    targetUrl: { type: String },
    altText: { type: String },
    placement: { type: String, enum: ["homepage-sidebar"], default: "homepage-sidebar", index: true },
    isActive: { type: Boolean, default: true, index: true },
    startsAt: { type: Date },
    endsAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Advertisement", advertisementSchema);
