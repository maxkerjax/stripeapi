const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.dashboard = async (req, res) => {
  try {
    const { data: rooms, error: roomError } = await supabase.from("rooms").select("*");
    if (roomError) throw roomError;

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r) => r.status === "occupied").length;
    const vacantRooms = totalRooms - occupiedRooms;

    const { data: repairs } = await supabase.from("repairs").select("*").eq("status", "pending");
    const { data: announcements } = await supabase.from("announcements").select("*");

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const { data: payments } = await supabase
      .from("payments")
      .select("amount, payment_date")
      .gte("payment_date", startOfMonth)
      .lte("payment_date", endOfMonth);

    const monthlyRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    res.status(200).json({
      totalRooms,
      occupiedRooms,
      vacantRooms,
      pendingRepairs: repairs.length,
      announcements: announcements.length,
      monthlyRevenue,
    });
  } catch (err) {
    console.error("Dashboard API error:", err.message);
    res.status(500).json({ error: "โหลดข้อมูล dashboard ไม่สำเร็จ" });
  }
};
