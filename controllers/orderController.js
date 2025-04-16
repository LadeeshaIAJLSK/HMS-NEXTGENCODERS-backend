const Order = require("../models/Order");

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    // Generate a unique order number
    const orderCount = await Order.countDocuments();
    const orderNo = `ORD-${Date.now().toString().slice(-6)}-${orderCount + 1}`;
    
    // Create order with the generated order number
    const orderData = {
      ...req.body,
      orderNo
    };
    
    const newOrder = new Order(orderData);
    await newOrder.save();
    
    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: error.message || "Error creating order" });
  }
};

// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Error fetching orders" });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Error fetching order" });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !["completed", "preparing", "payment pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Error updating order status" });
  }
};

// Get orders by guest
exports.getOrdersByGuest = async (req, res) => {
  try {
    const { guestId } = req.params;
    
    const orders = await Order.find({
      "guestInfo.guestId": guestId
    }).sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error("Error fetching guest orders:", error);
    res.status(500).json({ error: "Error fetching guest orders" });
  }
};
