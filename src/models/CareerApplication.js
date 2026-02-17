const mongoose = require("mongoose");

const careerApplicationSchema = new mongoose.Schema(
  {
    career: { type: mongoose.Schema.Types.ObjectId, ref: "Career", required: true, index: true },
    careerTitle: { type: String, required: true, trim: true },
    careerReferenceNumber: { type: String, trim: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true },
    county: { type: String, trim: true },
    cvUrl: { type: String, trim: true },
    coverLetter: { type: String, trim: true },
    status: { type: String, enum: ["submitted", "reviewed", "shortlisted", "rejected"], default: "submitted", index: true },
  },
  { timestamps: true }
);

careerApplicationSchema.index({ career: 1, email: 1 });

module.exports = mongoose.model("CareerApplication", careerApplicationSchema);
