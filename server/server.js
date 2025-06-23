const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const CourseReviewRoutes = require("./routes/courseReviewRoutes");
const lecturerReviewRoutes = require("./routes/lecturerReviewRoutes"); 
const trackedCourseRoutes = require("./routes/trackedCourseRoutes");
const lecturerRoutes = require("./routes/lecturerRoutes"); 
const trackedLecturerRoutes = require("./routes/trackedLecturerRoutes"); 
const departmentRoutes = require("./routes/departmentRoutes");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/reviews", CourseReviewRoutes);
app.use("/api/lecturer-reviews", lecturerReviewRoutes); 
app.use("/api/tracked-courses", trackedCourseRoutes);
app.use("/api/lecturers", lecturerRoutes);
app.use("/api/tracked-lecturers", require("./routes/trackedLecturerRoutes"));
app.use("/api/departments", departmentRoutes);


// Health check route
app.get("/", (req, res) => {
  res.json({ 
    message: "Course4Me API is running...",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      users: "/api/users", 
      courses: "/api/courses",
      reviews: "/api/reviews",
      lecturerReviews: "/api/lecturer-reviews", 
      trackedCourses: "/api/tracked-courses",
      lecturers: "/api/lecturers"
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: "משהו השתבש!",
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "נתיב לא נמצא" });
});

// Database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected successfully");
    console.log("Database:", mongoose.connection.name);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});