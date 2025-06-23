const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Department = require("../models/Department");

// Load .env from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const departments = [
  { name: "מדעי המחשב", code: "cs" },
  { name: "הנדסת תוכנה", code: "software" },
  { name: "הנדסת חשמל", code: "electricity" },
  { name: "הנדסה ביורפואית", code: "med" },
  { name: "הנדסה מכנית", code: "mechanic" },
  { name: "הנדסת תעשייה וניהול", code: "industrial" },
  { name: "מדעי הנתונים", code: "datacs" },
  { name: "אנגלית", code: "english" },
  { name: "כללי", code: "klali" },
];

const seedDepartments = async () => {
  try {
    // Debug: Check if MONGO_URI is loaded
    console.log("🔧 Environment check...");
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI not found in environment variables");
      console.log("📁 Make sure .env file exists in the server root directory");
      process.exit(1);
    }
    console.log("✅ MONGO_URI found");

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("🔍 Checking existing departments...");
    
    // Get existing departments
    const existingDepartments = await Department.find();
    console.log("📊 Found existing departments:", existingDepartments.map(d => d.name));

    let addedCount = 0;
    let skippedCount = 0;

    // Add only missing departments
    for (const dept of departments) {
      const exists = existingDepartments.some(existing => 
        existing.name.toLowerCase() === dept.name.toLowerCase() ||
        existing.code.toLowerCase() === dept.code.toLowerCase()
      );

      if (exists) {
        console.log(`⏭️  Skipping "${dept.name}" - already exists`);
        skippedCount++;
      } else {
        await Department.create(dept);
        console.log(`✅ Added "${dept.name}"`);
        addedCount++;
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   Added: ${addedCount} departments`);
    console.log(`   Skipped: ${skippedCount} departments`);
    console.log(`   Total: ${existingDepartments.length + addedCount} departments in database`);

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding departments:", error);
    process.exit(1);
  }
};

seedDepartments();