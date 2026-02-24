require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());

// Panatilihin ang mataas na limit para sa images at products
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log("Connected to MongoDB Atlas! 🍕"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// --- MODELS (Kumpleto) ---

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
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

// --- ROUTES ---

// 1. AUTHENTICATION (Login at Register)
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists!" });
    user = new User({ name, email, password, isAdmin: false });
    await user.save();
    res.status(201).json({ message: "Registration Successful!" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    res.json({ user });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. PRODUCTS (Para sa Menu)
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 3. ORDERS MANAGEMENT (Dito natin nilagay yung gumanang logic)

// PLACE NEW ORDER
app.post('/api/orders', async (req, res) => {
  try {
    console.log("New order receiving for:", req.body.userName);
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET ALL ORDERS (Para sa Admin)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET ORDERS BY USERNAME (Yung gumanang case-insensitive logic)
app.get('/api/orders/user/:userName', async (req, res) => {
  try {
    const { userName } = req.params;
    console.log("LOG: May nagre-request ng orders para kay:", userName);

    const orders = await Order.find({ 
      userName: { $regex: new RegExp("^" + userName + "$", "i") } 
    }).sort({ createdAt: -1 });

    console.log(`LOG: Nakahanap ng ${orders.length} orders.`);
    res.json(orders);
  } catch (error) { 
    res.status(500).json({ message: "Error fetching user orders", error: error.message }); 
  }
});

// UPDATE ORDER STATUS
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    res.json(updatedOrder);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// DELETE ORDER
app.delete('/api/orders/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted!" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));