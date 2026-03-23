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

// --- MODELS ---
const User = mongoose.model('User', new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone:    { type: String, default: '' },
  address:  { type: String, default: '' },
  isAdmin:  { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  pushToken:{ type: String, default: '' },
  googleId: { type: String, default: '' },
  image:    { type: String, default: '' },
}));

const Product = mongoose.model('Product', new mongoose.Schema({
  name:        { type: String, required: true },
  price:       { type: Number, required: true },
  description: { type: String, required: true },
  category:    { type: String, default: 'Pizza' },
  images:      { type: [String], required: true },
  stock:       { type: Number, default: 0 },
}));

const Order = mongoose.model('Order', new mongoose.Schema({
  userName:    { type: String, required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String, price: Number,
    quantity: { type: Number, default: 1 },
  }],
  totalAmount: { type: Number, required: true },
  status:      { type: String, default: 'Pending' },
  createdAt:   { type: Date, default: Date.now },
}));

app.use('/api/reviews', require('./routes/review'));

// --- HELPERS ---
const err500 = (res, e) => res.status(500).json({ error: e.message });

// --- USER ROUTES ---
app.post('/api/users/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email.toLowerCase(), password: req.body.password });
    if (!user) return res.status(400).json({ message: 'Wrong credentials' });
    if (!user.isActive) return res.status(403).json({ message: 'Account is deactivated' });
    res.json(user);
  } catch (e) { err500(res, e); }
});

app.post('/api/users/google-login', async (req, res) => {
  try {
    const { email, name, googleId, image } = req.body;
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      if (!user.isActive) return res.status(403).json({ message: 'Account is deactivated' });
      user.googleId = googleId;
      if (image) user.image = image;
      await user.save();
    } else {
      user = await new User({ name, email: email.toLowerCase(), googleId, image, password: Math.random().toString(36).slice(-10) }).save();
    }
    res.json(user);
  } catch (e) { err500(res, e); }
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(400).json({ message: 'User exists' });
    await new User({ name, email: email.toLowerCase(), password, phone, address }).save();
    res.status(201).json({ message: 'Registered!' });
  } catch (e) { err500(res, e); }
});

app.get('/api/users', async (req, res) => {
  try { res.json(await User.find().sort({ name: 1 })); }
  catch (e) { err500(res, e); }
});

app.put('/api/users/:id/status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    res.json(await user.save());
  } catch (e) { err500(res, e); }
});

app.put('/api/users/:id/role', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isAdmin = !user.isAdmin;
    res.json(await user.save());
  } catch (e) { err500(res, e); }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { name, phone, address, password, image } = req.body;
    const updates = { name, phone, address, image };
    if (password && password.trim().length > 0) updates.password = password;
    const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (e) { err500(res, e); }
});

app.post('/api/users/update-push-token', async (req, res) => {
  try {
    const { userId, pushToken } = req.body;
    const u = await User.findByIdAndUpdate(userId, { pushToken: pushToken || '' }, { new: true });
    res.json({ message: 'Token updated', user: u?.name });
  } catch (e) { err500(res, e); }
});

// --- PRODUCT ROUTES ---
app.get('/api/products', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category && category !== 'All') query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    res.json(await Product.find(query).sort({ _id: -1 }));
  } catch (e) { err500(res, e); }
});

app.post('/api/products', async (req, res) => {
  try { res.status(201).json(await new Product(req.body).save()); }
  catch (e) { err500(res, e); }
});

app.put('/api/products/:id', async (req, res) => {
  try { res.json(await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (e) { err500(res, e); }
});

app.delete('/api/products/:id', async (req, res) => {
  try { await Product.findByIdAndDelete(req.params.id); res.json({ message: 'Product deleted successfully' }); }
  catch (e) { err500(res, e); }
});

// --- ORDER ROUTES ---
app.post('/api/orders', async (req, res) => {
  try {
    const order = await new Order(req.body).save();
    await Promise.all(req.body.items.map(i => Product.findByIdAndUpdate(i.productId, { $inc: { stock: -i.quantity } })));
    res.status(201).json(order);
  } catch (e) { err500(res, e); }
});

app.get('/api/orders', async (req, res) => {
  try { res.json(await Order.find().sort({ createdAt: -1 })); }
  catch (e) { err500(res, e); }
});

app.get('/api/orders/user/:name', async (req, res) => {
  try { res.json(await Order.find({ userName: req.params.name }).sort({ createdAt: -1 })); }
  catch (e) { err500(res, e); }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    const user = await User.findOne({ name: order.userName });
    if (user?.pushToken && Expo.isExpoPushToken(user.pushToken)) {
      const chunks = expo.chunkPushNotifications([{
        to: user.pushToken, sound: 'default',
        title: "Freddy's Pizza Update 🍕",
        body: `Ang status ng iyong order ay: ${status}`,
        data: { orderId: order._id, status },
      }]);
      for (const chunk of chunks) {
        const tickets = await expo.sendPushNotificationsAsync(chunk);
        for (const ticket of tickets) {
          if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered')
            await User.findByIdAndUpdate(user._id, { pushToken: '' });
        }
      }
    }
    res.json(order);
  } catch (e) { err500(res, e); }
});

app.listen(process.env.PORT || 5000, '0.0.0.0', () =>
  console.log(`Server running on port ${process.env.PORT || 5000} 🚀`)
);