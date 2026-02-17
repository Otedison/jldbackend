const express = require("express");
const Subscription = require("../models/Subscription");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const fullName = String(req.body?.fullName || "").trim();
    const source = String(req.body?.source || "website").trim();

    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "A valid email is required" });
    }

    const doc = await Subscription.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          fullName: fullName || undefined,
          source,
          status: "active",
          subscribedAt: new Date(),
          unsubscribedAt: null,
        },
      },
      { new: true, upsert: true }
    ).lean();

    return res.status(201).json({ data: doc });
  } catch (error) {
    next(error);
  }
});

// Check if an email is subscribed
router.get("/check", async (req, res, next) => {
  try {
    const email = String(req.query?.email || "").trim().toLowerCase();
    
    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "A valid email is required", isSubscribed: false });
    }

    const subscription = await Subscription.findOne({ email, status: "active" }).lean();
    
    if (subscription) {
      return res.json({ 
        data: { 
          isSubscribed: true, 
          email: subscription.email,
          subscribedAt: subscription.subscribedAt 
        } 
      });
    }
    
    return res.json({ 
      data: { 
        isSubscribed: false, 
        email 
      } 
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
