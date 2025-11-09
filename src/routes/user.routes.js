import { Router } from 'express';
import { getProfile } from '../controllers/user.controller.js';
import { authGuard } from '../common/guards/auth.guard.js';

const router = Router();

router.get('/profile', authGuard, getProfile);

export default router;