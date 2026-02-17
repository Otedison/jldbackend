const express = require("express");
const Blog = require("../models/Blog");

const router = express.Router();

function normalizeLimit(value, fallback = 20) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, 100);
}

router.get("/", async (req, res, next) => {
  try {
    const { status = "published", type, search } = req.query;
    const limit = normalizeLimit(req.query.limit, 20);

    const query = {};
    if (status && status !== "all") query.status = status;
    if (type && type !== "all") query.contentType = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    const items = await Blog.find(query)
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
    const item = await Blog.findOne({ slug: req.params.slug }).lean();
    if (!item) return res.status(404).json({ message: "Blog not found" });
    return res.json({ data: item });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
