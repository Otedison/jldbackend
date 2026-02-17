const express = require("express");
const TeamMember = require("../models/TeamMember");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const members = await TeamMember.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    return res.json({ data: members });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
