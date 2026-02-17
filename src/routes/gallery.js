const express = require("express");
const GalleryItem = require("../models/GalleryItem");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const items = await GalleryItem.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    return res.json({ data: items });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
