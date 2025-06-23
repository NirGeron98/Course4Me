const fs = require("fs");
const path = require("path");
const axios = require("axios");

require("dotenv").config({ path: path.join(__dirname, '../.env') });

const FORMATTED_DIR = path.join(__dirname, "../data/formatted");
const API_URL = "http://localhost:5000/api/courses";
const TOKEN = process.env.ADMIN_TOKEN;

/**
 * Test importing just a few courses to see what errors we get
 */
async function debugErrors() {
  try {
    console.log("🔍 Testing import with detailed error reporting...\n");

    // Read one of the formatted files
    const testFile = path.join(FORMATTED_DIR, "software_formatted.json");
    const courses = JSON.parse(fs.readFileSync(testFile, 'utf8'));
    
    console.log(`📚 Testing with ${Math.min(5, courses.length)} courses from software_formatted.json\n`);

    // Test first 5 courses only
    for (let i = 0; i < Math.min(5, courses.length); i++) {
      const course = courses[i];
      
      console.log(`\n--- Testing Course #${i + 1} ---`);
      console.log(`Name: ${course.courseName}`);
      console.log(`Number: ${course.courseNumber}`);
      console.log(`Department: ${course.department}`);
      console.log(`Credits: ${course.courseCredit}`);
      console.log(`Lecturers: ${course.lecturers?.length || 0} lecturers`);
      
      const courseData = {
        courseNumber: course.courseNumber?.toString().trim(),
        title: course.courseName?.trim(),
        description: course.description || "",
        lecturers: course.lecturers || [],
        academicInstitution: course.academicInstitution || "מכללת אפקה",
        credits: parseFloat(course.courseCredit) || 0,
        department: course.department || "",
        prerequisites: Array.isArray(course.prerequisites)
          ? course.prerequisites.join(", ")
          : "",
      };

      console.log("Sending data:", JSON.stringify(courseData, null, 2));

      try {
        const response = await axios.post(API_URL, courseData, {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
        });

        console.log("✅ SUCCESS!");
        
      } catch (err) {
        console.log("❌ ERROR:");
        console.log("Status:", err.response?.status);
        console.log("Error message:", err.response?.data?.message || err.response?.data);
        
        if (err.response?.data?.details) {
          console.log("Error details:", err.response.data.details);
        }
        
        if (err.response?.data?.errors) {
          console.log("Validation errors:", err.response.data.errors);
        }
      }
      
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

  } catch (error) {
    console.error("💥 Fatal error:", error.message);
  }
}

/**
 * Check for duplicate course numbers
 */
async function checkDuplicates() {
  try {
    console.log("🔍 Checking for duplicate course numbers...\n");
    
    // Get all existing courses
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    
    const existingCourses = response.data;
    console.log(`📊 Found ${existingCourses.length} existing courses in database`);
    
    // Read all formatted files and collect course numbers
    const allCourseNumbers = new Set();
    const duplicatesInFiles = new Set();
    
    const formattedFiles = [
      "software_formatted.json",
      "electricity_formatted.json",
      "mechanical_formatted.json",
      "biomedical_formatted.json",
      "datascience_formatted.json",
      "industrial_formatted.json"
    ];
    
    formattedFiles.forEach(fileName => {
      const filePath = path.join(FORMATTED_DIR, fileName);
      if (fs.existsSync(filePath)) {
        const courses = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        courses.forEach(course => {
          if (allCourseNumbers.has(course.courseNumber)) {
            duplicatesInFiles.add(course.courseNumber);
          }
          allCourseNumbers.add(course.courseNumber);
        });
      }
    });
    
    console.log(`📝 Total courses to import: ${allCourseNumbers.size}`);
    console.log(`🔄 Duplicates in files: ${duplicatesInFiles.size}`);
    
    // Check against existing database
    const existingNumbers = new Set(existingCourses.map(c => c.courseNumber));
    const conflictsWithDB = Array.from(allCourseNumbers).filter(num => existingNumbers.has(num));
    
    console.log(`⚠️  Conflicts with database: ${conflictsWithDB.length}`);
    
    if (conflictsWithDB.length > 0 && conflictsWithDB.length <= 20) {
      console.log("Conflicting course numbers:");
      conflictsWithDB.forEach(num => console.log(`   - ${num}`));
    }
    
    return {
      totalToImport: allCourseNumbers.size,
      duplicatesInFiles: duplicatesInFiles.size,
      conflictsWithDB: conflictsWithDB.length
    };
    
  } catch (error) {
    console.error("Error checking duplicates:", error.message);
    return null;
  }
}

// Main function
async function runDebug() {
  console.log("🔧 Starting detailed error analysis...\n");
  
  const duplicateInfo = await checkDuplicates();
  
  console.log("\n" + "=".repeat(60) + "\n");
  
  await debugErrors();
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 ANALYSIS SUMMARY");
  console.log("=".repeat(60));
  
  if (duplicateInfo) {
    console.log(`📝 Total courses to import: ${duplicateInfo.totalToImport}`);
    console.log(`🔄 Duplicates in files: ${duplicateInfo.duplicatesInFiles}`);
    console.log(`⚠️  Conflicts with database: ${duplicateInfo.conflictsWithDB}`);
    
    if (duplicateInfo.conflictsWithDB > 0) {
      console.log("\n💡 TIP: Many errors might be due to duplicate course numbers!");
      console.log("   Consider skipping courses that already exist in the database.");
    }
  }
}

if (require.main === module) {
  runDebug();
}