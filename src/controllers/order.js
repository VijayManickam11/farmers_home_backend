const Order = require("../models/mongo.js").Order;

// @desc    Create new order
export const addOrder = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice
  } = req.body;

  // Basic validation
  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items provided' });
  }

  if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.phone) {
    return res.status(400).json({ message: 'Incomplete shipping address' });
  }

  if (!paymentMethod) {
    return res.status(400).json({ message: 'Payment method is required' });
  }

  if (
    typeof itemsPrice !== 'number' ||
    typeof shippingPrice !== 'number' ||
    typeof taxPrice !== 'number' ||
    typeof totalPrice !== 'number'
  ) {
    return res.status(400).json({ message: 'Price fields must be valid numbers' });
  }

  try {
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: 'Order creation failed', error: error.message });
  }
};

// @desc    Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// @desc    Get logged-in user's orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// @desc    Update order to paid
export const updateOrderToPaid = async (req, res) => {
  const { id } = req.params;
  const { paymentResult } = req.body;

  if (
    !paymentResult ||
    !paymentResult.id ||
    !paymentResult.status ||
    !paymentResult.update_time ||
    !paymentResult.email_address
  ) {
    return res.status(400).json({ message: 'Invalid payment result data' });
  }

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = paymentResult;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Payment update failed', error: error.message });
  }
};

// @desc    Update order to delivered
export const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Delivery update failed', error: error.message });
  }
};
