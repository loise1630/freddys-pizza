require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());

// Limit adjustment para sa images (Base64 strings)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log("Connected to MongoDB Atlas! 🍕"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// --- MODELS ---

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

// --- ROUTES ---

// USERS
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User na ito, gamit na ang email!" });
    user = new User({ name, email, password, isAdmin: false });
    await user.save();
    res.status(201).json({ message: "Registration Successful! 🍕" });
  } catch (error) {
    res.status(500).json({ message: "Error sa server", error });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(400).json({ message: "Maling email o password!" });
    res.json({
      message: "Login Successful!",
      user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin }
    });
  } catch (error) {
    res.status(500).json({ message: "Error sa server", error });
  }
});

// PRODUCTS

// Add Product
app.post('/api/products', async (req, res) => {
  try {
    const { name, price, description, images } = req.body;

    if (!images || images.length === 0) {
      return res.status(400).json({ message: "At least one image is required!" });
    }

    const newProduct = new Product({ 
        name, 
        price: Number(price), 
        description, 
        images 
    });

    await newProduct.save();
    res.status(201).json({ message: "Pizza added successfully!", product: newProduct });
  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).json({ message: "Error sa pag-save ng pizza", error: error.message });
  }
});

// Get All Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error sa pagkuha ng pizza", error });
  }
});

// DELETE PRODUCT - Ginagamit ang ID galing sa Frontend
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Pizza not found" });
    }
    res.json({ message: "Pizza deleted successfully! 🗑️" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Error sa pag-delete", error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});