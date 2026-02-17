const express = require("express");
const fs = require("fs");
const path = require("path");
let multer = null;
try {
  multer = require("multer");
} catch (_error) {
  multer = null;
}

const Blog = require("../models/Blog");
const Resource = require("../models/Resource");
const Career = require("../models/Career");
const Event = require("../models/Event");
const Advertisement = require("../models/Advertisement");
const Subscription = require("../models/Subscription");
const EventRegistration = require("../models/EventRegistration");
const TeamMember = require("../models/TeamMember");
const Video = require("../models/Video");
const GalleryItem = require("../models/GalleryItem");
const CareerApplication = require("../models/CareerApplication");
const AdminUser = require("../models/AdminUser");
const {
  normalizeEmail,
  hashPassword,
  verifyPassword,
  createDefaultAdminIfMissing,
  issueToken,
  revokeToken,
  requireAdminAuth,
} = require("../auth/adminAuth");

const router = express.Router();
const uploadsDir = path.resolve(__dirname, "../../uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer
  ? multer({
      storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadsDir),
        filename: (_req, file, cb) => {
          const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
          cb(null, `${Date.now()}-${safeName}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
          cb(new Error("Only image uploads are allowed"));
          return;
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    })
  : null;

const modelMap = {
  blogs: Blog,
  resources: Resource,
  careers: Career,
  events: Event,
  ads: Advertisement,
  subscriptions: Subscription,
  "event-registrations": EventRegistration,
  "team-members": TeamMember,
  videos: Video,
  "gallery-items": GalleryItem,
  "career-applications": CareerApplication,
};

function isAdmin(req) {
  return req.adminUser?.role === "admin";
}

function sanitizeUser(userDoc) {
  if (!userDoc) return null;
  const plain = typeof userDoc.toObject === "function" ? userDoc.toObject() : userDoc;
  const { passwordHash, ...safe } = plain;
  return safe;
}

router.post("/login", async (req, res, next) => {
  try {
    await createDefaultAdminIfMissing();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    const user = await AdminUser.findOne({ email, isActive: true });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = issueToken(user);
    return res.json({
      data: {
        token,
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/logout", requireAdminAuth, (req, res) => {
  revokeToken(req.adminToken);
  return res.json({ data: { success: true } });
});

router.get("/me", requireAdminAuth, (req, res) => {
  return res.json({ data: req.adminUser });
});

router.get("/users", requireAdminAuth, async (_req, res, next) => {
  try {
    if (!isAdmin(_req)) return res.status(403).json({ message: "Only admin can manage users" });
    const users = await AdminUser.find({})
      .sort({ createdAt: -1 })
      .select("_id name email role isActive createdAt updatedAt")
      .lean();
    return res.json({ data: users });
  } catch (error) {
    return next(error);
  }
});

router.get("/subscriptions/export.csv", requireAdminAuth, async (req, res, next) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Only admin can export subscribers" });

    const fromRaw = String(req.query?.from || "").trim();
    const toRaw = String(req.query?.to || "").trim();
    const query = {};

    if (fromRaw || toRaw) {
      query.subscribedAt = {};
      if (fromRaw) {
        const fromDate = new Date(fromRaw);
        if (Number.isNaN(fromDate.getTime())) {
          return res.status(400).json({ message: "Invalid 'from' date" });
        }
        query.subscribedAt.$gte = fromDate;
      }
      if (toRaw) {
        const toDate = new Date(toRaw);
        if (Number.isNaN(toDate.getTime())) {
          return res.status(400).json({ message: "Invalid 'to' date" });
        }
        toDate.setHours(23, 59, 59, 999);
        query.subscribedAt.$lte = toDate;
      }
    }

    const rows = await Subscription.find(query).sort({ subscribedAt: -1 }).lean();
    const headers = ["email", "fullName", "source", "status", "subscribedAt", "unsubscribedAt"];

    const escapeCsv = (value) => {
      const stringValue = String(value ?? "");
      if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvLines = [
      headers.join(","),
      ...rows.map((row) =>
        [
          row.email,
          row.fullName || "",
          row.source || "",
          row.status || "",
          row.subscribedAt ? new Date(row.subscribedAt).toISOString() : "",
          row.unsubscribedAt ? new Date(row.unsubscribedAt).toISOString() : "",
        ]
          .map(escapeCsv)
          .join(",")
      ),
    ];

    const filenamePart = [fromRaw || "all", toRaw || "today"].join("_to_").replace(/[^a-zA-Z0-9_-]/g, "-");
    const filename = `subscribers-${filenamePart}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(csvLines.join("\n"));
  } catch (error) {
    return next(error);
  }
});

router.get("/event-registrations/export.csv", requireAdminAuth, async (req, res, next) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Only admin can export event registrations" });

    const fromRaw = String(req.query?.from || "").trim();
    const toRaw = String(req.query?.to || "").trim();
    const query = {};

    if (fromRaw || toRaw) {
      query.createdAt = {};
      if (fromRaw) {
        const fromDate = new Date(fromRaw);
        if (Number.isNaN(fromDate.getTime())) {
          return res.status(400).json({ message: "Invalid 'from' date" });
        }
        query.createdAt.$gte = fromDate;
      }
      if (toRaw) {
        const toDate = new Date(toRaw);
        if (Number.isNaN(toDate.getTime())) {
          return res.status(400).json({ message: "Invalid 'to' date" });
        }
        toDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
    }

    const rows = await EventRegistration.find(query).sort({ createdAt: -1 }).lean();
    const headers = ["eventSlug", "eventTitle", "fullName", "email", "phone", "organization", "county", "notes", "status", "registeredAt"];

    const escapeCsv = (value) => {
      const stringValue = String(value ?? "");
      if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvLines = [
      headers.join(","),
      ...rows.map((row) =>
        [
          row.eventSlug || "",
          row.eventTitle || "",
          row.fullName || "",
          row.email || "",
          row.phone || "",
          row.organization || "",
          row.county || "",
          row.notes || "",
          row.status || "",
          row.createdAt ? new Date(row.createdAt).toISOString() : "",
        ]
          .map(escapeCsv)
          .join(",")
      ),
    ];

    const filenamePart = [fromRaw || "all", toRaw || "today"].join("_to_").replace(/[^a-zA-Z0-9_-]/g, "-");
    const filename = `event-registrations-${filenamePart}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(csvLines.join("\n"));
  } catch (error) {
    return next(error);
  }
});

router.get("/career-applications/export.csv", requireAdminAuth, async (req, res, next) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Only admin can export applicants" });

    const fromRaw = String(req.query?.from || "").trim();
    const toRaw = String(req.query?.to || "").trim();
    const query = {};

    if (fromRaw || toRaw) {
      query.createdAt = {};
      if (fromRaw) {
        const fromDate = new Date(fromRaw);
        if (Number.isNaN(fromDate.getTime())) {
          return res.status(400).json({ message: "Invalid 'from' date" });
        }
        query.createdAt.$gte = fromDate;
      }
      if (toRaw) {
        const toDate = new Date(toRaw);
        if (Number.isNaN(toDate.getTime())) {
          return res.status(400).json({ message: "Invalid 'to' date" });
        }
        toDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
    }

    const rows = await CareerApplication.find(query).sort({ createdAt: -1 }).lean();
    const headers = [
      "careerReferenceNumber",
      "careerTitle",
      "fullName",
      "email",
      "phone",
      "county",
      "cvUrl",
      "status",
      "appliedAt",
    ];

    const escapeCsv = (value) => {
      const stringValue = String(value ?? "");
      if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvLines = [
      headers.join(","),
      ...rows.map((row) =>
        [
          row.careerReferenceNumber || "",
          row.careerTitle || "",
          row.fullName || "",
          row.email || "",
          row.phone || "",
          row.county || "",
          row.cvUrl || "",
          row.status || "",
          row.createdAt ? new Date(row.createdAt).toISOString() : "",
        ]
          .map(escapeCsv)
          .join(",")
      ),
    ];

    const filenamePart = [fromRaw || "all", toRaw || "today"].join("_to_").replace(/[^a-zA-Z0-9_-]/g, "-");
    const filename = `career-applications-${filenamePart}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(csvLines.join("\n"));
  } catch (error) {
    return next(error);
  }
});

router.post("/users", requireAdminAuth, async (req, res, next) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Only admin can add users" });

    const name = String(req.body?.name || "").trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");
    const role = String(req.body?.role || "user") === "admin" ? "admin" : "user";
    const isActive = req.body?.isActive !== false;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    const existing = await AdminUser.findOne({ email });
    if (existing) return res.status(409).json({ message: "User already exists" });

    const created = await AdminUser.create({
      name,
      email,
      role,
      isActive,
      passwordHash: hashPassword(password),
    });
    return res.status(201).json({ data: sanitizeUser(created) });
  } catch (error) {
    return next(error);
  }
});

