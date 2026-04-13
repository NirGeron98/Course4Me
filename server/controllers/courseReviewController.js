const CourseReview = require("../models/CourseReview");
const Course = require("../models/Course");
const { clearByPrefix: cacheClearCourses } = require("../utils/listCache");

// Prefix used by courseController for course list cache keys.
// Keep in sync with CACHE_KEY_PREFIX in courseController.js.
const COURSE_CACHE_PREFIX = "courses:";

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const {
      course,
      lecturer,
      lecturers,
      interest,
      difficulty,
      workload,
      teachingQuality,
      recommendation,
      comment,
      isAnonymous,
    } = req.body;


    // Handle both single lecturer and multiple lecturers
    const lecturerList = lecturers && lecturers.length > 0 ? lecturers : (lecturer ? [lecturer] : []);

    // Validate required fields
    if (
      !course ||
      lecturerList.length === 0 ||
      !interest ||
      !difficulty ||
      !workload ||
      !teachingQuality ||
      !recommendation
    ) {
      return res.status(400).json({
        message: "חסרים שדות נדרשים",
      });
    }

    // Check if review already exists for this course-user combination
    const existing = await CourseReview.findOne({
      course,
      user: req.user._id,
    }).select("_id").lean();

    if (existing) {
      return res.status(400).json({
        message: "כבר כתבת ביקורת עבור קורס זה",
      });
    }

    // Create review using the authenticated user's ID
    const review = new CourseReview({
      course,
      lecturers: lecturerList,
      lecturer: lecturerList[0], // For backward compatibility
      user: req.user._id,
      interest: Number(interest),
      difficulty: Number(difficulty),
      workload: Number(workload),
      teachingQuality: Number(teachingQuality),
      recommendation: Number(recommendation),
      comment: comment || "",
      isAnonymous: Boolean(isAnonymous),
    });


    const savedReview = await review.save();

    // Update the course's average rating based on recommendation score.
    // .lean() — only reading recommendation values for the aggregate.
    const allReviews = await CourseReview.find({ course }).select("recommendation").lean();
    const avgRecommendation =
      allReviews.reduce((sum, r) => sum + r.recommendation, 0) /
      allReviews.length;

    await Course.findByIdAndUpdate(course, {
      averageRating: avgRecommendation.toFixed(2),
      ratingsCount: allReviews.length,
    });

    // Return the review with populated fields
    const reviewObj = await CourseReview.findById(savedReview._id)
      .populate("user", "fullName _id")
      .populate("lecturer", "name")
      .populate("lecturers", "name")
      .lean();

    // Process the returned review to handle anonymity
    if (reviewObj.isAnonymous === true && reviewObj.user) {
      reviewObj.user = {
        _id: reviewObj.user._id,
        fullName: "משתמש אנונימי",
      };
    }

    // Invalidate server-side course list cache so fresh ratings are served.
    cacheClearCourses(COURSE_CACHE_PREFIX);

    res.status(201).json(reviewObj);
  } catch (err) {
    console.error("Error creating review:", err);

    if (err.name === "ValidationError") {
      const validationErrors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        message: "שגיאות אימות",
        errors: validationErrors,
      });
    }

    if (err.code === 11000) {
      return res.status(400).json({
        message: "כבר כתבת ביקורת עבור קורס זה עם מרצה זה",
      });
    }

    res.status(500).json({
      message: "שגיאת שרת ביצירת הביקורת",
      error: err.message,
    });
  }
};

// Get all reviews for a specific course
exports.getReviewsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lecturerId } = req.query;

    let query = { course: courseId };
    if (lecturerId) {
      query.lecturer = lecturerId;
    }

    const reviews = await CourseReview.find(query)
      .populate("user", "fullName _id")
      .populate("lecturer", "name")
      .populate("lecturers", "name")
      .sort({ createdAt: -1 })
      .lean();

    // Process reviews to handle anonymous ones
    const processedReviews = reviews.map((review) => {
      if (review.isAnonymous === true && review.user) {
        return { ...review, user: { _id: review.user._id, fullName: "משתמש אנונימי" } };
      }
      return review;
    });

    res.status(200).json(processedReviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({
      message: "שגיאת שרת בקבלת הביקורות",
      error: err.message,
    });
  }
};

