// controllers/userController.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.STRIPE_SECRET_KEY,
);

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ตรวจสอบ input
    if (!email || !password) {
      return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });
    }

    // เข้าสู่ระบบผ่าน Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    return res.status(200).json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      user: data.user,
      session: data.session, // token อยู่ที่นี่
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
};