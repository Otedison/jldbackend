const mongoose = require("mongoose");

const resourceDownloadSchema = new mongoose.Schema(
  {
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true, index: true },
    email: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    downloadedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

module.exports = mongoose.model("ResourceDownload", resourceDownloadSchema);