router.put("/users/:id", requireAdminAuth, async (req, res, next) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Only admin can update users" });
    const updates = {};
    if (req.body?.name !== undefined) updates.name = String(req.body.name || "").trim();
    if (req.body?.email !== undefined) updates.email = normalizeEmail(req.body.email);
    if (req.body?.role !== undefined) updates.role = String(req.body.role) === "admin" ? "admin" : "user";
    if (req.body?.isActive !== undefined) updates.isActive = Boolean(req.body.isActive);
    if (req.body?.password) updates.passwordHash = hashPassword(String(req.body.password));

    const updated = await AdminUser.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "User not found" });
    return res.json({ data: sanitizeUser(updated) });
  } catch (error) {
    return next(error);
  }
});

if (upload) {
  router.post("/upload", requireAdminAuth, upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }
    const baseUrl = process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    return res.status(201).json({
      data: {
        fileName: req.file.filename,
        fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  });
} else {
  router.post("/upload", requireAdminAuth, (_req, res) => {
    return res.status(503).json({
      message: "Image upload unavailable: install backend dependency 'multer' and restart server",
    });
  });
}

router.get("/:entity", requireAdminAuth, async (req, res, next) => {
  try {
    const Model = modelMap[req.params.entity];
    if (!Model) return res.status(404).json({ message: "Entity not found" });
    const items = await Model.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ data: items });
  } catch (error) {
    return next(error);
  }
});

