const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Load environment variables from the correct path
require("dotenv").config({ path: path.join(__dirname, '../.env') });

// Configuration constants
const FILE_PATH = path.join(__dirname, "../data/extracted_courses.json");
const API_URL = "http://localhost:5000/api/courses";
const TOKEN = process.env.ADMIN_TOKEN;

// Debug: Check if environment variables are loaded
console.log("🔧 Environment check:");
console.log(`   ADMIN_TOKEN: ${TOKEN ? '✅ Found' : '❌ Missing'}`);
console.log(`   MONGO_URI: ${process.env.MONGO_URI ? '✅ Found' : '❌ Missing'}`);
console.log("");

/**
 * Main function to import courses from JSON file to API
 */
async function importCourses() {
  try {
    console.log("🚀 Starting course import...\n");

    // Initial validations
    if (!TOKEN) {
      console.error("❌ ADMIN_TOKEN not found in environment variables");
      process.exit(1);
    }

    if (!fs.existsSync(FILE_PATH)) {
      console.error(`❌ Data file not found: ${FILE_PATH}`);
      process.exit(1);
    }

    // Read and parse JSON data
    const rawData = fs.readFileSync(FILE_PATH);
    const courses = JSON.parse(rawData);
    
    console.log(`📚 Found ${courses.length} courses to import\n`);

    // Track import statistics
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const errors = [];

    // Import courses one by one
    for (const [index, course] of courses.entries()) {
      try {
        // Map and clean course data to match API expected format
        const courseData = {
          courseNumber: course.courseNumber?.toString().trim(),
          title: course.courseName?.trim(), // Note: using courseName from extracted data
          description: course.description || "",
          lecturers: course.lecturers || [],
          academicInstitution: course.academicInstitution || "מכללת אפקה",
          credits: parseFloat(course.courseCredit) || 0, // Note: using courseCredit from extracted data
          department: course.department || "",
          prerequisites: Array.isArray(course.prerequisites)
            ? course.prerequisites.join(", ")
            : "",
        };

        // Basic validation before sending to API
        if (!courseData.courseNumber) {
          console.log(`⚠️  Skipping course #${index + 1} - missing course number`);
          skippedCount++;
          continue;
        }

        if (!courseData.title) {
          console.log(`⚠️  Skipping course #${index + 1} - missing course title`);
          skippedCount++;
          continue;
        }

        // Make API request to create course
        const response = await axios.post(API_URL, courseData, {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
        });

        console.log(`✅ Successfully added: ${courseData.title} (${courseData.courseNumber})`);
        successCount++;

        // Add small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (err) {
        console.error(`❌ Error adding course #${index + 1}: ${course.courseName || 'Unknown'}`);
        
        // Log detailed error information
        if (err.response) {
          console.error(`   Status: ${err.response.status}`);
          console.error(`   Message: ${err.response.data?.message || err.response.data}`);
        } else if (err.request) {
          console.error("   No response received from server");
        } else {
          console.error(`   Error: ${err.message}`);
        }
        
        // Store error for summary
        errors.push({
          courseIndex: index + 1,
          courseName: course.courseName || 'Unknown',
          error: err.response?.data?.message || err.message
        });
        
        errorCount++;
      }
    }

    // Print import summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 IMPORT SUMMARY");
    console.log("=".repeat(50));
    console.log(`✅ Successfully imported: ${successCount} courses`);
    console.log(`❌ Failed to import: ${errorCount} courses`);
    console.log(`⏭️  Skipped: ${skippedCount} courses`);
    console.log(`📊 Total processed: ${successCount + errorCount + skippedCount} courses`);

    // Show errors if any
    if (errors.length > 0) {
      console.log("\n❌ DETAILED ERRORS:");
      errors.forEach(error => {
        console.log(`   Course #${error.courseIndex} (${error.courseName}): ${error.error}`);
      });
    }

    console.log("\n✨ Import process completed!");

  } catch (error) {
    console.error("💥 Fatal error during import:", error.message);
    process.exit(1);
  }
}

/**
 * Test API connection before starting import
 */
async function testConnection() {
  try {
    console.log("🔍 Testing API connection...");
    
    // Try to get courses instead of health check
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
      timeout: 5000
    });
    
    console.log("✅ API connection successful");
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error("❌ Authentication failed - check your ADMIN_TOKEN");
      return false;
    } else if (error.response?.status === 404) {
      console.error("❌ API endpoint not found - check your API_URL");
      return false;
    } else {
      console.error("❌ API connection failed:", error.message);
      console.log("⚠️  Proceeding anyway...");
      return false;
    }
  }
}

// Execute the import if this file is run directly
if (require.main === module) {
  (async () => {
    try {
      // Optional: Test connection first
      await testConnection();
      
      // Start the import process
      await importCourses();
      
      process.exit(0);
    } catch (error) {
      console.error("💥 Import failed:", error.message);
      process.exit(1);
    }
  })();
}

// Export for use in other modules
module.exports = { importCourses, testConnection };