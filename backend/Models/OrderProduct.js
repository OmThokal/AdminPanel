import mongoose from "mongoose";

const orderProductSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,         // ✅ PRICE FIELD MUST BE NUMBER
      required: true,       // ✅ REQUIRED SO NO ERROR
    },
  },
  { timestamps: true }
);

export default mongoose.model("OrderProduct", orderProductSchema);
