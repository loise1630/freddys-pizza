const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Expo } = require('expo-server-sdk');

let expo = new Expo();
const Order = mongoose.model('Order');

// GET: All orders for Admin
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET: Orders by user name ← KULANG ITO
router.get('/user/:name', async (req, res) => {
    try {
        const orders = await Order.find({ userName: req.params.name }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST: Create new order ← KULANG DIN ITO
router.post('/', async (req, res) => {
    try {
        const { userName, userAddress, items, totalAmount, status } = req.body;

        if (!userName || !items || items.length === 0) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const newOrder = new Order({
            userName,
            userAddress,
            items,
            totalAmount,
            status: status || 'Pending',
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        console.error('Create Order Error:', err);
        res.status(500).json({ message: err.message });
    }
});

// PUT: Update Status + Notification
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        );

        const User = mongoose.model('User');
        const user = await User.findOne({ name: order.userName });

        if (user && user.pushToken && Expo.isExpoPushToken(user.pushToken)) {
            let messages = [{
                to: user.pushToken,
                sound: 'default',
                title: "Freddy's Pizza Update",
                body: `Order status: ${status}`,
                data: { orderId: order._id },
            }];

            let chunks = expo.chunkPushNotifications(messages);
            for (let chunk of chunks) {
                await expo.sendPushNotificationsAsync(chunk);
            }
        }

        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;