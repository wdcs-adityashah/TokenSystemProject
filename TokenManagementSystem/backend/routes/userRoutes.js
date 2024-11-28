// routes/userRoutes.js
import express from 'express';
import { loginUser, registerUser,getUsers,blockUser,getBlockedUsers } from '../controllers/userController.js';
import { validateEmail } from '../middleware/Validaterequest.js';
const router = express.Router();

router.post('/register',validateEmail, registerUser);
router.post('/login',validateEmail,loginUser);
router.get('/register',getUsers);
router.post('/block/:id', blockUser ); // Add this line for blocking a user
router.get('/blocked-users',getBlockedUsers);
export default router;