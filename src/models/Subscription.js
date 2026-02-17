const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    fullName: { type: String },
    source: { type: String, default: "website" },
    status: { type: String, enum: ["active", "unsubscribed", "bounced"], default: "active", index: true },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
