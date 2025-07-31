const express = require("express");
const {
  addToCart,
  countMyCart,
  myCartItems,
  myPurchasedItems,
  purchaseCartItems,
  removeCartItems,
} = require("../controllers/cartController");

const cartRouter = express.Router();

cartRouter.post("/add-to-cart", addToCart);

cartRouter.get("/:userEmail/cart-count", countMyCart);
cartRouter.get("/:userEmail/cart-item", myCartItems);
cartRouter.get("/:userEmail/:role/purchased-item", myPurchasedItems);

cartRouter.put("/purchase-item", purchaseCartItems);

cartRouter.delete("/:id/cart-item", removeCartItems);

module.exports = cartRouter;

