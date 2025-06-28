const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration (dynamic based on env)
const corsOptions = {
  origin: process.env.CLIENT_URL?.split(",") || ["http://localhost:3000"],
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

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/reviews", require("./routes/courseReviewRoutes"));
app.use("/api/lecturer-reviews", require("./routes/lecturerReviewRoutes"));
app.use("/api/tracked-courses", require("./routes/trackedCourseRoutes"));
app.use("/api/lecturers", require("./routes/lecturerRoutes"));
app.use("/api/tracked-lecturers", require("./routes/trackedLecturerRoutes"));
app.use("/api/departments", require("./routes/departmentRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Course4Me API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    message: "נתיב לא נמצא",
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || "משהו השתבש!",
    ...(process.env.NODE_ENV !== "production" && {
      error: {
        message: err.message,
        stack: err.stack
      }
    })
  });
});

// DB connect
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Shutdown handler
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
