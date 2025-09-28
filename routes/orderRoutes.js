import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrdersByGuest,
  deleteOrder,
  getDailyRevenue,
  getBestSellingItems,
  getSalesBreakdown,
  getPreparingOrders
} from "../controllers/orderController.js";

const router = express.Router();

router.get('/preparing', getPreparingOrders);

// Create a new order
router.post("/", createOrder);

// Get all orders
router.get("/", getOrders);

// Get order by ID
router.get("/:id", getOrderById);

// Update order status
router.patch("/:id/status", updateOrderStatus);

// Get orders by guest
router.get("/guest/:guestId", getOrdersByGuest);

// GET /preparing - get all orders with status 'preparing'

// Delete order
router.delete("/:id", deleteOrder);

// Analytics routes
router.get("/analytics/daily-revenue", getDailyRevenue);
router.get("/analytics/best-selling", getBestSellingItems);
router.get("/analytics/sales-breakdown", getSalesBreakdown);

export default router;
