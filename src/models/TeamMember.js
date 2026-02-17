const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    imageUrl: { type: String, trim: true },
    bio: { type: String, trim: true },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

teamMemberSchema.index({ name: 1 });

module.exports = mongoose.model("TeamMember", teamMemberSchema);
