import { Router } from 'express';
import { authGuard } from '../common/guards/auth.guard.js';
import { roleGuard } from '../common/guards/role.guard.js';
import { addStudent, getStudents, getSingleStudent, updateStudent, deleteStudent } from '../controllers/student.controller.js';

const router = Router();

router.use(authGuard, roleGuard(['admin']));

router.route('/student').post(addStudent).get(getStudents);
router.route('/student/:id').get(getSingleStudent).patch(updateStudent).delete(deleteStudent);

export default router;