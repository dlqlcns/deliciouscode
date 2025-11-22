import express from 'express'
import { getProfile, updateProfile } from '../controllers/userController.js'
import auth from '../middleware/auth.js'

const router = express.Router()

router.get('/me', auth, getProfile)
router.put('/me', auth, updateProfile)

export default router
