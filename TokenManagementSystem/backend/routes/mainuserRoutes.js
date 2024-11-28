import express from 'express'
import { ValidateCredentials } from '../controllers/mainusercontroller.js'
import User from '../models/User.js';
const router = express.Router();
router.post('/block-user', async (req, res) => {
    const { userId } = req.body; // Assuming userId is the username

    try {
        await User.findOneAndUpdate({ username: userId }, { isBlocked: true });
        res.status(200).json({ message: "User  blocked successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error blocking user." });
    }
});

// Unblock a user
router.post('/unblock-user', async (req, res) => {
    const { userId } = req.body; // Assuming userId is the username

    try {
        await User.findOneAndUpdate({ username: userId }, { isBlocked: false });
        res.status(200).json({ message: "User  unblocked successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error unblocking user." });
    }
});

router.post('/',ValidateCredentials)
export default router;