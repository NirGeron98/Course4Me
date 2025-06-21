const Review = require("../models/Review");

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const {
      course,
      interest,
      difficulty,
      workload,
      investment,
      teachingQuality,
      comment,
    } = req.body;

    const existing = await Review.findOne({
      course,
      user: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        message: "כבר כתבת ביקורת עבור קורס זה",
      });
    }

    // Create review using the authenticated user's ID
    const review = new Review({
      course,
      user: req.user._id,
      interest,
      difficulty,
      workload,
      investment,
      teachingQuality,
      comment,
    });

    await review.save();
    const allReviews = await Review.find({ course });

    const avg =
      allReviews.reduce((sum, r) => {
        const averageScore =
          (r.interest +
            r.difficulty +
            r.workload +
            r.investment +
            r.teachingQuality) /
          5;
        return sum + averageScore;
      }, 0) / allReviews.length;

    await Course.findByIdAndUpdate(course, {
      averageRating: avg.toFixed(2),
      ratingsCount: allReviews.length,
    });

    res.status(201).json({ message: "הביקורת נוצרה בהצלחה", review });
  } catch (err) {
    res
      .status(500)
      .json({ message: "שגיאת שרת ביצירת הביקורת", error: err.message });
  }
};

// Get all reviews for a specific course
exports.getReviewsByCourse = async (req, res) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId }).populate(
      "user",
      "fullName"
    );
    res.status(200).json(reviews);
  } catch (err) {
    res
      .status(500)
      .json({ message: "שגיאת שרת בקבלת הביקורות", error: err.message });
  }
};
