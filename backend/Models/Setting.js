
import mongoose from "mongoose";

const settingSchema = new mongoose.Schema({
  siteName: { type: String, default: "My Shop" },
  logo: { type: String, default: "" },
  currency: { type: String, default: "INR" },
  theme: { type: String, default: "light" },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Setting", settingSchema);
