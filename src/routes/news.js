const express = require("express");
const Blog = require("../models/Blog");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 20, 100);

    const items = await Blog.find({
      status: "published",
      contentType: { $in: ["news", "story", "blog"] },
    })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ data: items });
  } catch (error) {
    next(error);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const item = await Blog.findOne({
      slug: req.params.slug,
      status: "published",
      contentType: { $in: ["news", "story", "blog"] },
    }).lean();

    if (!item) return res.status(404).json({ message: "News item not found" });
    return res.json({ data: item });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
