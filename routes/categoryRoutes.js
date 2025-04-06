const express = require("express");
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  getSubcategories,
  addCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// Define routes
router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.get("/:id/subcategories", getSubcategories);
router.post("/", addCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
