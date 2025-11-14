import { Router } from 'express';
import { login, logout } from '../controllers/auth.controller.js';

const router = Router();

// router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', logout);
// router.post('/auth/forget-password', (req, res) => {});
// router.post('/auth/reset-password', (req, res) => {});

export default router;