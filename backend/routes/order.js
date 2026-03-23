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

// PUT: Update Status + Notification (35pts Milestone)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        // eto Update status at i-populate ang user
        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { status: status }, 
            { new: true }
        );

        // Kunin ang user separately para sa token (since schema is in server.js)
        const User = mongoose.model('User');
        const user = await User.findOne({ name: order.userName }); 

        // 2. Logic para sa Push Notification
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