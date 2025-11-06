// Routes/orderRoutes.js
import express from "express";
import Order from "../Models/Order.js";
import OrderProduct from "../Models/OrderProduct.js";

const router = express.Router();

// ✅ Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Create a new order
router.post("/", async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerContactNumber,
      totalProducts,
      totalAmount,
      discountPercentage,
      paymentMode,
    } = req.body;

    if (!customerName || !customerEmail || !totalAmount || !paymentMode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newOrder = new Order({
      customerName,
      customerEmail,
      customerContactNumber,
      totalProducts,
      totalAmount,
      discountPercentage,
      paymentMode,
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete an order + related products
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) return res.status(404).json({ error: "Order not found" });

    await OrderProduct.deleteMany({ orderId: id });

    res.status(200).json({ message: "Order and related products deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
