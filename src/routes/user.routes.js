import { Router } from 'express';
import { authGuard } from '../common/guards/auth.guard.js';
import { roleGuard } from '../common/guards/role.guard.js';
import { getProfile } from '../controllers/user.controller.js';

const router = Router();

router.get('/profile', authGuard, roleGuard(), getProfile);

export default router;