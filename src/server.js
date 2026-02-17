const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const { connectDatabase } = require("./config/db");
const blogsRouter = require("./routes/blogs");
const newsRouter = require("./routes/news");
const resourcesRouter = require("./routes/resources");
const careersRouter = require("./routes/careers");
const eventsRouter = require("./routes/events");
const adsRouter = require("./routes/ads");
const subscriptionsRouter = require("./routes/subscriptions");
const teamRouter = require("./routes/team");
const videosRouter = require("./routes/videos");
const galleryRouter = require("./routes/gallery");
const adminRouter = require("./routes/admin");
const { seedTeamMembersIfEmpty } = require("./seed/teamSeed");
const { seedVideosIfEmpty } = require("./seed/videoSeed");
const { seedBlogsIfEmpty } = require("./seed/blogSeed");

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT || 5000);
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGIN || "http://localhost:8080,http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const ALLOW_START_WITHOUT_DB =
  (process.env.ALLOW_START_WITHOUT_DB || "false").toLowerCase() === "true";
// MongoDB Atlas connection
// MONGO_URI must be set in your .env file (e.g., mongodb+srv://...)
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("ERROR: MONGO_URI is not set in your .env file. Please configure your MongoDB Atlas connection string.");
  process.exit(1);
}

console.log(`[DEBUG] MONGO_URI being used: ${MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@')}`);
let isDatabaseReady = false;

app.use(
  cors({
    origin: "*", // Temporarily allow all origins for debugging
    credentials: false,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ data: { status: "ok", database: isDatabaseReady ? "connected" : "disconnected" } });
});

// Root route - Render health check
app.get("/", (_req, res) => {
  res.json({ message: "Jukwaa Backend API is running", status: "ok" });
});

app.use("/api", (req, res, next) => {
  if (req.path === "/health" || isDatabaseReady) {
    return next();
  }

  return res.status(503).json({
    message:
      "Database is currently unavailable. Check MongoDB Atlas connection and retry. Set ALLOW_START_WITHOUT_DB=false to fail fast on startup.",
  });
});

app.use("/api/blogs", blogsRouter);
app.use("/api/news", newsRouter);
app.use("/api/resources", resourcesRouter);
app.use("/api/careers", careersRouter);
app.use("/api/events", eventsRouter);
app.use("/api/ads", adsRouter);
app.use("/api/subscriptions", subscriptionsRouter);
app.use("/api/team", teamRouter);
app.use("/api/videos", videosRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/admin", adminRouter);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  const message = error.message || "Server error";
  if (status >= 500) {
    console.error(error);
  }
  res.status(status).json({ message });
});

async function start() {
  try {
    await connectDatabase(MONGO_URI);
    isDatabaseReady = true;
    await seedTeamMembersIfEmpty();
    await seedVideosIfEmpty();
    await seedBlogsIfEmpty();
  } catch (error) {
    if (!ALLOW_START_WITHOUT_DB) {
      throw error;
    }
    console.warn("MongoDB unavailable. Starting API in degraded mode (DB endpoints return 503).");
    console.warn(error.message || error);
  }

  app.listen(PORT, () => {
    console.log(`Backend API running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
