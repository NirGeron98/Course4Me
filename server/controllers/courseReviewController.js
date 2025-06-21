const CourseReview = require("../models/CourseReview");
const Course = require("../models/Course");

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

    // בדיקה אם כבר יש ביקורת מהמשתמש לקורס זה
    const existing = await CourseReview.findOne({
      course,
      user: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        message: "כבר כתבת ביקורת עבור קורס זה",
      });
    }

    // Create review using the authenticated user's ID
    const review = new CourseReview({  // שינוי מ-Review ל-CourseReview
      course,
      user: req.user._id,
      interest,
      difficulty,
      workload,
      investment,
      teachingQuality,
      comment,
    });

    await review.save();  // שינוי מ-CourseReview.save() ל-review.save()

    // עדכון הדירוג הממוצע של הקורס
    const allReviews = await CourseReview.find({ course });

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

    // החזרת הביקורת עם פרטי המשתמש
    const populatedReview = await CourseReview.findById(review._id)
      .populate('user', 'fullName');

    res.status(201).json(populatedReview);  // החזרת הביקורת המאוכלסת במקום הודעה
  } catch (err) {
    console.error("Error creating review:", err);
    res
      .status(500)
      .json({ message: "שגיאת שרת ביצירת הביקורת", error: err.message });
  }
};

// Get all reviews for a specific course
exports.getReviewsByCourse = async (req, res) => {
  try {
    const reviews = await CourseReview.find({ course: req.params.courseId })
      .populate("user", "fullName")
      .sort({ createdAt: -1 }); // מיון לפי תאריך יצירה - החדש ביותר קודם
    
    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res
      .status(500)
      .json({ message: "שגיאת שרת בקבלת הביקורות", error: err.message });
  }
};

// Get all reviews (for admin panel or general use)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await CourseReview.find()
      .populate('user', 'fullName')
      .populate('course', 'title courseNumber')
      .sort({ createdAt: -1 });
    
    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error fetching all reviews:", err);
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
};