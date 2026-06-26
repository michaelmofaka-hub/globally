import express from 'express';
import { adminLogin } from '../controllers/adminauth.js';
import { login, signin } from '../controllers/userauth.js';

const router = express.Router();

router.post('/admin/login', adminLogin);
router.post('/user/login', login);
router.post('/user/signin', signin);



export default router;