// Get all reviews (for admin panel or general use). Pagination optional for scalability.
exports.getAllReviews = async (req, res) => {
  try {
    const usePagination = req.query.page != null || req.query.limit != null;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = usePagination ? Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50)) : 0;
    const skip = usePagination ? (page - 1) * limit : 0;

    const query = CourseReview.find()
      .populate("user", "fullName _id")
      .populate("course", "title courseNumber")
      .populate("lecturer", "name")
      .populate("lecturers", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .lean();
    if (limit > 0) query.limit(limit);

    const [reviews, total] = await Promise.all([
      query,
      usePagination ? CourseReview.countDocuments() : Promise.resolve(0),
    ]);

    const processedReviews = reviews.map((review) => {
      if (review.isAnonymous === true && review.user) {
        return { ...review, user: { _id: review.user._id, fullName: "משתמש אנונימי" } };
      }
      return review;
    });

    if (usePagination) {
      res.status(200).json({
        data: processedReviews,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } else {
      res.status(200).json(processedReviews);
    }
  } catch (err) {
    console.error("Error fetching all reviews:", err);
    res.status(500).json({
      message: "שגיאת שרת פנימית",
      error: err.message,
    });
  }
};

// Update a course review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const {
      lecturer,
      lecturers,
      interest,
      difficulty,
      workload,
      teachingQuality,
      recommendation,
      comment,
      isAnonymous,
    } = req.body;

    // Find the existing review
    const existingReview = await CourseReview.findById(reviewId).lean();

    if (!existingReview) {
      return res.status(404).json({ message: "ביקורת לא נמצאה" });
    }

    // Check if the user owns this review
    if (existingReview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "אין הרשאה לעדכן ביקורת זו" });
    }

    // Handle both single lecturer and multiple lecturers
    const lecturerList = lecturers && lecturers.length > 0 ? lecturers : (lecturer ? [lecturer] : existingReview.lecturers || [existingReview.lecturer]);

    // Update the review
    const reviewObj = await CourseReview.findByIdAndUpdate(
      reviewId,
      {
        lecturers: lecturerList,
        lecturer: lecturerList[0], // For backward compatibility
        interest: Number(interest),
        difficulty: Number(difficulty),
        workload: Number(workload),
        teachingQuality: Number(teachingQuality),
        recommendation: Number(recommendation),
        comment: comment || "",
        isAnonymous: Boolean(isAnonymous),
      },
      { new: true, runValidators: true }
    )
      .populate("user", "fullName _id")
      .populate("lecturer", "name")
      .populate("lecturers", "name")
      .lean();

    // Process the updated review to handle anonymity
    if (reviewObj.isAnonymous === true && reviewObj.user) {
      reviewObj.user = {
        _id: reviewObj.user._id,
        fullName: "משתמש אנונימי",
      };
    }

    // Recalculate course's average rating based on recommendation
    const allReviews = await CourseReview.find({
      course: existingReview.course,
    }).select("recommendation").lean();
    const avgRecommendation =
      allReviews.reduce((sum, r) => sum + r.recommendation, 0) /
      allReviews.length;

    await Course.findByIdAndUpdate(existingReview.course, {
      averageRating: avgRecommendation.toFixed(2),
      ratingsCount: allReviews.length,
    });

    // Invalidate course list cache after rating recalculation.
    cacheClearCourses(COURSE_CACHE_PREFIX);

    res.status(200).json(reviewObj);
  } catch (err) {
    console.error("Error updating review:", err);

    if (err.name === "ValidationError") {
      const validationErrors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        message: "שגיאות אימות",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      message: "שגיאת שרת בעדכון הביקורת",
      error: err.message,
    });
  }
};

// Delete a course review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Find the existing review
    const existingReview = await CourseReview.findById(reviewId).select("user course").lean();

    if (!existingReview) {
      return res.status(404).json({ message: "ביקורת לא נמצאה" });
    }

    // Check if the user owns this review or is admin
    if (
      existingReview.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "אין הרשאה למחוק ביקורת זו" });
    }

    await CourseReview.findByIdAndDelete(reviewId);

    // Recalculate course's average rating
    const allReviews = await CourseReview.find({
      course: existingReview.course,
    }).select("recommendation").lean();

    if (allReviews.length > 0) {
      const avgRecommendation =
        allReviews.reduce((sum, r) => sum + r.recommendation, 0) /
        allReviews.length;

      await Course.findByIdAndUpdate(existingReview.course, {
        averageRating: avgRecommendation.toFixed(2),
        ratingsCount: allReviews.length,
      });
    } else {
      // No reviews left, reset rating
      await Course.findByIdAndUpdate(existingReview.course, {
        averageRating: null,
        ratingsCount: 0,
      });
    }

    // Invalidate course list cache after the rating was recomputed or reset.
    cacheClearCourses(COURSE_CACHE_PREFIX);

    res.status(200).json({ message: "ביקורת נמחקה בהצלחה" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({
      message: "שגיאת שרת במחיקת הביקורת",
      error: err.message,
    });
  }
};

// Get aggregated stats for a specific course
exports.getCourseReviewStats = async (req, res) => {
  try {
    const { courseId } = req.params;

    const reviews = await CourseReview.find({ course: courseId }).select("recommendation").lean();

    if (!reviews.length) {
      return res.status(200).json({ recommendation: null, total: 0 });
    }

    const validRecs = reviews
      .map(r => Number(r.recommendation))
      .filter(val => !isNaN(val));

    if (validRecs.length === 0) {
      return res.status(200).json({ recommendation: null, total: reviews.length });
    }

    const recommendationSum = validRecs.reduce((sum, val) => sum + val, 0);
    const recommendationAvg = (recommendationSum / validRecs.length).toFixed(2);

    res.status(200).json({
      recommendation: parseFloat(recommendationAvg),
      total: reviews.length,
    });
  } catch (err) {
    console.error("Error getting course stats:", err);
    res.status(500).json({ message: "שגיאה בקבלת סטטיסטיקות קורס" });
  }
};

