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
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
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
  images: { type: [String], required: true } 
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
// Siguraduhin na ang review.js ay nasa backend/routes/ folder
const reviewRoutes = require('./routes/review');
app.use('/api/reviews', reviewRoutes);

// --- ROUTES ---

// 1. AUTHENTICATION (Register & Login)
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) return res.status(400).json({ message: "User already exists!" });
    
    user = new User({ 
        name, 
        email: email.toLowerCase(), 
        password, 
        phone: phone || "", 
        address: address || "" 
    });
    await user.save();
    res.status(201).json({ message: "Registration Successful!" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase(), password });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    res.json(user); 
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. GOOGLE LOGIN (Fix para sa Ratings)
app.post('/api/users/google-login', async (req, res) => {
  try {
    const { email, name, googleId, image } = req.body;
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      res.json(user);
    } else {
      const newUser = new User({
        name,
        email: email.toLowerCase(),
        googleId,
        image,
        isAdmin: false,
        password: Math.random().toString(36).slice(-8) 
      });
      const savedUser = await newUser.save();
      res.status(201).json(savedUser);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. PRODUCTS MANAGEMENT
app.get('/api/products', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;
    let query = {};
    if (search && search.trim() !== "") query.name = { $regex: search, $options: 'i' }; 
    if (category && category !== 'All') query.category = category;
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
    const { name, price, description, images, category } = req.body;
    const newProduct = new Product({ name, price, description, images, category });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 4. ORDERS MANAGEMENT
app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/orders/user/:name', async (req, res) => {
  try {
    const orders = await Order.find({ userName: req.params.name }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 5. ORDER STATUS & PUSH NOTIFICATIONS (Deep Linking Finalized)
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
        data: { 
            orderId: updatedOrder._id,
            status: status // Kailangan ito para sa MyOrders tab switching
        },
      }];
      let chunks = expo.chunkPushNotifications(messages);
      for (let chunk of chunks) await expo.sendPushNotificationsAsync(chunk);
    }
    res.json(updatedOrder);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} 🚀`);
});