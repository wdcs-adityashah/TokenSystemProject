import express from 'express';
import {  createMenuItem,getMenuItems,deleteMenuItem } from '../controllers/menuController.js';
const router = express.Router();
import { updateMenuItem } from '../controllers/menuController.js';
router.post('/', createMenuItem);
router.get('/',getMenuItems);
router.patch('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem); // Delete an item

// Delete a menu item

export default router;
