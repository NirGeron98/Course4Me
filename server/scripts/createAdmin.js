const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();

const createAdminUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@afeka.ac.il" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      console.log("Email: admin@afeka.ac.il");
      console.log("You can update the role manually or delete the user and run this script again");
      return;
    }

    // Create admin user
    const adminUser = new User({
      fullName: "מנהל מערכת",
      email: "admin@afeka.ac.il",
      password: "admin123456", // Will be hashed automatically by the User model
      role: "admin"
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@afeka.ac.il");
    console.log("🔑 Password: admin123456");
    console.log("👑 Role: admin");
    console.log("");
    console.log("🚀 You can now login with these credentials to access the admin panel!");

  } catch (error) {
    console.error("❌ Error creating admin user:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
};

// Run the script
if (require.main === module) {
  createAdminUser();
}

module.exports = createAdminUser;