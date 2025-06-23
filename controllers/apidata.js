// routes/dashboard.js
const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.STRIPE_SECRET_KEY
);

// GET /api/dashboard
router.get("/dashboard", async (req, res) => {
  try {
    // 1. ดึงห้องทั้งหมด
    const { data: rooms, error: roomError } = await supabase
      .from("rooms")
      .select("*");

    if (roomError) throw roomError;

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r) => r.status === "occupied").length;
    const vacantRooms = totalRooms - occupiedRooms;

    // 2. การแจ้งซ่อมที่ยังรอดำเนินการ
    const { data: repairs, error: repairError } = await supabase
      .from("repairs")
      .select("*")
      .eq("status", "pending");

    if (repairError) throw repairError;

    const pendingRepairs = repairs.length;

    // 3. การประกาศ (ล่าสุด)
    const { data: announcements, error: annError } = await supabase
      .from("announcements")
      .select("*");

    if (annError) throw annError;

    const announcementCount = announcements.length;

    // 4. คำนวณรายได้เดือนนี้จากตาราง payments
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const { data: payments, error: paymentError } = await supabase
      .from("payments")
      .select("amount, payment_date")
      .gte("payment_date", startOfMonth)
      .lte("payment_date", endOfMonth);

    if (paymentError) throw paymentError;

    const monthlyRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    return res.status(200).json({
      totalRooms,
      occupiedRooms,
      vacantRooms,
      pendingRepairs,
      announcements: announcementCount,
      monthlyRevenue,
    });
  } catch (err) {
    console.error("Dashboard Error:", err.message);
    res.status(500).json({ error: "ไม่สามารถโหลดข้อมูล dashboard ได้" });
  }
});

module.exports = router;
