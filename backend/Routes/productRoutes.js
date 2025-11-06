import express from "express";
import multer from "multer";
import path from "path";
import Product from "../Models/Product.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    cb(null, "IMAGE-" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
}).single("image");

router.get("/", async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = search ? { name: new RegExp(search, "i") } : {};
    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("category")
      .populate("brand");
    const count = await Product.countDocuments(query);
    res.json({ products, totalPages: Math.ceil(count / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    const { name, category, brand, price, stock, status } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    try {
      const newProduct = new Product({
        name,
        image,
        category,
        brand,
        price,
        stock,
        status,
      });
      await newProduct.save();
      res.status(201).json(newProduct);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
});

export default router;
