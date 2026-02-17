const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
const JWT_EXPIRY_MS = Number(process.env.JWT_EXPIRY_MS) || 1000 * 60 * 60 * 12; // 12 hours default

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password, passwordHash) {
  const [salt, original] = String(passwordHash || "").split(":");
  if (!salt || !original) return false;
  const derived = crypto.scryptSync(String(password), salt, 64).toString("hex");
  const left = Buffer.from(original, "hex");
  const right = Buffer.from(derived, "hex");
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

async function createDefaultAdminIfMissing() {
  const isProduction = process.env.NODE_ENV === "production";
  
  // Disable auto-created admin in production - must be set via environment variables
  if (isProduction) {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.warn("Production mode: No ADMIN_EMAIL set. No admin will be auto-created.");
      return;
    }
  }

  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL || "admin@jukwaa.local");
  const adminPassword = String(process.env.ADMIN_PASSWORD || "admin123");
  const adminName = String(process.env.ADMIN_NAME || "Primary Admin");

  const existingAnyAdmin = await AdminUser.exists({ role: "admin" });
  if (existingAnyAdmin) return;

  const existingEmail = await AdminUser.findOne({ email: adminEmail });
  if (existingEmail) {
    existingEmail.role = "admin";
    existingEmail.isActive = true;
    if (!existingEmail.passwordHash) existingEmail.passwordHash = hashPassword(adminPassword);
    await existingEmail.save();
    return;
  }

  // Only create default admin if not in production or if credentials are explicitly provided
  if (isProduction && !process.env.ADMIN_EMAIL) {
    return;
  }
  
  await AdminUser.create({
    name: adminName,
    email: adminEmail,
    role: "admin",
    isActive: true,
    passwordHash: hashPassword(adminPassword),
  });
}

function issueToken(user) {
  const payload = {
    id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role,
  };
  
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: Math.floor(JWT_EXPIRY_MS / 1000),
  });
  
  return token;
}

function getTokenPayload(token) {
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

function revokeToken(_token) {
  // JWT tokens cannot be revoked server-side without a blacklist
  // For production, implement a token blacklist in Redis/database
  // This is a no-op for now - tokens will expire naturally
  return;
}

function requireAdminAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const [type, token] = auth.split(" ");
  const user = getTokenPayload(token);

  if (type !== "Bearer" || !user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.adminToken = token;
  req.adminUser = user;
  return next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.adminUser || !roles.includes(req.adminUser.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
}

module.exports = {
  normalizeEmail,
  hashPassword,
  verifyPassword,
  createDefaultAdminIfMissing,
  issueToken,
  getTokenPayload,
  revokeToken,
  requireAdminAuth,
  requireRole,
};
