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

// CORS configuration - Updated to match React dev server
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001", // React dev server
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001"
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With",
    "Accept",
    "Origin"
  ]
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes - Fixed the user routes path to match frontend
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes); // Changed from "/api/users" to "/api/user"
app.use("/api/courses", courseRoutes);
app.use("/api/reviews", CourseReviewRoutes);
app.use("/api/lecturer-reviews", lecturerReviewRoutes); 
app.use("/api/tracked-courses", trackedCourseRoutes);
app.use("/api/lecturers", lecturerRoutes);
app.use("/api/tracked-lecturers", trackedLecturerRoutes);
app.use("/api/departments", departmentRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ 
    message: "Course4Me API is running...",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      user: "/api/user", // Updated to match the actual route
      courses: "/api/courses",
      reviews: "/api/reviews",
      lecturerReviews: "/api/lecturer-reviews", 
      trackedCourses: "/api/tracked-courses",
      lecturers: "/api/lecturers",
      trackedLecturers: "/api/tracked-lecturers",
      departments: "/api/departments"
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || "משהו השתבש!",
    error: process.env.NODE_ENV === 'production' ? {} : {
      message: err.message,
      stack: err.stack
    }
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: "נתיב לא נמצא",
    path: req.originalUrl,
    method: req.method
  });
});

// Database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log("📊 Database:", mongoose.connection.name);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔗 CORS enabled for: ${corsOptions.origin.join(', ')}`);
});

module.exports = app;