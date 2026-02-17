const Video = require("../models/Video");

const PLACEHOLDER_VIDEO_URL =
  "https://www.youtube.com/watch?v=i3QQd1XZw5s&pp=ygUUanVrd2FhIGxhIGRlbW9rcmFzaWHSBwkJhwoBhyohjO8%3D";

const DEFAULT_VIDEOS = Array.from({ length: 4 }, (_, index) => ({
  title: `Jukwaa Video ${index + 1}`,
  videoUrl: PLACEHOLDER_VIDEO_URL,
  description: "Placeholder video from Jukwaa media library.",
  order: index + 1,
  isActive: true,
}));

async function seedVideosIfEmpty() {
  const count = await Video.countDocuments();
  if (count > 0) return 0;
  const inserted = await Video.insertMany(DEFAULT_VIDEOS);
  return inserted.length;
}

module.exports = {
  seedVideosIfEmpty,
};
