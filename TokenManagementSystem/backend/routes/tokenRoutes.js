import express from 'express';
import { createToken, getActiveTokens, updateTokenStatus } from '../controllers/tokenController.js';

const router = express.Router();

// Route to create a token
router.post('/', createToken);

// Route to get active tokens
router.get('/', getActiveTokens);

// Update token status route
router.patch('/update-status', updateTokenStatus);

export default router;
