import express, { Router } from 'express';
import {
  register,
  login,
  getMe,
  changePassword,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router: Router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

export default router;
