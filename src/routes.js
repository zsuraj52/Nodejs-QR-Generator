import express from 'express';
import { registerUser , createQRCode , scanQR} from './api/controller/controller.js';

const router = express.Router();

router.post('/register', registerUser) ; 
router.post('/create_qrcode', createQRCode); 
router.get('/scan/qr', scanQR);


export default router;