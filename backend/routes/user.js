const express = require('express');
const router = express.Router();
const User = require('../models/user');

// 1. MANUAL LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid password" });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. GOOGLE LOGIN
router.post('/google-login', async (req, res) => {
    try {
        const { email, name, googleId, image } = req.body;

        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            return res.status(200).json(user);
        } else {
            const newUser = new User({
                name: name,
                email: email.toLowerCase(),
                googleId: googleId,
                image: image,
                isAdmin: false,
                password: Math.random().toString(36).slice(-8),
            });

            const savedUser = await newUser.save();
            return res.status(201).json(savedUser);
        }
    } catch (err) {
        console.error("Google Login Backend Error:", err);
        res.status(500).json({ message: "Error syncing Google user to database" });
    }
});

// 3. PUSH TOKEN
router.patch('/:id/push-token', async (req, res) => {
    try {
        const { pushToken } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { pushToken: pushToken },
            { new: true }
        );
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. UPDATE PROFILE ← ITO ANG KULANG!
router.put('/:id', async (req, res) => {
    try {
        const { name, phone, address, image, password } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Name cannot be empty." });
        }

        const updateData = {
            name: name.trim(),
            phone: phone || '',
            address: address || '',
            image: image || '',
        };

        // I-update lang ang password kung may bagong password
        if (password && password.trim()) {
            updateData.password = password.trim();
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json(updatedUser);
    } catch (err) {
        console.error("Update Profile Error:", err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;