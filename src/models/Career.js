const mongoose = require("mongoose");

const careerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    referenceNumber: { type: String, trim: true, index: true },
    coverImageUrl: { type: String },
    department: { type: String, required: true },
    location: { type: String, required: true },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "volunteer"],
      required: true,
    },
    description: { type: String, required: true },
    requirements: { type: String },
    applicationUrl: { type: String },
    deadline: { type: Date },
    status: { type: String, enum: ["open", "closed", "paused"], default: "open", index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Career", careerSchema);
