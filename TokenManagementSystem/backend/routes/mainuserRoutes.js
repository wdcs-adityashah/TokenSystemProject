import express from 'express'
import { ValidateCredentials } from '../controllers/mainusercontroller.js'
const router = express.Router()
router.post('/',ValidateCredentials)
export default router;