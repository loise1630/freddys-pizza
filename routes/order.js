const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const { Expo } = require('expo-server-sdk'); // Install mo ito: npm install expo-server-sdk

let expo = new Expo();

// PUT: Update Order Status + Send Notification
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        // 1. Update status sa MongoDB (at i-populate ang user para makuha ang token)
        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { status: status }, 
            { new: true }
        ).populate('user'); 

        // 2. Logic para sa Push Notification
        if (order.user && order.user.pushToken) {
            let messages = [{
                to: order.user.pushToken,
                sound: 'default',
                title: "Freddy's Pizza 🍕",
                body: `Your order status is now: ${status}`,
                data: { orderId: order._id }, // Para sa Click to View Details (10pts)
            }];

            // I-send gamit ang Expo SDK
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