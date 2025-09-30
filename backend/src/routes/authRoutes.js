import express from 'express';
import { postLogin, jwtAuthentication, postLogout } from '../controllers/authController.js';

const router = express.Router();

// Đăng nhập
router.post('/login', postLogin);

// Kiểm tra auth
router.get('/auth', jwtAuthentication, (req, res) => {
  res.json({ isAuth: true, userId: req.userId });
});

// Logout
router.post('/logout', jwtAuthentication, postLogout);

export default router;