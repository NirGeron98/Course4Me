const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, '../.env') });

// Configuration
const FORMATTED_DIR = path.join(__dirname, "../data/formatted");
const API_URL = "http://localhost:5000/api/courses";
const TOKEN = process.env.ADMIN_TOKEN;

// Files to import (all formatted files)
const FILES_TO_IMPORT = [
  "biomedical_formatted.json",
  "datascience_formatted.json", 
  "electricity_formatted.json",
  "mechanical_formatted.json",
  "software_formatted.json",
  "industrial_formatted.json"
];

// Debug: Check environment
console.log("🔧 Environment check:");
console.log(`   ADMIN_TOKEN: ${TOKEN ? '✅ Found' : '❌ Missing'}`);
console.log(`   MONGO_URI: ${process.env.MONGO_URI ? '✅ Found' : '❌ Missing'}`);
console.log("");

/**
 * Import courses from a single formatted JSON file
 */
async function importFromFile(fileName) {
  try {
    const filePath = path.join(FORMATTED_DIR, fileName);
    
    console.log(`\n📁 Importing from: ${fileName}`);
    console.log("=".repeat(50));

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return { success: 0, errors: 0, skipped: 0 };
    }

    // Read formatted courses
    const formattedCourses = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`📚 Found ${formattedCourses.length} courses to import`);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const errors = [];

    // Import each course
    for (const [index, course] of formattedCourses.entries()) {
      try {
        // Map to API format
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

        // Basic validation
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

        // Make API request
        const response = await axios.post(API_URL, courseData, {
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
        });

        console.log(`✅ Added: ${courseData.title} (${courseData.courseNumber}) - ${courseData.department}`);
        successCount++;

        // Small delay to avoid overwhelming API
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (err) {
        console.error(`❌ Error adding course #${index + 1}: ${course.courseName || 'Unknown'}`);
        
        if (err.response) {
          console.error(`   Status: ${err.response.status}`);
          console.error(`   Message: ${err.response.data?.message || err.response.data}`);
        } else if (err.request) {
          console.error("   No response received from server");
        } else {
          console.error(`   Error: ${err.message}`);
        }
        
        errors.push({
          courseIndex: index + 1,
          courseName: course.courseName || 'Unknown',
          courseNumber: course.courseNumber || 'Unknown',
          error: err.response?.data?.message || err.message
        });
        
        errorCount++;
      }
    }

    // File summary
    console.log(`\n📊 ${fileName} Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);

    return { success: successCount, errors: errorCount, skipped: skippedCount, errorDetails: errors };
    
  } catch (error) {
    console.error(`💥 Error processing ${fileName}:`, error.message);
    return { success: 0, errors: 1, skipped: 0, errorDetails: [{ error: error.message }] };
  }
}

/**
 * Test API connection
 */
async function testConnection() {
  try {
    console.log("🔍 Testing API connection...");
    
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
    } else if (error.response?.status === 404) {
      console.error("❌ API endpoint not found - check your API_URL");
    } else {
      console.error("❌ API connection failed:", error.message);
    }
    console.log("⚠️  Proceeding anyway...");
    return false;
  }
}

/**
 * Main import function
 */
async function importAllFormattedCourses() {
  try {
    console.log("🚀 Starting import of formatted courses...\n");

    // Validation
    if (!TOKEN) {
      console.error("❌ ADMIN_TOKEN not found in environment variables");
      process.exit(1);
    }

    if (!fs.existsSync(FORMATTED_DIR)) {
      console.error(`❌ Formatted directory not found: ${FORMATTED_DIR}`);
      console.log("💡 Make sure you ran the formatting script first!");
      process.exit(1);
    }

    // Test connection
    await testConnection();

    // Track totals
    let totalSuccess = 0;
    let totalErrors = 0;
    let totalSkipped = 0;
    const allErrors = [];

    // Import from each file
    for (const fileName of FILES_TO_IMPORT) {
      const result = await importFromFile(fileName);
      
      totalSuccess += result.success;
      totalErrors += result.errors;
      totalSkipped += result.skipped;
      
      if (result.errorDetails) {
        allErrors.push(...result.errorDetails);
      }
      
      // Add delay between files
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Final summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 FINAL IMPORT SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Successfully imported: ${totalSuccess} courses`);
    console.log(`❌ Failed to import: ${totalErrors} courses`);
    console.log(`⏭️  Skipped: ${totalSkipped} courses`);
    console.log(`📊 Total processed: ${totalSuccess + totalErrors + totalSkipped} courses`);

    // Show detailed errors if any
    if (allErrors.length > 0 && allErrors.length <= 10) {
      console.log("\n❌ DETAILED ERRORS:");
      allErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. Course: ${error.courseName} (${error.courseNumber})`);
        console.log(`      Error: ${error.error}`);
      });
    } else if (allErrors.length > 10) {
      console.log(`\n❌ ${allErrors.length} errors occurred (too many to display)`);
    }

    console.log("\n✨ Import process completed!");

  } catch (error) {
    console.error("💥 Fatal error during import:", error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  (async () => {
    try {
      await importAllFormattedCourses();
      process.exit(0);
    } catch (error) {
      console.error("💥 Import failed:", error.message);
      process.exit(1);
    }
  })();
}

module.exports = { importAllFormattedCourses, testConnection };