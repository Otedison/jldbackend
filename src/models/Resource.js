const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    category: { type: String, index: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSizeBytes: { type: Number },
    isPublished: { type: Boolean, default: true, index: true },
    downloadCount: { type: Number, default: 0 },
    language: { type: String, default: "English" },
    publishedYear: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);
