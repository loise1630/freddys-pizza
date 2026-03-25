const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

// --- ROUTES ---

// 1. POST: Add Review
// Ginagamit ito kapag first time mag-rate ng user
router.post('/add', async (req, res) => {
    try {
        const { productId, userId, userName, rating, comment } = req.body;

        // Validation: Siguraduhing kompleto ang data
        if (!productId || !userId || !rating || !comment) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const newReview = new Review({ 
            productId, 
            userId, 
            userName: userName || "Anonymous", 
            rating, 
            comment 
        });

        await newReview.save();
        res.status(201).json({ message: "Review added successfuly!", review: newReview });
    } catch (error) {
        console.error("Add Review Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// 2. GET: Fetch reviews para sa isang specific product
// 
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId })
                                    .sort({ createdAt: -1 }); // Pinakabago muna
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. GET: Fetch reviews ng isang specific user
// eto naman y yung ginagamit sa MyOrders para malaman kung "Rate" o "Edit" ang button
router.get('/user/:userId', async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.params.userId });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. PUT: Update/Edit Review
// Ginagamit kapag nag-click ang user ng "Edit" sa MyOrders
router.put('/update/:id', async (req, res) => {
    try {
        const { rating, comment } = req.body;
        
        const updatedReview = await Review.findByIdAndUpdate(
            req.params.id, 
            { rating, comment }, 
            { new: true } // Ibalik ang bagong version ng data
        );

        if (!updatedReview) {
            return res.status(404).json({ message: "Review not found." });
        }

        res.json({ message: "Review updated successfully!", review: updatedReview });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.json({ message: "Review deleted." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;