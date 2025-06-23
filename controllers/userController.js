// controllers/userController.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.STRIPE_SECRET_KEY,
);

exports.createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;

    // ตรวจสอบข้อมูลเบื้องต้น
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // สร้างผู้ใช้
    const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone,
        role,
      },
    });

    if (createError) {
      return res.status(400).json({ error: createError.message });
    }

    // ถ้า role เป็น tenant ให้สร้างเรคอร์ด tenant ด้วย
    if (role === 'tenant') {
      const { error: tenantError } = await supabaseAdmin
        .from('tenants')
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          auth_email: email,
        });
      
      if (tenantError) {
        console.error('Error creating tenant:', tenantError);
        // ไม่ส่ง error กลับ client เพราะ user สร้างสำเร็จแล้ว
      }
    }

    // อัปเดต profile role
    const { error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', authData.user.id);

    if (profileUpdateError) {
      console.error('Error updating profile:', profileUpdateError);
      // ไม่ส่ง error กลับ client เพราะ user สร้างสำเร็จแล้ว
    }

    return res.status(200).json({
      success: true,
      user: authData.user,
      message: 'User created successfully',
    });

  } catch (err) {
    console.error('Error creating user:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
