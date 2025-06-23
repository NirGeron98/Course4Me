const fs = require("fs");
const path = require("path");

// Configuration
const DATA_DIR = path.join(__dirname, "../data");
const OUTPUT_DIR = path.join(__dirname, "../data/formatted");

// Files to process (excluding cs.json and lecturers_no_email.json)
const FILES_TO_PROCESS = [
  { file: "biomedical.json", department: "הנדסה ביורפואית" },
  { file: "datascience.json", department: "מדעי הנתונים" },
  { file: "electricity.json", department: "הנדסת חשמל" },
  { file: "mechanical.json", department: "הנדסה מכנית" },
  { file: "software.json", department: "הנדסת תוכנה" },
  { file: "industrial.json", department: "הנדסת תעשייה וניהול" }
];

/**
 * Extract course information from the raw JSON structure
 */
function extractCourseInfo(rawCourse) {
  // Handle missing or invalid credit values
  let credits = 0;
  if (rawCourse.courseCredit) {
    if (rawCourse.courseCredit === "Didnt Find Credits") {
      credits = 0;
    } else {
      credits = parseFloat(rawCourse.courseCredit) || 0;
    }
  }

  // Extract lecturers from groups
  const lecturers = new Set();
  if (rawCourse.groups && Array.isArray(rawCourse.groups)) {
    rawCourse.groups.forEach(group => {
      if (group.lecturer && group.lecturer.trim() && group.lecturer !== "No Lecturer Yet") {
        lecturers.add(group.lecturer.trim());
      }
    });
  }

  // Clean prerequisites
  const prerequisites = [];
  if (rawCourse.prerequisites && Array.isArray(rawCourse.prerequisites)) {
    rawCourse.prerequisites.forEach(prereq => {
      if (prereq && prereq.trim()) {
        prerequisites.push(prereq.trim());
      }
    });
  }

  return {
    courseName: rawCourse.courseName?.trim() || "",
    courseNumber: rawCourse.realCourseCode?.toString() || rawCourse.courseCode?.toString() || "",
    courseCredit: credits,
    department: rawCourse.department || "",
    prerequisites: prerequisites,
    lecturers: Array.from(lecturers)
  };
}

/**
 * Process a single JSON file and format it
 */
async function processFile(fileName, expectedDepartment) {
  try {
    const filePath = path.join(DATA_DIR, fileName);
    
    console.log(`\n📁 Processing: ${fileName}`);
    console.log("=".repeat(50));

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return { success: false, courses: [] };
    }

    // Read and parse the raw JSON
    const rawData = fs.readFileSync(filePath, 'utf8');
    const rawCourses = JSON.parse(rawData);
    
    console.log(`📚 Found ${rawCourses.length} raw courses`);

    // Process each course
    const formattedCourses = [];
    let processedCount = 0;
    let skippedCount = 0;

    rawCourses.forEach((rawCourse, index) => {
      try {
        const course = extractCourseInfo(rawCourse);
        
        // Basic validation
        if (!course.courseName || !course.courseNumber) {
          console.log(`⚠️  Skipping course #${index + 1} - missing name or number`);
          skippedCount++;
          return;
        }

        // Override department if needed
        if (expectedDepartment) {
          course.department = expectedDepartment;
        }

        formattedCourses.push(course);
        processedCount++;
        
      } catch (err) {
        console.error(`❌ Error processing course #${index + 1}:`, err.message);
        skippedCount++;
      }
    });

    console.log(`✅ Successfully processed: ${processedCount} courses`);
    console.log(`⚠️  Skipped: ${skippedCount} courses`);

    return { success: true, courses: formattedCourses };
    
  } catch (error) {
    console.error(`💥 Error processing ${fileName}:`, error.message);
    return { success: false, courses: [] };
  }
}

/**
 * Main function to process all files
 */
async function formatAllCourses() {
  try {
    console.log("🚀 Starting course formatting process...\n");

    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      console.log(`📁 Created output directory: ${OUTPUT_DIR}\n`);
    }

    let totalProcessed = 0;
    let totalErrors = 0;
    const allFormattedCourses = [];

    // Process each file
    for (const fileInfo of FILES_TO_PROCESS) {
      const result = await processFile(fileInfo.file, fileInfo.department);
      
      if (result.success) {
        totalProcessed += result.courses.length;
        allFormattedCourses.push(...result.courses);
        
        // Save individual formatted file
        const outputFileName = fileInfo.file.replace('.json', '_formatted.json');
        const outputPath = path.join(OUTPUT_DIR, outputFileName);
        fs.writeFileSync(outputPath, JSON.stringify(result.courses, null, 2), 'utf8');
        console.log(`💾 Saved formatted file: ${outputFileName}`);
        
      } else {
        totalErrors++;
      }
      
      // Add small delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Save combined file
    const combinedPath = path.join(OUTPUT_DIR, 'all_courses_formatted.json');
    fs.writeFileSync(combinedPath, JSON.stringify(allFormattedCourses, null, 2), 'utf8');
    console.log(`\n💾 Saved combined file: all_courses_formatted.json`);

    // Print summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 FORMATTING SUMMARY");
    console.log("=".repeat(50));
    console.log(`✅ Successfully processed: ${totalProcessed} courses`);
    console.log(`❌ Files with errors: ${totalErrors}`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);

    // Show department breakdown
    const departmentStats = {};
    allFormattedCourses.forEach(course => {
      departmentStats[course.department] = (departmentStats[course.department] || 0) + 1;
    });

    console.log("\n📊 Courses by department:");
    Object.entries(departmentStats).forEach(([dept, count]) => {
      console.log(`   ${dept}: ${count} courses`);
    });

    console.log("\n✨ Formatting completed!");
    
  } catch (error) {
    console.error("💥 Fatal error during formatting:", error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  formatAllCourses();
}

module.exports = { formatAllCourses, processFile };