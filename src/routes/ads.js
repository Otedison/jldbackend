const express = require("express");
const Advertisement = require("../models/Advertisement");

const router = express.Router();

router.get("/homepage", async (_req, res, next) => {
  try {
    const now = new Date();
    const item = await Advertisement.findOne({
      placement: "homepage-sidebar",
      isActive: true,
      $or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }],
      $and: [{ $or: [{ endsAt: { $exists: false } }, { endsAt: null }, { endsAt: { $gte: now } }] }],
    })
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({ data: item || null });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