router.post("/:entity", requireAdminAuth, async (req, res, next) => {
  try {
    const Model = modelMap[req.params.entity];
    if (!Model) return res.status(404).json({ message: "Entity not found" });
    if (req.params.entity === "subscriptions" || req.params.entity === "event-registrations" || req.params.entity === "career-applications") {
      return res.status(403).json({ message: "This entity is read-only in admin" });
    }
    const item = await Model.create(req.body || {});
    return res.status(201).json({ data: item });
  } catch (error) {
    return next(error);
  }
});

router.post("/:entity/bulk", requireAdminAuth, async (req, res, next) => {
  try {
    const Model = modelMap[req.params.entity];
    if (!Model) return res.status(404).json({ message: "Entity not found" });
    if (req.params.entity === "subscriptions" || req.params.entity === "event-registrations" || req.params.entity === "career-applications") {
      return res.status(403).json({ message: "Bulk actions are not allowed for this entity" });
    }
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(Boolean) : [];
    const action = String(req.body?.action || "");
    if (ids.length === 0) return res.status(400).json({ message: "ids array is required" });

    if (action === "delete") {
      const deleted = await Model.deleteMany({ _id: { $in: ids } });
      return res.json({ data: { affectedCount: deleted.deletedCount || 0 } });
    }

    let update = null;
    if (action === "publish") {
      if (req.params.entity === "blogs") update = { status: "published" };
      if (req.params.entity === "resources") update = { isPublished: true };
      if (req.params.entity === "careers") update = { status: "open" };
      if (req.params.entity === "events") update = { status: "scheduled" };
      if (req.params.entity === "ads") update = { isActive: true };
      if (req.params.entity === "team-members") update = { isActive: true };
      if (req.params.entity === "videos") update = { isActive: true };
      if (req.params.entity === "gallery-items") update = { isActive: true };
    }
    if (action === "unpublish") {
      if (req.params.entity === "blogs") update = { status: "draft" };
      if (req.params.entity === "resources") update = { isPublished: false };
      if (req.params.entity === "careers") update = { status: "closed" };
      if (req.params.entity === "events") update = { status: "cancelled" };
      if (req.params.entity === "ads") update = { isActive: false };
      if (req.params.entity === "team-members") update = { isActive: false };
      if (req.params.entity === "videos") update = { isActive: false };
      if (req.params.entity === "gallery-items") update = { isActive: false };
    }
    if (!update) return res.status(400).json({ message: "Unsupported bulk action for this entity" });

    const changed = await Model.updateMany({ _id: { $in: ids } }, { $set: update });
    return res.json({ data: { affectedCount: changed.modifiedCount || 0 } });
  } catch (error) {
    return next(error);
  }
});

router.put("/:entity/:id", requireAdminAuth, async (req, res, next) => {
  try {
    const Model = modelMap[req.params.entity];
    if (!Model) return res.status(404).json({ message: "Entity not found" });
    if (req.params.entity === "subscriptions" || req.params.entity === "event-registrations" || req.params.entity === "career-applications") {
      return res.status(403).json({ message: "This entity is read-only in admin" });
    }
    const item = await Model.findByIdAndUpdate(req.params.id, req.body || {}, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: "Item not found" });
    return res.json({ data: item });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:entity/:id", requireAdminAuth, async (req, res, next) => {
  try {
    const Model = modelMap[req.params.entity];
    if (!Model) return res.status(404).json({ message: "Entity not found" });
    if (req.params.entity === "subscriptions" || req.params.entity === "event-registrations" || req.params.entity === "career-applications") {
      return res.status(403).json({ message: "This entity is read-only in admin" });
    }
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    return res.json({ data: { success: true } });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
