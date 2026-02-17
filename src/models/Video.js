const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    videoUrl: { type: String, required: true, trim: true },
    thumbnailUrl: { type: String, trim: true },
    description: { type: String, trim: true },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

videoSchema.index({ title: 1 });

module.exports = mongoose.model("Video", videoSchema);
