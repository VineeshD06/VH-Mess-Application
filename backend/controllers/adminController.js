const { MenuItem, PurchasedCoupon, sequelize } = require("../config/database");
const xlsx = require("xlsx");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

const uploadMenu = async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded." });
  }

  const t = await sequelize.transaction();

  try {
    await MenuItem.update({ is_active: false }, { where: {}, transaction: t });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    const newMenuItems = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const day = row[0];

      if (!day) continue;

      const isValidDescription = (description) => {
        return description && String(description).trim() !== "";
      };

      if (isValidDescription(row[1]) && row[2]) {
        newMenuItems.push({
          day_of_week: day,
          meal_type: "Breakfast",
          description: String(row[1]).trim(),
          price: parseFloat(row[2]),
          is_active: true,
        });
      }

      if (isValidDescription(row[3]) && row[4]) {
        newMenuItems.push({
          day_of_week: day,
          meal_type: "Lunch",
          description: String(row[3]).trim(),
          price: parseFloat(row[4]),
          is_active: true,
        });
      }

      if (isValidDescription(row[5]) && row[6]) {
        newMenuItems.push({
          day_of_week: day,
          meal_type: "Dinner",
          description: String(row[5]).trim(),
          price: parseFloat(row[6]),
          is_active: true,
        });
      }
    }

    if (newMenuItems.length === 0) {
      throw new Error(
        "No valid menu items with descriptions found in the uploaded file.",
      );
    }

    await MenuItem.bulkCreate(newMenuItems, { transaction: t });
    await t.commit();

    res.status(201).json({
      success: true,
      message: `Successfully uploaded and updated menu with ${newMenuItems.length} items.`,
    });
  } catch (error) {
    await t.rollback();
    console.error("Menu upload failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to upload menu.",
      error: error.message,
    });
  }
};
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  console.log(adminUsername, adminPasswordHash, username, password);

  if (!adminUsername || !adminPasswordHash) {
    return res.status(500).json({
      success: false,
      message: "Admin credentials are not set up securely on the server.",
    });
  }

  if (!password) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide a password." });
  }

  try {
    const isMatch = await bcrypt.compare(password, adminPasswordHash);

    console.log(isMatch);

    if (username === adminUsername && isMatch) {
      const token = jwt.sign({ id: "admin_user" }, process.env.JWT_SECRET, {
        expiresIn: "8h",
      });
      res.json({ success: true, token });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during authentication." });
  }
};

const getCurrentAdminMenu = async (req, res) => {
  try {
    const menu = await MenuItem.findAll({
      where: { is_active: true },
      order: [
        sequelize.literal(
          "FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')",
        ),
        sequelize.literal("FIELD(meal_type, 'Breakfast', 'Lunch', 'Dinner')"),
      ],
    });
    res.json({ success: true, menu });
  } catch (error) {
    console.error("Error fetching current menu for admin:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const { search, meal_type, status, date } = req.query;
    const whereClause = {
      status: { [Op.ne]: "Pending" },
    };

    // Search by Order ID, Customer Name, Email, or Phone
    if (search) {
      whereClause[Op.or] = [
        { order_id: { [Op.like]: `%${search}%` } },
        { customer_name: { [Op.like]: `%${search}%` } },
        { customer_email: { [Op.like]: `%${search}%` } },
        { customer_phone: { [Op.like]: `%${search}%` } },
      ];
    }

    if (meal_type) whereClause.meal_type = meal_type;
    if (status) whereClause.status = status;
    if (date) whereClause.meal_date = date;

    const coupons = await PurchasedCoupon.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      limit: 200,
    });
    res.json({ success: true, coupons });
  } catch (error) {
    console.error("Error fetching all coupons:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const getTodaysSummary = async (req, res) => {
  try {
    const nowInIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const today = nowInIST.toISOString().split("T")[0];
    const hour = nowInIST.getHours();
    let upcomingMeal = "Dinner";
    if (hour < 10) upcomingMeal = "Breakfast";
    else if (hour < 16) upcomingMeal = "Lunch";
    // Get all coupons for today for all meal types
    const mealTypes = ["Breakfast", "Lunch", "Dinner"];
    const summary = {
      Breakfast: { Active: 0, Used: 0 },
      Lunch: { Active: 0, Used: 0 },
      Dinner: { Active: 0, Used: 0 },
    };

    const coupons = await PurchasedCoupon.findAll({
      where: {
        meal_date: today,
        meal_type: { [Op.in]: mealTypes },
        status: { [Op.in]: ["Active", "Used"] },
      },
    });

    coupons.forEach((c) => {
      if (summary[c.meal_type] && summary[c.meal_type][c.status] !== undefined) {
        summary[c.meal_type][c.status]++;
      }
    });

    res.json({ success: true, summary, upcomingMeal });
  } catch (error) {
    console.error("Error fetching today's summary:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const verifyToken = (req, res) =>
  res.status(200).json({ success: true, message: "Token is valid." });

const markCouponAsUsed = async (req, res) => {
  try {
    const { id } = req.params;
    const [affectedRows] = await PurchasedCoupon.update(
      { status: "Used" },
      { where: { id: id, status: "Active" } },
    );
    if (affectedRows > 0) {
      res.json({ success: true, message: `Coupon ${id} marked as used.` });
    } else {
      res.status(404).json({
        success: false,
        message: `Coupon ${id} not found or is not active.`,
      });
    }
  } catch (error) {
    console.error("Error marking coupon as used:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

const markPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const [affectedRows] = await PurchasedCoupon.update(
      { status: "Active" },
      { where: { id: id, status: "Pending" } },
    );
    if (affectedRows > 0) {
      res.json({ success: true, message: `Coupon ${id} marked as Active.` });
    } else {
      res.status(404).json({
        success: false,
        message: `Coupon ${id} not found or is not Pending.`,
      });
    }
  } catch (error) {
    console.error("Error marking coupon as Active:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};


module.exports = {
  loginAdmin,
  uploadMenu,
  getAllCoupons,
  getTodaysSummary,
  verifyToken,
  markCouponAsUsed,
  getCurrentAdminMenu,
  markPayment,
};    