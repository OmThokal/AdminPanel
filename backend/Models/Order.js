import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerContactNumber: { type: String, required: true },
  customerAddress: { type: String, required: true }, 
  discountPercentage: { type: Number, default: 0 },
  paymentMode: { type: String, enum: ["Cash", "Card", "Pending"], default: "Cash" },
  status: { type: String, enum: ["Active", "Completed", "Canceled", "Inactive"], default: "Active" },
  totalAmount: { type: Number, required: true },
  totalProducts: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Order", orderSchema);
