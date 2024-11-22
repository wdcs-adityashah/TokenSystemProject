import express from 'express';
import { getTableReservations,UpdateTableReservation} from '../controllers/tableController.js';
const router = express.Router();
router.post('/reserve-table',UpdateTableReservation);
router.get('/reservations',getTableReservations);
export default router;