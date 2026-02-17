const express = require("express");
const mongoose = require("mongoose");
const Resource = require("../models/Resource");
const ResourceDownload = require("../models/ResourceDownload");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 100, 200);

    const query = { isPublished: true };
    if (category && category !== "all") query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const items = await Resource.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ data: items });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/download", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid resource id" });
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const ipAddress = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "";

    await ResourceDownload.create({
      resourceId: resource._id,
      email: req.body?.email || null,
      ipAddress,
      userAgent: req.headers["user-agent"] || "",
      downloadedAt: new Date(),
    });

    resource.downloadCount += 1;
    await resource.save();

    return res.json({ data: { id: resource.id, downloadCount: resource.downloadCount } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
