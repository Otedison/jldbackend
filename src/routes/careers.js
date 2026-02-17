const express = require("express");
const Career = require("../models/Career");
const CareerApplication = require("../models/CareerApplication");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { status = "open" } = req.query;
    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 50, 100);
    const query = status === "all" ? {} : { status };

    const items = await Career.find(query)
      .sort({ deadline: 1, createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ data: items });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const item = await Career.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ message: "Career not found" });
    return res.json({ data: item });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/apply", async (req, res, next) => {
  try {
    const career = await Career.findById(req.params.id).lean();
    if (!career) return res.status(404).json({ message: "Career not found" });
    if (career.status !== "open") return res.status(400).json({ message: "Applications are closed for this role" });
    if (career.deadline && new Date(career.deadline).getTime() < Date.now()) {
      return res.status(400).json({ message: "Application deadline has passed" });
    }

    const fullName = String(req.body?.fullName || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const phone = String(req.body?.phone || "").trim();
    const county = String(req.body?.county || "").trim();
    const cvUrl = String(req.body?.cvUrl || "").trim();
    const coverLetter = String(req.body?.coverLetter || "").trim();

    if (!fullName) return res.status(400).json({ message: "Full name is required" });
    if (!email || !email.includes("@")) return res.status(400).json({ message: "A valid email is required" });
    if (!phone) return res.status(400).json({ message: "Phone number is required" });

    const application = await CareerApplication.create({
      career: career._id,
      careerTitle: career.title,
      careerReferenceNumber: career.referenceNumber || "",
      fullName,
      email,
      phone,
      county: county || undefined,
      cvUrl: cvUrl || undefined,
      coverLetter: coverLetter || undefined,
      status: "submitted",
    });

    return res.status(201).json({
      data: application,
      message: "Application submitted successfully",
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
