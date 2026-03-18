const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Siguraduhin na tama ang path ng Model mo

// PATCH: I-save ang Push Token ng user
router.patch('/:id/push-token', async (req, res) => {
    try {
        const { pushToken } = req.body;
        // Hahanapin yung user gamit ang ID at i-uupdate yung pushToken field
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