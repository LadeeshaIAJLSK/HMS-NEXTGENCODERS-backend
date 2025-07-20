const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  getProductsByCategory,
  getLowStockProducts,
  updateProductStock,
  updateMultipleProductStock,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router.get("/", getProducts);
router.get("/low-stock", getLowStockProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProductById);
router.post("/", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.patch("/:id/stock", updateProductStock);
router.patch("/update-stock", updateMultipleProductStock);

module.exports = router;
