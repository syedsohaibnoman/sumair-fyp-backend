import { Router } from 'express';
import { authGuard } from '../common/guards/auth.guard.js';
import { roleGuard } from '../common/guards/role.guard.js';
import { addSession, getSessions, getSingleSession, updateSession, deleteSession } from '../controllers/session.controller.js';

const router = Router();

router.use(authGuard, roleGuard(['admin']));

router.route('/session').post(addSession).get(getSessions);
router.route('/session/:id').get(getSingleSession).patch(updateSession).delete(deleteSession);

export default router;