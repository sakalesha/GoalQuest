// server/routes/auth.js
import express from 'express';
import { register, login, seedDatabase } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/seed', seedDatabase);

export default router;
