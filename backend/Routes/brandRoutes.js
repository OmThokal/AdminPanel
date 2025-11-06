const express = require("express");
const router = express.Router();
const Brand = require("../Models/Brand");
router.get("/", async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 });
    res.status(200).json(brands);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  const brand = new Brand({
    name: req.body.name,
    category: req.body.category,
    status: req.body.status || "Active",
  });
  try {
    const newBrand = await brand.save();
    res.status(201).json(newBrand);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedBrand = await Brand.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        category: req.body.category,
        status: req.body.status,
      },
      { new: true, runValidators: true }
    );
    if (updatedBrand == null) {
      return res.status(404).json({ message: "Cannot find brand" });
    }
    res.status(200).json(updatedBrand);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedBrand = await Brand.findByIdAndDelete(req.params.id);
    if (deletedBrand == null) {
      return res.status(404).json({ message: "Cannot find brand" });
    }
    res.status(200).json({ message: "Brand deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
