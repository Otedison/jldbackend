const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String },
    content: { type: String, required: true },
    coverImageUrl: { type: String },
    authorName: { type: String, required: true },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
    contentType: { type: String, enum: ["news", "blog", "story"], default: "blog", index: true },
    publishedAt: { type: Date, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
