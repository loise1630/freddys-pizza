require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Expo } = require('expo-server-sdk');

const app = express();
const expo = new Expo();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas! 🍕'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- SCHEMAS & MODELS ---
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  phone:     { type: String, default: '' },
  address:   { type: String, default: '' },
  isAdmin:   { type: Boolean, default: false },
  isActive:  { type: Boolean, default: true },
  pushToken: { type: String, default: '' },
  image:     { type: String, default: '' },
}));

const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
  name:         { type: String, required: true },
  price:        { type: Number, required: true },
  description:  { type: String, required: true },
  category:     { type: String, default: 'Pizza' },
  images:       { type: [String], required: true },
  stock:        { type: Number, default: 0 },
}));

const Order = mongoose.models.Order || mongoose.model('Order', new mongoose.Schema({
  userName:     { type: String, required: true },
  userAddress:  { type: String, default: '' },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String, 
    price: Number,
    quantity: { type: Number, default: 1 },
  }],
  totalAmount: { type: Number, required: true },
  status:       { type: String, default: 'Pending' },
  createdAt:    { type: Date, default: Date.now },
}));

const Review = mongoose.models.Review || mongoose.model('Review', new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId:    { type: String, required: true },
  userName:  { type: String, required: true },
  rating:    { type: Number, required: true, min: 1, max: 5 },
  comment:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}));

// --- ROUTES ---

// 1. ORDERS (FIXED FOR APK COMPATIBILITY)
app.post('/api/orders', async (req, res) => {
  try {
    const { userName, userAddress, items, totalAmount } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // MAP ITEMS: Dito natin sasaluhin ang ID mula sa APK
    const processedItems = items.map(item => ({
      // Titingnan kung 'productId' o '_id' ang pinasa ng APK
      productId: item.productId || item._id, 
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1
    }));

    const newOrder = new Order({
      userName,
      userAddress,
      items: processedItems,
      totalAmount
    });

    const savedOrder = await newOrder.save();

    // UPDATE STOCK: Isa-isang babawasan ang product stock
    for (const item of processedItems) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, { 
          $inc: { stock: -item.quantity } 
        });
      }
    }

    console.log(`Order success for: ${userName}`);
    res.status(201).json(savedOrder);
  } catch (e) {
    console.error("Order processing failed:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// 2. AUTH & USERS
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim(), password });
    if (!user) return res.status(400).json({ message: 'Wrong credentials' });
    if (!user.isActive) return res.status(403).json({ message: 'Account is deactivated' });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    const newUser = new User({ name, email: email.toLowerCase().trim(), password, phone, address });
    await newUser.save();
    res.status(201).json({ message: 'Registered successfully!' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedUser);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. PRODUCTS
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 });
    res.json(products);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/products', async (req, res) => {
  try {
    const prod = new Product(req.body);
    await prod.save();
    res.status(201).json(prod);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4. NOTIFICATIONS & STATUS UPDATE
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    // Auto-send Push Notification via Expo
    const user = await User.findOne({ name: order.userName });
    if (user?.pushToken && Expo.isExpoPushToken(user.pushToken)) {
      const messages = [{
        to: user.pushToken,
        sound: 'default',
        title: "Freddy's Pizza Update 🍕",
        body: `Your order status: ${status}`,
        data: { orderId: order._id },
      }];
      let chunks = expo.chunkPushNotifications(messages);
      for (let chunk of chunks) { await expo.sendPushNotificationsAsync(chunk); }
    }
    res.json(order);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 5. MISC
app.get('/api/orders/user/:name', async (req, res) => {
  try {
    const orders = await Order.find({ userName: req.params.name }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend is running on port ${PORT} 🚀`);
});