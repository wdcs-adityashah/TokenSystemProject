import express from 'express';
import { getAllOrders,addOrder } from '../controllers/tableOrderController.js';
const router = express.Router();

router.post('/', addOrder);
router.get('/', getAllOrders);


export default router;
