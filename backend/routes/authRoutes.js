import express from 'express';
import {
  register,
  login,
  refreshToken,
  getMe,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validator.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getMe);

export default router;

