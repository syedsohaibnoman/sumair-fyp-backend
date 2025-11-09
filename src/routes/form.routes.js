import { Router } from 'express';
import { addForm, getForms, getSingleForm, updateForm, deleteForm } from '../controllers/form.controller.js';
import { uploadFiles } from '../common/middlewares/uploadFile.js';

const router = Router();

const files = uploadFiles([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'anualChallan', maxCount: 1 },
    { name: 'universityIdCard', maxCount: 1 },
    { name: 'paymentReceipt', maxCount: 1 }
]);

router.post('/form', files, addForm);
router.get('/form', getForms);
router.get('/form/:id', getSingleForm);
router.patch('/form/:id', updateForm);
router.delete('/form/:id', deleteForm);

export default router;