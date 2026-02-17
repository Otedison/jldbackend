const express = require("express");
const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { upcoming = "true" } = req.query;
    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 20, 100);

    const query = {};
    if (upcoming === "true") {
      query.startAt = { $gte: new Date() };
      query.status = "scheduled";
    }

    const items = await Event.find(query)
      .sort({ startAt: 1 })
      .limit(limit)
      .lean();

    res.json({ data: items });
  } catch (error) {
    next(error);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const item = await Event.findOne({ slug: req.params.slug }).lean();
    if (!item) return res.status(404).json({ message: "Event not found" });
    return res.json({ data: item });
  } catch (error) {
    return next(error);
  }
});

router.post("/:slug/register", async (req, res, next) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug }).lean();
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.status !== "scheduled") return res.status(400).json({ message: "Registration is closed for this event" });

    const fullName = String(req.body?.fullName || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const phone = String(req.body?.phone || "").trim();
    const organization = String(req.body?.organization || "").trim();
    const county = String(req.body?.county || "").trim();
    const notes = String(req.body?.notes || "").trim();

    if (!fullName) return res.status(400).json({ message: "Full name is required" });
    if (!email || !email.includes("@")) return res.status(400).json({ message: "A valid email is required" });
    if (!phone) return res.status(400).json({ message: "Phone number is required" });

    const registration = await EventRegistration.findOneAndUpdate(
      { event: event._id, email },
      {
        $set: {
          event: event._id,
          eventSlug: event.slug,
          eventTitle: event.title,
          fullName,
          email,
          phone,
          organization: organization || undefined,
          county: county || undefined,
          notes: notes || undefined,
          status: "registered",
        },
      },
      { upsert: true, new: true }
    ).lean();

    return res.status(201).json({
      data: registration,
      message: "Event registration received successfully",
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
