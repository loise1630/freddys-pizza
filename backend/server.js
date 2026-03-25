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

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas! 🍕'))
  .catch(err => console.error('MongoDB Connection Error:', err));

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  password:  { type: String, required: true },
  phone:     { type: String, default: '' },
  address:   { type: String, default: '' },
  isAdmin:   { type: Boolean, default: false },
  isActive:  { type: Boolean, default: true },
  pushToken: { type: String, default: '' },
  googleId:  { type: String, default: '' },
  image:     { type: String, default: '' },
});
const User = mongoose.model('User', userSchema);

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  price:       { type: Number, required: true },
  description: { type: String, required: true },
  category:    { type: String, default: 'Pizza' },
  images:      { type: [String], required: true },
  stock:       { type: Number, default: 0 },
});
const Product = mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({
  userName:    { type: String, required: true },
  userAddress: { type: String, default: '' },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:      String,
    price:     Number,
    quantity:  { type: Number, default: 1 },
  }],
  totalAmount: { type: Number, required: true },
  status:      { type: String, default: 'Pending' },
  createdAt:   { type: Date, default: Date.now },
});
const Order = mongoose.model('Order', orderSchema);

const reviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId:    { type: String, required: true },
  userName:  { type: String, required: true },
  rating:    { type: Number, required: true, min: 1, max: 5 },
  comment:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Review = mongoose.model('Review', reviewSchema);

const err500 = (res, e) => {
  console.error("Server Error:", e.message);
  res.status(500).json({ error: e.message });
};

/** 1. AUTH & USERS **/
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim(), password });
    if (!user) return res.status(400).json({ message: 'Wrong credentials' });
    if (!user.isActive) return res.status(403).json({ message: 'Account is deactivated' });
    res.json(user);
  } catch (e) { err500(res, e); }
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    const newUser = new User({ name, email: email.toLowerCase().trim(), password, phone, address });
    await newUser.save();
    res.status(201).json({ message: 'Registered successfully!' });
  } catch (e) { err500(res, e); }
});

app.post('/api/users/update-push-token', async (req, res) => {
  try {
    const { userId, pushToken } = req.body;
    const u = await User.findByIdAndUpdate(userId, { pushToken: pushToken || '' }, { new: true });
    res.json({ message: 'Token updated', user: u?.name });
  } catch (e) { err500(res, e); }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, phone, address, image, password } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name cannot be empty.' });
    const updateData = { name: name.trim(), phone: phone || '', address: address || '', image: image || '' };
    if (password && password.trim()) updateData.password = password.trim();
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json(updatedUser);
  } catch (e) { err500(res, e); }
});

/** 2. PRODUCTS **/
app.get('/api/products', async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category && category !== 'All') query.category = category;
    const products = await Product.find(query).sort({ _id: -1 });
    res.json(products);
  } catch (e) { err500(res, e); }
});

app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (e) { err500(res, e); }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found.' });
    res.json(updated);
  } catch (e) { err500(res, e); }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted.' });
  } catch (e) { err500(res, e); }
});

/** 3. ORDERS **/
app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    await Promise.all(req.body.items.map(i =>
      Product.findByIdAndUpdate(i.productId, { $inc: { stock: -i.quantity } })
    ));
    res.status(201).json(order);
  } catch (e) { err500(res, e); }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) { err500(res, e); }
});

app.get('/api/orders/user/:name', async (req, res) => {
  try {
    const orders = await Order.find({ userName: req.params.name }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (e) { err500(res, e); }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    const user = await User.findOne({ name: order.userName });
    if (user?.pushToken && Expo.isExpoPushToken(user.pushToken)) {
      const messages = [{
        to: user.pushToken,
        sound: 'default',
        title: "Freddy's Pizza Update 🍕",
        body: `Ang status ng iyong order ay: ${status}`,
        data: { orderId: order._id, status },
      }];
      const chunks = expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        try { await expo.sendPushNotificationsAsync(chunk); }
        catch (error) { console.error("Push Error:", error); }
      }
    }
    res.json(order);
  } catch (e) { err500(res, e); }
});

/** 4. REVIEWS **/
app.post('/api/reviews/add', async (req, res) => {
  try {
    const { productId, userId, userName, rating, comment } = req.body;
    if (!productId || !userId || !rating || !comment) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const review = new Review({ productId, userId, userName: userName || 'Anonymous', rating, comment });
    await review.save();
    res.status(201).json(review);
  } catch (e) { err500(res, e); }
});

app.get('/api/reviews/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (e) { err500(res, e); }
});

app.get('/api/reviews/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (e) { err500(res, e); }
});

app.put('/api/reviews/update/:id', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const updated = await Review.findByIdAndUpdate(
      req.params.id, { rating, comment }, { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Review not found.' });
    res.json(updated);
  } catch (e) { err500(res, e); }
});

app.delete('/api/reviews/delete/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted.' });
  } catch (e) { err500(res, e); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`-----------------------------------------`);
  console.log(`Freddy's Pizza Backend is LIVE! 🚀`);
  console.log(`Port: ${PORT}`);
  console.log(`Listening on all interfaces (0.0.0.0)`);
  console.log(`-----------------------------------------`);
});