const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Check mo kung tama ang folder name (models o model)

// 1. MANUAL LOGIN (Para sa regular email/password)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Simple password check (Kung may hashing ka like bcrypt, gamitin mo rito)
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid password" });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. GOOGLE LOGIN (Eto ang kailangan para sa Rating feature)
router.post('/google-login', async (req, res) => {
    try {
        const { email, name, googleId, image } = req.body;

        // Hanapin kung existing na ang user base sa email
        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            // Kung registered na, ibalik lang yung user data (kasama ang _id)
            return res.status(200).json(user);
        } else {
            // Kung bago, gawan ng record para magkaroon ng sariling _id sa database
            const newUser = new User({
                name: name,
                email: email.toLowerCase(),
                googleId: googleId,
                image: image,
                isAdmin: false,
                password: Math.random().toString(36).slice(-8), // Dummy password para hindi mag-error ang schema
            });

            const savedUser = await newUser.save();
            return res.status(201).json(savedUser);
        }
    } catch (err) {
        console.error("Google Login Backend Error:", err);
        res.status(500).json({ message: "Error syncing Google user to database" });
    }
});

// 3. PATCH: I-save ang Push Token (Yung dating code mo)
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

module.exports = router;