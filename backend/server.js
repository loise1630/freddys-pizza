require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Expo } = require('expo-server-sdk');

const app = express();
const expo = new Expo();

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB Atlas! 🍕"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// --- MODELS ---

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  isAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }, 
  pushToken: { type: String, default: "" },
  googleId: { type: String, default: "" }, 
  image: { type: String, default: "" }    
});
const User = mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, default: "Pizza" }, 
  images: { type: [String], required: true },
  stock: { type: Number, default: 0 } // ✅ Added Stock field
});
const Product = mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      price: Number,
      quantity: { type: Number, default: 1 }
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Pending' }, 
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

// --- EXTERNAL ROUTES ---
const reviewRoutes = require('./routes/review');
app.use('/api/reviews', reviewRoutes);

// --- ROUTES ---

// 1. USER AUTH & MANAGEMENT
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase(), password });
    if (!user) return res.status(400).json({ message: "Wrong credentials" });
    if (!user.isActive) return res.status(403).json({ message: "Account is deactivated" });
    res.json(user);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/users/google-login', async (req, res) => {
  try {
    const { email, name, googleId, image } = req.body;
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      if (!user.isActive) return res.status(403).json({ message: "Account is deactivated" });
      user.googleId = googleId;
      if (image) user.image = image;
      await user.save();
    } else {
      user = new User({
        name,
        email: email.toLowerCase(),
        googleId,
        image,
        password: Math.random().toString(36).slice(-10),
        isActive: true,
        isAdmin: false
      });
      await user.save();
    }
    res.json(user);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) return res.status(400).json({ message: "User exists" });
    user = new User({ name, email: email.toLowerCase(), password, phone, address });
    await user.save();
    res.status(201).json({ message: "Registered!" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ name: 1 });
    res.json(users);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/users/:id/status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json(user);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/users/:id/role', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.json(user);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/users/update-push-token', async (req, res) => {
  try {
    const { userId, pushToken } = req.body;
    const updatedUser = await User.findByIdAndUpdate(userId, { pushToken: pushToken || "" }, { new: true });
    res.json({ message: "Token updated", user: updatedUser?.name });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. PRODUCTS (CRUD + STOCK + UPDATED PRICE FILTER)
app.get('/api/products', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query; // ✅ Binabasa na ang min/max price
    
    let query = {};

    // Filter by Search Name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Filter by Category
    if (category && category !== 'All') {
      query.category = category;
    }

    // ✅ Filter by Price Range Logic
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query).sort({ _id: -1 });
    res.json(products);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 3. ORDERS (STOCK REDUCTION)
app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();

    for (const item of req.body.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }
    res.status(201).json(newOrder);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/orders/user/:name', async (req, res) => {
  try {
    const orders = await Order.find({ userName: req.params.name }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    const user = await User.findOne({ name: updatedOrder.userName });
    if (user && user.pushToken && Expo.isExpoPushToken(user.pushToken)) {
      let messages = [{
        to: user.pushToken,
        sound: 'default',
        title: "Freddy's Pizza Update 🍕",
        body: `Ang status ng iyong order ay: ${status}`,
        data: { orderId: updatedOrder._id, status },
      }];
      let chunks = expo.chunkPushNotifications(messages);
      for (let chunk of chunks) {
        let tickets = await expo.sendPushNotificationsAsync(chunk);
        for (let ticket of tickets) {
          if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
            await User.findByIdAndUpdate(user._id, { pushToken: "" });
          }
        }
      }
    }
    res.json(updatedOrder);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} 🚀`);
});