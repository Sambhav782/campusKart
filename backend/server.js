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
  ownerId: { type: String, default: "" },
  quantity: { type: Number, required: true, min: 0, default: 1 },
  status: { type: String, enum: ["available", "sold"], default: "available" }
}, { timestamps: true });
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  cart: { type: [String], default: [] },
  orders: { type: [mongoose.Schema.Types.Mixed], default: [] },
  notifications: { type: [mongoose.Schema.Types.Mixed], default: [] }
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

async function getUserCart(userId) {
  if (storageMode === "mongo") {
    const user = await mongoUser.findById(userId).select("cart").lean();
    if (!user) return [];
    const ids = user.cart || [];
    const products = await mongoProduct.find({ _id: { $in: ids } }).lean();
    const byId = new Map(products.map((product) => [String(product._id), cleanProduct(product)]));
    return ids.map((id) => byId.get(String(id))).filter(Boolean);
  }
  const db = await readJson();
  const user = db.users.find((entry) => String(entry.id) === String(userId));
  if (!user) return [];
  const byId = new Map(db.products.map((product) => [String(product.id || product._id), product]));
  return (user.cart || []).map((id) => byId.get(String(id))).filter(Boolean);
}

async function updateUserCart(userId, productId, action) {
  if (storageMode === "mongo") {
    const user = await mongoUser.findById(userId);
    if (!user) return null;
    const cart = (user.cart || []).map(String);
    user.cart = action === "add"
      ? (cart.includes(String(productId)) ? cart : [...cart, String(productId)])
      : cart.filter((id) => id !== String(productId));
    await user.save();
    return user.cart;
  }
  const db = await readJson();
  const user = db.users.find((entry) => String(entry.id) === String(userId));
  if (!user) return null;
  const cart = (user.cart || []).map(String);
  user.cart = action === "add"
    ? (cart.includes(String(productId)) ? cart : [...cart, String(productId)])
    : cart.filter((id) => id !== String(productId));
  await writeJson(db);
  return user.cart;
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
    title: data.title.trim(), price: Number(data.price), oldPrice: Number(data.oldPrice || 0), quantity: Number(data.quantity || 1),
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
app.get("/api/my-products", authRequired, async (req, res, next) => {
  try { res.json((await getProducts()).filter((product) => String(product.ownerId) === String(req.user.id))); }
  catch (error) { next(error); }
});

app.get("/api/products", async (_req, res, next) => {
  try {
    const products = await getProducts();
    res.json(products.filter((product) => product.status !== "sold" && Number(product.quantity ?? 1) > 0));
  } catch (error) { next(error); }
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
    const quantity = Number(req.body?.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) return res.status(400).json({ message: "Quantity must be a whole number between 1 and 10,000." });
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
      user = { id: randomUUID(), name, email, passwordHash, cart: [], createdAt: new Date().toISOString() };
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

// The cart is owned by the authenticated account, not by browser localStorage.
app.get("/api/cart", authRequired, async (req, res, next) => {
  try { res.json(await getUserCart(req.user.id)); }
  catch (error) { next(error); }
});

app.post("/api/cart/:productId", authRequired, async (req, res, next) => {
  try {
    const productId = String(req.params.productId);
    const products = await getProducts();
    if (!products.some((product) => String(product.id || product._id) === productId)) {
      return res.status(404).json({ message: "Listing not found." });
    }
    const cart = await updateUserCart(req.user.id, productId, "add");
    if (!cart) return res.status(404).json({ message: "Account not found." });
    res.json(await getUserCart(req.user.id));
  } catch (error) { next(error); }
});

app.delete("/api/cart/:productId", authRequired, async (req, res, next) => {
  try {
    const cart = await updateUserCart(req.user.id, String(req.params.productId), "remove");
    if (!cart) return res.status(404).json({ message: "Account not found." });
    res.json(await getUserCart(req.user.id));
  } catch (error) { next(error); }
});


// A simulated purchase: no payment is collected by CampusKart.
app.post("/api/orders/:productId", authRequired, async (req, res, next) => {
  try {
    const productId = String(req.params.productId);
    const quantity = Number(req.body?.quantity ?? 1);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Choose a valid quantity." });
    }

    let product;
    if (storageMode === "mongo") {
      const current = await mongoProduct.findById(productId).lean();
      if (!current) return res.status(404).json({ message: "Listing not found." });
      if (String(current.ownerId) === String(req.user.id)) return res.status(400).json({ message: "You cannot buy your own listing." });
      const available = Number(current.quantity ?? 1);
      if (current.status === "sold" || available < quantity) {
        return res.status(409).json({ message: available <= 0 ? "This item is sold out." : `Only ${available} available.` });
      }
      const updated = await mongoProduct.findOneAndUpdate(
        { _id: productId, status: { $ne: "sold" }, quantity: { $gte: quantity } },
        { $inc: { quantity: -quantity } },
        { new: true }
      );
      if (!updated) return res.status(409).json({ message: "Stock changed. Refresh the listing and try again." });
      if (updated.quantity <= 0) {
        await mongoProduct.updateOne({ _id: productId, quantity: { $lte: 0 } }, { $set: { status: "sold" } });
        updated.status = "sold";
      } else {
        updated.status = "available";
      }
      product = cleanProduct(updated);
    } else {
      const db = await readJson();
      product = db.products.find((entry) => String(entry.id || entry._id) === productId);
      if (!product) return res.status(404).json({ message: "Listing not found." });
      if (String(product.ownerId) === String(req.user.id)) return res.status(400).json({ message: "You cannot buy your own listing." });
      const available = Number(product.quantity ?? 1);
      if (product.status === "sold" || available < quantity) {
        return res.status(409).json({ message: available <= 0 ? "This item is sold out." : `Only ${available} available.` });
      }
      product.quantity = available - quantity;
      product.status = product.quantity === 0 ? "sold" : "available";
      await writeJson(db);
    }

    const order = {
      id: randomUUID(),
      productId,
      quantity,
      buyerId: String(req.user.id),
      buyerName: String(req.user.name || "A CampusKart user"),
      sellerId: String(product.ownerId),
      status: "Purchased",
      createdAt: new Date().toISOString()
    };
    const notification = {
      id: randomUUID(),
      message: `${order.buyerName} purchased ${quantity} × ${product.title}.`,
      productId,
      orderId: order.id,
      read: false,
      createdAt: order.createdAt
    };

    if (storageMode === "mongo") {
      await mongoUser.updateOne({ _id: req.user.id }, { $pull: { cart: productId }, $push: { orders: order } });
      if (product.ownerId) await mongoUser.updateOne({ _id: product.ownerId }, { $push: { notifications: notification } });
    } else {
      const db = await readJson();
      const buyer = db.users.find((entry) => String(entry.id) === String(req.user.id));
      const seller = db.users.find((entry) => String(entry.id) === String(product.ownerId));
      if (buyer) {
        buyer.cart = (buyer.cart || []).filter((id) => String(id) !== productId);
        buyer.orders = [...(buyer.orders || []), order];
      }
      if (seller) seller.notifications = [...(seller.notifications || []), notification];
      await writeJson(db);
    }
    res.status(201).json({ order, product, notification: { message: "Purchase recorded." } });
  } catch (error) { next(error); }
});

// Purchase every item in the signed-in user's cart as separate orders.
app.post("/api/orders/bulk", authRequired, async (req, res, next) => {
  try {
    let cartIds;
    let products;
    if (storageMode === "mongo") {
      const buyer = await mongoUser.findById(req.user.id).select("cart").lean();
      cartIds = (buyer?.cart || []).map(String);
      const found = await mongoProduct.find({ _id: { $in: cartIds } }).lean();
      const byId = new Map(found.map((product) => [String(product._id), cleanProduct(product)]));
      products = cartIds.map((id) => byId.get(id)).filter(Boolean);
    } else {
      const db = await readJson();
      const buyer = db.users.find((entry) => String(entry.id) === String(req.user.id));
      cartIds = (buyer?.cart || []).map(String);
      const byId = new Map(db.products.map((product) => [String(product.id || product._id), product]));
      products = cartIds.map((id) => byId.get(id)).filter(Boolean);
    }
    if (!products.length) return res.status(400).json({ message: "Your cart is empty." });
    for (const product of products) {
      if (String(product.ownerId) === String(req.user.id)) return res.status(400).json({ message: `You cannot buy your own listing: ${product.title}.` });
      if (product.status === "sold" || Number(product.quantity ?? 1) < 1) return res.status(409).json({ message: `${product.title} is sold out. Remove it from your cart and try again.` });
    }
    const now = new Date().toISOString();
    const orders = [];
    const sellerNotifications = [];
    for (const item of products) {
      let purchased;
      if (storageMode === "mongo") {
        const updated = await mongoProduct.findOneAndUpdate({ _id: item.id, status: { $ne: "sold" }, quantity: { $gte: 1 } }, { $inc: { quantity: -1 } }, { new: true });
        if (!updated) return res.status(409).json({ message: `Stock changed for ${item.title}. Refresh your cart and try again.` });
        if (updated.quantity <= 0) {
          await mongoProduct.updateOne({ _id: updated._id, quantity: { $lte: 0 } }, { $set: { status: "sold" } });
          updated.status = "sold";
        } else updated.status = "available";
        purchased = cleanProduct(updated);
      } else {
        const db = await readJson();
        const current = db.products.find((product) => String(product.id || product._id) === String(item.id));
        if (!current || current.status === "sold" || Number(current.quantity ?? 1) < 1) return res.status(409).json({ message: `Stock changed for ${item.title}. Refresh your cart and try again.` });
        current.quantity = Number(current.quantity ?? 1) - 1;
        current.status = current.quantity <= 0 ? "sold" : "available";
        purchased = current;
        await writeJson(db);
      }
      const order = { id: randomUUID(), productId: String(purchased.id || purchased._id), quantity: 1, buyerId: String(req.user.id), buyerName: String(req.user.name || "A CampusKart user"), sellerId: String(purchased.ownerId), status: "Purchased", createdAt: now };
      orders.push({ ...order, product: { id: order.productId, title: purchased.title, price: purchased.price, image: purchased.image || "", category: purchased.category || "", status: purchased.status } });
      if (purchased.ownerId) sellerNotifications.push({ sellerId: String(purchased.ownerId), notification: { id: randomUUID(), message: `${order.buyerName} purchased 1 × ${purchased.title}.`, productId: order.productId, orderId: order.id, read: false, createdAt: now } });
    }
    if (storageMode === "mongo") {
      await mongoUser.updateOne({ _id: req.user.id }, { $set: { cart: [] }, $push: { orders: { $each: orders.map(({ product, ...order }) => order) } } });
      for (const entry of sellerNotifications) await mongoUser.updateOne({ _id: entry.sellerId }, { $push: { notifications: entry.notification } });
    } else {
      const db = await readJson();
      const buyer = db.users.find((entry) => String(entry.id) === String(req.user.id));
      if (buyer) { buyer.cart = []; buyer.orders = [...(buyer.orders || []), ...orders.map(({ product, ...order }) => order)]; }
      for (const entry of sellerNotifications) {
        const seller = db.users.find((entryUser) => String(entryUser.id) === entry.sellerId);
        if (seller) seller.notifications = [...(seller.notifications || []), entry.notification];
      }
      await writeJson(db);
    }
    res.status(201).json({ orders, purchasedProducts: products.length });
  } catch (error) { next(error); }
});

app.get("/api/orders", authRequired, async (req, res, next) => {
  try {
    let orders;
    let products;
    if (storageMode === "mongo") {
      const user = await mongoUser.findById(req.user.id).select("orders").lean();
      orders = user?.orders || [];
      products = await getProducts();
    } else {
      const db = await readJson();
      const user = db.users.find((entry) => String(entry.id) === String(req.user.id));
      orders = user?.orders || [];
      products = db.products;
    }
    const byId = new Map(products.map((product) => [String(product.id || product._id), product]));
    res.json(orders.map((order) => {
      const product = byId.get(String(order.productId));
      return { ...order, product: product ? {
        id: String(product.id || product._id), title: product.title, price: product.price,
        image: product.image || "", images: product.images || [], category: product.category,
        status: product.status || (Number(product.quantity ?? 1) > 0 ? "available" : "sold")
      } : null };
    }));
  } catch (error) { next(error); }
});

app.get("/api/notifications", authRequired, async (req, res, next) => {
  try {
    if (storageMode === "mongo") {
      const user = await mongoUser.findById(req.user.id).select("notifications").lean();
      return res.json(user?.notifications || []);
    }
    const db = await readJson();
    const user = db.users.find((entry) => String(entry.id) === String(req.user.id));
    res.json(user?.notifications || []);
  } catch (error) { next(error); }
});

app.post("/api/notifications/read", authRequired, async (req, res, next) => {
  try {
    if (storageMode === "mongo") {
      await mongoUser.updateOne({ _id: req.user.id }, { $set: { "notifications.$[].read": true } });
      const user = await mongoUser.findById(req.user.id).select("notifications").lean();
      return res.json(user?.notifications || []);
    }
    const db = await readJson();
    const user = db.users.find((entry) => String(entry.id) === String(req.user.id));
    if (!user) return res.status(404).json({ message: "Account not found." });
    user.notifications = (user.notifications || []).map((item) => ({ ...item, read: true }));
    await writeJson(db);
    res.json(user.notifications);
  } catch (error) { next(error); }
});
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
      await mongoProduct.updateMany({ quantity: { $exists: false } }, { $set: { quantity: 1 } });
      await mongoProduct.updateMany({ status: { $exists: false } }, { $set: { status: "available" } });
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
