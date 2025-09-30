import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ecommerce_secure",
  password: "123456",
  port: 5432,
});

// Constants (tạo file constants.js sau)
const constants = {
  MAX_FAILED_LOGIN_TIMES: 5,
  JWT_EXPIRES_TIME: '1h',
  JWT_REFRESH_EXPIRES_TIME: '7d'
};

// Đăng nhập
export const postLogin = async (req, res) => {
  try {
    const { email, password, keepLogin } = req.body.account;

    // 1. Tìm user trong PostgreSQL
    const userQuery = `
      SELECT user_id, username, email, password_hash, first_name, last_name, 
             is_active, failed_login_attempts
      FROM users WHERE email = $1
    `;
    
    const userResult = await pool.query(userQuery, [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(406).json({ 
        message: 'Tài khoản không tồn tại!' 
      });
    }

    const user = userResult.rows[0];

    // 2. Kiểm tra số lần đăng nhập thất bại
    if (user.failed_login_attempts >= constants.MAX_FAILED_LOGIN_TIMES) {
      return res.status(401).json({ 
        failedLoginTimes: user.failed_login_attempts,
        message: 'Tài khoản tạm thời bị khóa do đăng nhập sai quá nhiều!' 
      });
    }

    // 3. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      // Tăng số lần đăng nhập thất bại
      const newFailedAttempts = user.failed_login_attempts + 1;
      await pool.query(
        'UPDATE users SET failed_login_attempts = $1 WHERE user_id = $2',
        [newFailedAttempts, user.user_id]
      );

      return res.status(401).json({ 
        failedLoginTimes: newFailedAttempts,
        message: 'Mật khẩu không đúng!' 
      });
    }

    // 4. ĐĂNG NHẬP THÀNH CÔNG
    // Reset failed attempts
    await pool.query(
      'UPDATE users SET failed_login_attempts = 0, last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    // Tạo tokens
    const token = jwt.sign(
      { userId: user.user_id }, 
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: constants.JWT_EXPIRES_TIME }
    );

    const refreshToken = jwt.sign(
      { userId: user.user_id, keepLogin }, 
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
      { expiresIn: constants.JWT_REFRESH_EXPIRES_TIME }
    );

    // Lưu refresh token vào database
    await pool.query(
      'UPDATE users SET refresh_token = $1 WHERE user_id = $2',
      [refreshToken, user.user_id]
    );

    // Trả về response
    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      refreshToken,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_active: user.is_active
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Lỗi server, vui lòng thử lại sau' 
    });
  }
};

// Middleware xác thực JWT
export const jwtAuthentication = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token không tồn tại' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

// Logout
export const postLogout = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Xóa refresh token
    await pool.query(
      'UPDATE users SET refresh_token = NULL WHERE user_id = $1',
      [userId]
    );

    res.json({ 
      success: true, 
      message: 'Đăng xuất thành công' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};