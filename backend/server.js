// backend/server.js
import express from "express";
import cors from "cors";
import pkg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pkg;
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection - ĐỔI PASSWORD THÀNH CỦA BẠN
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ecommerce_schema",
  password: "00000", // ĐỔI LẠI PASSWORD CỦA BẠN
  port: 5432,
});

// Test database connection
pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("❌ Database connection error:", err);
});

// ================== ROUTES ================== //

// 1. Health Check API
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as current_time");
    res.json({
      success: true,
      message: "✅ Server and database are connected",
      database_time: result.rows[0].current_time,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "❌ Database connection failed",
      error: error.message
    });
  }
});

// 2. Get Users API (để test)
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT user_id, username, email, first_name, last_name, is_active, created_at 
      FROM users 
      ORDER BY user_id
    `);
    
    res.json({
      success: true,
      users: result.rows
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi khi lấy danh sách users" 
    });
  }
});

// 3. Login API
app.post("/api/login", async (req, res) => {
  const { account } = req.body;
  const { email, password, keepLogin } = account;

  console.log("📨 Login attempt:", { email });

  try {
    // 1. Tìm user trong database
    const userQuery = `
      SELECT 
        user_id, 
        username, 
        email, 
        password_hash,
        first_name,
        last_name,
        is_active,
        failed_login_attempts
      FROM users 
      WHERE email = $1
    `;
    
    const userResult = await pool.query(userQuery, [email]);
    
    if (userResult.rows.length === 0) {
      console.log("❌ User not found:", email);
      return res.json({
        success: false,
        message: "Email hoặc mật khẩu không đúng"
      });
    }

    const user = userResult.rows[0];
    console.log("✅ User found:", user.username);

    // 2. Kiểm tra số lần đăng nhập thất bại
    if (user.failed_login_attempts >= 5) {
      return res.json({
        success: false,
        failedLoginTimes: user.failed_login_attempts,
        message: "Tài khoản tạm thời bị khóa do đăng nhập sai quá nhiều!"
      });
    }

    // 3. Kiểm tra tài khoản có active không
    if (!user.is_active) {
      return res.json({
        success: false,
        message: "Tài khoản đã bị khóa"
      });
    }

    // 4. Xác thực mật khẩu với bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log("🔐 Password valid:", isValidPassword);
    
    if (!isValidPassword) {
      // Tăng số lần đăng nhập thất bại
      const newFailedAttempts = user.failed_login_attempts + 1;
      await pool.query(
        'UPDATE users SET failed_login_attempts = $1 WHERE user_id = $2',
        [newFailedAttempts, user.user_id]
      );

      return res.json({
        success: false,
        failedLoginTimes: newFailedAttempts,
        message: "Email hoặc mật khẩu không đúng"
      });
    }

    // 5. ĐĂNG NHẬP THÀNH CÔNG
    // Reset số lần đăng nhập thất bại và cập nhật last_login
    await pool.query(
      'UPDATE users SET failed_login_attempts = 0, last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    // 6. Trả về thông tin user (KHÔNG trả password)
    const userResponse = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_active: user.is_active
    };

    console.log("🎉 Login successful for:", user.username);

    res.json({
      success: true,
      message: "Đăng nhập thành công!",
      user: userResponse,
      token: "demo-token-" + user.user_id,
      refreshToken: "demo-refresh-token-" + user.user_id
    });

  } catch (error) {
    console.error("💥 Login error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau"
    });
  }
});

// 4. Get Products API (để test)
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT product_id, product_name, product_sku, base_price, stock_quantity, is_active
      FROM products 
      WHERE is_active = true
      ORDER BY product_id
      LIMIT 10
    `);
    
    res.json({
      success: true,
      products: result.rows
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách sản phẩm"
    });
  }
});

// 5. Root route
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Backend Server is running!",
    endpoints: {
      health: "/api/health",
      users: "/api/users",
      login: "/api/login",
      products: "/api/products"
    }
  });
});

// ================== START SERVER ================== //
app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
  console.log(`🔐 Login API: http://localhost:${PORT}/api/login`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
});