const CourseReview = require("../models/CourseReview");
const Course = require("../models/Course");

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const {
      course,
      lecturer,
      interest,
      difficulty,
      workload, // Frontend sends 'workload'
      teachingQuality,
      recommendation,
      comment,
      isAnonymous,
    } = req.body;

    console.log("Request body received:", req.body);

    // Validate required fields
    if (
      !course ||
      !lecturer ||
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

    // Check if review already exists for this course-lecturer-user combination
    const existing = await CourseReview.findOne({
      course,
      lecturer,
      user: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        message: "כבר כתבת ביקורת עבור קורס זה עם מרצה זה",
      });
    }

    // Create review using the authenticated user's ID
    // IMPORTANT: Map 'workload' to 'workload' for the database
    const review = new CourseReview({
      course,
      lecturer,
      user: req.user._id,
      interest: Number(interest),
      difficulty: Number(difficulty),
      workload: Number(workload), // Map workload to workload
      teachingQuality: Number(teachingQuality),
      recommendation: Number(recommendation),
      comment: comment || "",
      isAnonymous: Boolean(isAnonymous),
    });

    console.log("Creating review with workload mapping...");

    const savedReview = await review.save();
    console.log("Review saved successfully");

    // Update the course's average rating based on recommendation score
    const allReviews = await CourseReview.find({ course });
    const avgRecommendation =
      allReviews.reduce((sum, r) => sum + r.recommendation, 0) /
      allReviews.length;

    await Course.findByIdAndUpdate(course, {
      averageRating: avgRecommendation.toFixed(2),
      ratingsCount: allReviews.length,
    });

    // Return the review with populated fields
    const populatedReview = await CourseReview.findById(savedReview._id)
      .populate("user", "fullName _id")
      .populate("lecturer", "name");

    // Process the returned review to handle anonymity
    const reviewObj = populatedReview.toObject();

    if (reviewObj.isAnonymous === true) {
      reviewObj.user = {
        _id: reviewObj.user._id,
        fullName: "משתמש אנונימי",
      };
    }

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
      .sort({ createdAt: -1 });

    // Process reviews to handle anonymous ones and map workload to workload
    const processedReviews = reviews.map((review) => {
      const reviewObj = review.toObject();

      if (reviewObj.isAnonymous === true) {
        reviewObj.user = {
          _id: reviewObj.user._id,
          fullName: "משתמש אנונימי",
        };
      }

      return reviewObj;
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

// Get all reviews (for admin panel or general use)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await CourseReview.find()
      .populate("user", "fullName _id")
      .populate("course", "title courseNumber")
      .populate("lecturer", "name")
      .sort({ createdAt: -1 });

    // Process reviews to handle anonymous ones and map workload to workload
    const processedReviews = reviews.map((review) => {
      const reviewObj = review.toObject();

      if (reviewObj.isAnonymous === true) {
        reviewObj.user = {
          _id: reviewObj.user._id,
          fullName: "משתמש אנונימי",
        };
      }

      return reviewObj;
    });

    res.status(200).json(processedReviews);
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
      interest,
      difficulty,
      workload, // Frontend sends 'workload'
      teachingQuality,
      recommendation,
      comment,
      isAnonymous,
    } = req.body;

    // Find the existing review
    const existingReview = await CourseReview.findById(reviewId);

    if (!existingReview) {
      return res.status(404).json({ message: "ביקורת לא נמצאה" });
    }

    // Check if the user owns this review
    if (existingReview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "אין הרשאה לעדכן ביקורת זו" });
    }

    // Update the review - map workload to workload
    const updatedReview = await CourseReview.findByIdAndUpdate(
      reviewId,
      {
        interest: Number(interest),
        difficulty: Number(difficulty),
        workload: Number(workload), // Map workload to workload
        teachingQuality: Number(teachingQuality),
        recommendation: Number(recommendation),
        comment: comment || "",
        isAnonymous: Boolean(isAnonymous),
      },
      { new: true, runValidators: true }
    )
      .populate("user", "fullName _id")
      .populate("lecturer", "name");

    // Process the updated review to handle anonymity and field mapping
    const reviewObj = updatedReview.toObject();

    if (reviewObj.isAnonymous === true) {
      reviewObj.user = {
        _id: reviewObj.user._id,
        fullName: "משתמש אנונימי",
      };
    }

    // Recalculate course's average rating based on recommendation
    const allReviews = await CourseReview.find({
      course: existingReview.course,
    });
    const avgRecommendation =
      allReviews.reduce((sum, r) => sum + r.recommendation, 0) /
      allReviews.length;

    await Course.findByIdAndUpdate(existingReview.course, {
      averageRating: avgRecommendation.toFixed(2),
      ratingsCount: allReviews.length,
    });

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
    const existingReview = await CourseReview.findById(reviewId);

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
    });

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

    res.status(200).json({ message: "ביקורת נמחקה בהצלחה" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({
      message: "שגיאת שרת במחיקת הביקורת",
      error: err.message,
    });
  }
};
