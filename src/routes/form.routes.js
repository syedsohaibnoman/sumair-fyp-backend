import { Router } from 'express';
import { authGuard } from '../common/guards/auth.guard.js';
import { roleGuard } from '../common/guards/role.guard.js';
import { uploadFiles } from '../common/middlewares/uploadFile.js';
import { addForm, getForms, getSingleForm, updateForm, deleteForm } from '../controllers/form.controller.js';

const router = Router();

const files = uploadFiles([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'anualChallan', maxCount: 1 },
    { name: 'universityIdCard', maxCount: 1 },
    { name: 'paymentReceipt', maxCount: 1 }
]);

router
    .route('/form')
    .post(authGuard, roleGuard(['student']), files, addForm)
    .get(authGuard, roleGuard(['admin']), getForms);

router
    .route('/form/:id')
    .get(authGuard, roleGuard(['admin', 'student']), getSingleForm)
    .patch(authGuard, roleGuard(['admin']), updateForm)
    .delete(authGuard, roleGuard(['admin']), deleteForm);

export default router;