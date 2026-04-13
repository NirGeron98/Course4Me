const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const emailService = require("./services/emailService");

// Load environment variables
dotenv.config();

const app = express();

// Allowed origins from env
const allowedOrigins = process.env.CLIENT_URL?.split(",") || [];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
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

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

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
app.use("/api/contact-requests", require("./routes/contactRequestRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Course4Me API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "נתיב לא נמצא",
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler — unified JSON shape:
// { message: <Hebrew user-facing>, error?: <English dev detail, non-prod only> }
app.use((err, req, res, next) => {
  // Developer log in English.
  console.error(`[${req.method} ${req.originalUrl}]`, err);

  let status = err.status || 500;
  let message = "משהו השתבש, נסה שוב מאוחר יותר";

  if (err.name === "ValidationError") {
    status = 400;
    message = "נתוני הבקשה אינם תקינים";
  } else if (err.name === "CastError") {
    status = 400;
    message = "מזהה לא תקין";
  } else if (err.code === 11000) {
    status = 409;
    message = "הערך כבר קיים במערכת";
  } else if (err.status && err.message) {
    message = err.message;
  }

  const body = { message };
  if (process.env.NODE_ENV !== "production") {
    body.error = err.message;
    body.stack = err.stack;
  }
  res.status(status).json(body);
});

// DB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {    
    // Test email service
    try {
      await emailService.testConnection();
    } catch (error) {
      console.log("⚠️ Email service not configured or not working:", error.message);
    }
  })
  .catch((err) => {
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
