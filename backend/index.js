// ====================== IMPORTS ======================
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";

// ====================== MODELS ======================
import User from "./Models/User.js";
import Category from "./Models/Category.js";
import Brand from "./Models/Brand.js";
import Product from "./Models/Product.js";
import Order from "./Models/Order.js";
import OrderProduct from "./Models/OrderProduct.js";

// ====================== SETUP ======================
dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors({ origin: "*" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer setup
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ====================== DATABASE CONNECTION ======================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// ====================== AUTH ROUTES ======================

// --- REGISTER ---
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.error("🔥 Register error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- LOGIN ---
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("🔥 Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ====================== DASHBOARD COUNTS ======================
app.get("/api/counts", async (req, res) => {
  try {
    const [categoryCount, brandCount, productCount, orderCount] = await Promise.all([
      Category.countDocuments(),
      Brand.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
    ]);

    res.status(200).json({
      categories: categoryCount,
      brands: brandCount,
      products: productCount,
      orders: orderCount,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch counts: " + err.message });
  }
});

// ====================== CATEGORY ROUTES ======================

// ✅ Get all categories
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Create category
app.post("/api/categories", async (req, res) => {
  try {
    const { name, status } = req.body;
    if (!name || !status)
      return res.status(400).json({ error: "Name and status are required" });

    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ error: "Category already exists" });

    const newCategory = new Category({ name, status });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update category
app.put("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;
    const updated = await Category.findByIdAndUpdate(
      id,
      { name, status },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "Category not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete category
app.delete("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Category not found" });
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================== BRAND ROUTES ======================
app.get("/api/brands", async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 });
    res.status(200).json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/brands", async (req, res) => {
  try {
    const { name, category, status } = req.body;
    if (!name || !category || !status)
      return res.status(400).json({ error: "All fields are required" });

    const newBrand = new Brand({ name, category, status });
    await newBrand.save();
    res.status(201).json(newBrand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ✅ Update Brand
app.put("/api/brands/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, status } = req.body;

    const updatedBrand = await Brand.findByIdAndUpdate(
      id,
      { name, category, status },
      { new: true, runValidators: true }
    );

    if (!updatedBrand) return res.status(404).json({ error: "Brand not found" });
    res.status(200).json(updatedBrand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete Brand
app.delete("/api/brands/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBrand = await Brand.findByIdAndDelete(id);
    if (!deletedBrand) return res.status(404).json({ error: "Brand not found" });

    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================== PRODUCT ROUTES ======================
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/products", upload.single("image"), async (req, res) => {
  try {
    const { name, category, brand, amount, status } = req.body;
    if (!name || !category || !brand || !amount)
      return res.status(400).json({ error: "Missing required fields" });

    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";
    const newProduct = new Product({
      name,
      category,
      brand,
      amount,
      status,
      productImage: imagePath,
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ✅ Update Product
app.put("/api/products/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, brand, amount, status } = req.body;

    // If a new image is uploaded
    let imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updatedFields = { name, category, brand, amount, status };
    if (imagePath) updatedFields.productImage = imagePath;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updatedFields,
      { new: true, runValidators: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ error: "Product not found" });

    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ✅ Delete Product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct)
      return res.status(404).json({ error: "Product not found" });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ====================== ORDER ROUTES ======================

// ✅ Get all orders
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Create new order
app.post("/api/orders", async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerContactNumber,
      customerAddress,
      discountPercentage,
      paymentMode,
      status,
      items,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Order must have at least one product item." });
    }

    let subtotal = 0;
    const orderProductList = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const productTotal = product.amount * item.quantity;
      subtotal += productTotal;

      orderProductList.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.amount,  // ✅ SAVE PRICE HERE
      });
    }

    const discount = subtotal * (discountPercentage / 100);
    const totalAmount = subtotal - discount;
    const totalProducts = items.length;

    const newOrder = new Order({
      customerName,
      customerEmail,
      customerContactNumber,
      customerAddress,
      discountPercentage,
      paymentMode,
      status,
      totalAmount,
      totalProducts,
    });

    const savedOrder = await newOrder.save();

    for (const productItem of orderProductList) {
      await OrderProduct.create({
        orderId: savedOrder._id,
        productId: productItem.productId,
        quantity: productItem.quantity,
        price: productItem.price,  // ✅ Store price
      });
    }

    res.status(201).json({ message: "Order created successfully", orderId: savedOrder._id });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Update/Edit Order
app.put("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customerName,
      customerEmail,
      customerContactNumber,
      customerAddress,
      discountPercentage,
      paymentMode,
      status,
      items,
    } = req.body;

    let subtotal = 0;
    const orderProductList = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      subtotal += product.amount * item.quantity;

      orderProductList.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.amount,
      });
    }

    const discount = subtotal * (discountPercentage / 100);
    const totalAmount = subtotal - discount;
    const totalProducts = items.length;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        customerName,
        customerEmail,
        customerContactNumber,
        customerAddress,
        discountPercentage,
        paymentMode,
        status,
        totalAmount,
        totalProducts,
      },
      { new: true }
    );

    await OrderProduct.deleteMany({ orderId: id });

    for (const productItem of orderProductList) {
      await OrderProduct.create({
        orderId: id,
        productId: productItem.productId,
        quantity: productItem.quantity,
        price: productItem.price,
      });
    }

    res.status(200).json({ message: "Order updated successfully", updatedOrder });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const orderProducts = await OrderProduct.find({ orderId: id })
      .populate("productId", "name amount");

    // ✅ Convert data for frontend UI & PDF format
    const items = orderProducts.map((item) => {
      const unitPrice = item.price;  // item.productId.amount also works
      const lineTotal = unitPrice * item.quantity;

      return {
        _id: item._id,
        productName: item.productId.name,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
      };
    });

    // ✅ Calculate subtotal using items
    const subtotalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

    res.status(200).json({
      order: {
        ...order._doc,
        subtotalAmount, // ✅ needed for PDF and UI
      },
      items,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Delete order
app.delete("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndDelete(id);
    await OrderProduct.deleteMany({ orderId: id });
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================== SERVER START ======================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
