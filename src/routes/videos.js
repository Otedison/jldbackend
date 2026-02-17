const express = require("express");
const Video = require("../models/Video");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const items = await Video.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    return res.json({ data: items });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
