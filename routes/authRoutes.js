const express = require('express');
const { signup, login } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// Extra route to get all users for team page/assignments
router.get('/users', protect, async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } });

        // Format `_id` and createdAt strings to match what frontend expects
        const formattedUsers = users.map(u => ({
            ...u.toJSON(),
            _id: u.id,
        }));

        res.status(200).json({ success: true, data: formattedUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
