const mongoose = require("mongoose");

const eventRegistrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    eventSlug: { type: String, required: true, index: true },
    eventTitle: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true },
    organization: { type: String, trim: true },
    county: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: { type: String, enum: ["registered", "cancelled"], default: "registered", index: true },
  },
  { timestamps: true }
);

eventRegistrationSchema.index({ event: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("EventRegistration", eventRegistrationSchema);
