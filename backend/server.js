import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, "data", "db.json");
const UPLOAD_DIR = path.join(__dirname, "uploads");
const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || "local-development-secret-change-me";
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",").map((s) => s.trim());

app.use(cors({ origin(origin, callback) {
  if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error("Origin not allowed by CORS"));
}}));
app.use(express.json({ limit: "1mb" }));
await mkdir(UPLOAD_DIR, { recursive: true });
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "1d", immutable: true }));

const imageStorage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, UPLOAD_DIR),
  filename: (_req, file, callback) => {
    const extensionByMime = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "image/avif": ".avif" };
    callback(null, `${randomUUID()}${extensionByMime[file.mimetype] || ".img"}`);
  }
});
const uploadImages = multer({
  storage: imageStorage,
  limits: { files: 5, fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(file.mimetype)) return callback(new Error("Use JPG, PNG, WebP, GIF, or AVIF image files."));
    callback(null, true);
  }
});

let storageMode = "json";
let mongoProduct;
let mongoUser;

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  oldPrice: { type: Number, default: 0, min: 0 },
  category: { type: String, required: true, trim: true },
  condition: { type: String, default: "Good" },
  seller: { type: String, required: true, trim: true },
  initials: { type: String, default: "CK" },
  location: { type: String, default: "Campus" },
  image: { type: String, default: "" },
  images: { type: [String], default: [] },
  description: { type: String, default: "" },
  ownerId: { type: String, default: "" }
}, { timestamps: true });
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

function getModels() {
  mongoProduct = mongoose.models.Product || mongoose.model("Product", ProductSchema);
  mongoUser = mongoose.models.User || mongoose.model("User", UserSchema);
}

async function ensureJsonFile() {
  await mkdir(path.dirname(DB_FILE), { recursive: true });
  try { await readFile(DB_FILE, "utf8"); }
  catch { await writeFile(DB_FILE, JSON.stringify({ products: [], users: [] }, null, 2)); }
}
async function readJson() {
  await ensureJsonFile();
  return JSON.parse(await readFile(DB_FILE, "utf8"));
}
async function writeJson(db) {
  await writeFile(DB_FILE, JSON.stringify(db, null, 2) + "\n");
}
function cleanUser(user) {
  if (!user) return null;
  return { id: String(user._id || user.id), name: user.name, email: user.email };
}
function cleanProduct(product) {
  if (!product) return null;
  const p = typeof product.toObject === "function" ? product.toObject() : product;
  return { ...p, id: String(p._id || p.id), _id: undefined };
}
async function findUserByEmail(email) {
  if (storageMode === "mongo") return mongoUser.findOne({ email: email.toLowerCase() });
  const db = await readJson();
  return db.users.find((user) => user.email === email.toLowerCase()) || null;
}
async function getProducts() {
  if (storageMode === "mongo") {
    const items = await mongoProduct.find().sort({ createdAt: -1 }).lean();
    return items.map(cleanProduct);
  }
  const db = await readJson();
  return db.products.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}
async function createProduct(data, user) {
  const product = {
    title: data.title.trim(), price: Number(data.price), oldPrice: Number(data.oldPrice || 0),
    category: data.category.trim(), condition: data.condition || "Good",
    seller: user.name, initials: user.name.split(/\s+/).map((s) => s[0]).join("").slice(0, 2).toUpperCase(),
    location: String(data.location || "Campus").trim(),
    images: Array.isArray(data.images) ? data.images : [],
    image: (Array.isArray(data.images) && data.images[0]) || String(data.image || "").trim(),
    description: String(data.description || "").trim(), ownerId: user.id
  };
  if (storageMode === "mongo") {
    const saved = await mongoProduct.create(product);
    return cleanProduct(saved);
  }
  const db = await readJson();
  const saved = { id: randomUUID(), ...product, createdAt: new Date().toISOString() };
  db.products.push(saved);
  await writeJson(db);
  return saved;
}
function authRequired(req, res, next) {
  const token = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Please sign in to continue." });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ message: "Your session is invalid or expired. Please sign in again." }); }
}

app.get("/api/health", (_req, res) => res.json({ status: "ok", storage: storageMode }));
app.get("/api/products", async (_req, res, next) => {
  try { res.json(await getProducts()); } catch (error) { next(error); }
});
app.get("/api/products/:id", async (req, res, next) => {
  try {
    const items = await getProducts();
    const item = items.find((p) => String(p.id) === req.params.id);
    if (!item) return res.status(404).json({ message: "Listing not found." });
    res.json(item);
  } catch (error) { next(error); }
});
app.post("/api/products", authRequired, uploadImages.array("images", 5), async (req, res, next) => {
  try {
    const { title, price, category } = req.body || {};
    if (typeof title !== "string" || title.trim().length < 3) return res.status(400).json({ message: "Item name must contain at least 3 characters." });
    if (!Number.isFinite(Number(price)) || Number(price) < 0) return res.status(400).json({ message: "Enter a valid price." });
    if (typeof category !== "string" || !category.trim()) return res.status(400).json({ message: "Choose a category." });
    const uploadedImages = (req.files || []).map((file) => `/uploads/${file.filename}`);
    const product = await createProduct({ ...req.body, images: uploadedImages }, req.user);
    res.status(201).json(product);
  } catch (error) { next(error); }
});
app.post("/api/auth/register", async (req, res, next) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    if (name.length < 2) return res.status(400).json({ message: "Name must contain at least 2 characters." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address." });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });
    if (await findUserByEmail(email)) return res.status(409).json({ message: "An account with this email already exists." });
    const passwordHash = await bcrypt.hash(password, 12);
    let user;
    if (storageMode === "mongo") {
      user = await mongoUser.create({ name, email, passwordHash });
    } else {
      const db = await readJson();
      user = { id: randomUUID(), name, email, passwordHash, createdAt: new Date().toISOString() };
      db.users.push(user);
      await writeJson(db);
    }
    const safe = cleanUser(user);
    const token = jwt.sign(safe, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ user: safe, token });
  } catch (error) { next(error); }
});
app.post("/api/auth/login", async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const user = await findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: "Invalid email or password." });
    const safe = cleanUser(user);
    const token = jwt.sign(safe, JWT_SECRET, { expiresIn: "7d" });
    res.json({ user: safe, token });
  } catch (error) { next(error); }
});
app.get("/api/auth/me", authRequired, (req, res) => res.json({ user: req.user }));

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.code === 11000) return res.status(409).json({ message: "An account with this email already exists." });
  res.status(500).json({ message: "Something went wrong on the server. Please try again." });
});

async function start() {
  await ensureJsonFile();
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      getModels();
      storageMode = "mongo";
      // Seed the MongoDB collection with the demo listings only when it is empty.
      if (await mongoProduct.countDocuments() === 0) {
        const localData = await readJson();
        if (localData.products.length) await mongoProduct.insertMany(localData.products.map(({ id, ...product }) => product));
      }
      console.log("Connected to MongoDB; using MongoDB storage.");
    } catch (error) {
      storageMode = "json";
      console.warn("MongoDB connection failed; falling back to backend/data/db.json:", error.message);
    }
  } else {
    console.log("MONGODB_URI not set; using backend/data/db.json.");
  }
  app.listen(PORT, () => console.log(`CampusKart API listening on http://localhost:${PORT} (storage: ${storageMode})`));
}
start();
