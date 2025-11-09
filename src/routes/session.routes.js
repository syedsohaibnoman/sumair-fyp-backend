import { Router } from 'express';
import { addSession, getSessions, getSingleSession, updateSession, deleteSession } from '../controllers/session.controller.js';

const router = Router();

router.post('/session', addSession);
router.get('/session', getSessions);
router.get('/session/:id', getSingleSession);
router.patch('/session/:id', updateSession);
router.delete('/session/:id', deleteSession);

export default router;