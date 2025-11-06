// Routes/settingRoutes.js
import express from "express";
import Setting from "../Models/Setting.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Get settings
router.get("/", async (req, res) => {
  try {
    const setting = await Setting.findOne();
    res.json(setting || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update settings
router.put("/", upload.single("logo"), async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: new Date() };
    if (req.file) updateData.logo = `/uploads/${req.file.filename}`;

    let setting = await Setting.findOne();
    if (setting) {
      setting = await Setting.findByIdAndUpdate(setting._id, updateData, { new: true });
    } else {
      setting = new Setting(updateData);
      await setting.save();
    }

    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
