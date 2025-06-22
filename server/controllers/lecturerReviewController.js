const LecturerReview = require("../models/LecturerReview");
const Lecturer = require("../models/Lecturer");

// Create a new lecturer review
exports.createLecturerReview = async (req, res) => {
  try {
    const {
      lecturer,
      course,
      clarity,
      responsiveness,
      availability,
      organization,
      knowledge,
      comment,
    } = req.body;

    // Check if review already exists for this lecturer-course-user combination
    const existing = await LecturerReview.findOne({
      lecturer,
      course,
      user: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        message: "כבר כתבת ביקורת עבור מרצה זה בקורס זה",
      });
    }

    // Create review using the authenticated user's ID
    const review = new LecturerReview({
      lecturer,
      course,
      user: req.user._id,
      clarity,
      responsiveness,
      availability,
      organization,
      knowledge,
      comment,
    });

    await review.save();

    // Update the lecturer's average rating
    const allReviews = await LecturerReview.find({ lecturer });

    const avg =
      allReviews.reduce((sum, r) => {
        const averageScore =
          (r.clarity + r.responsiveness + r.availability + r.organization + r.knowledge) / 5;
        return sum + averageScore;
      }, 0) / allReviews.length;

    await Lecturer.findByIdAndUpdate(lecturer, {
      averageRating: avg.toFixed(2),
      ratingsCount: allReviews.length,
    });

    // Return the review with populated fields
    const populatedReview = await LecturerReview.findById(review._id)
      .populate('user', 'fullName')
      .populate('course', 'title courseNumber')
      .populate('lecturer', 'name');

    res.status(201).json(populatedReview);
  } catch (err) {
    console.error("Error creating lecturer review:", err);
    if (err.code === 11000) {
      return res.status(400).json({
        message: "כבר כתבת ביקורת עבור מרצה זה בקורס זה",
      });
    }
    res.status(500).json({ 
      message: "שגיאת שרת ביצירת הביקורת", 
      error: err.message 
    });
  }
};

// Get all reviews for a specific lecturer
exports.getReviewsByLecturer = async (req, res) => {
  try {
    const { lecturerId } = req.params;
    const { courseId } = req.query; // Optional filter by course

    let query = { lecturer: lecturerId };
    if (courseId) {
      query.course = courseId;
    }

    const reviews = await LecturerReview.find(query)
      .populate("user", "fullName _id")
      .populate("course", "title courseNumber")
      .populate("lecturer", "name")
      .sort({ createdAt: -1 });
    
    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error fetching lecturer reviews:", err);
    res.status(500).json({ 
      message: "שגיאת שרת בקבלת הביקורות", 
      error: err.message 
    });
  }
};

// Get all lecturer reviews (for admin panel or general use)
exports.getAllLecturerReviews = async (req, res) => {
  try {
    const reviews = await LecturerReview.find()
      .populate('user', 'fullName')
      .populate('course', 'title courseNumber')
      .populate('lecturer', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error fetching all lecturer reviews:", err);
    res.status(500).json({ message: "שגיאת שרת פנימית" });
  }
};

// Update a lecturer review
exports.updateLecturerReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const {
      clarity,
      responsiveness,
      availability,
      organization,
      knowledge,
      comment,
    } = req.body;

    // Find the existing review
    const existingReview = await LecturerReview.findById(reviewId);

    if (!existingReview) {
      return res.status(404).json({ message: "ביקורת לא נמצאה" });
    }

    // Check if the user owns this review
    if (existingReview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "אין הרשאה לעדכן ביקורת זו" });
    }

    // Update the review
    const updatedReview = await LecturerReview.findByIdAndUpdate(
      reviewId,
      {
        clarity,
        responsiveness,
        availability,
        organization,
        knowledge,
        comment,
      },
      { new: true, runValidators: true }
    )
    .populate('user', 'fullName')
    .populate('course', 'title courseNumber')
    .populate('lecturer', 'name');

    // Recalculate lecturer's average rating
    const allReviews = await LecturerReview.find({ lecturer: existingReview.lecturer });
    const avg =
      allReviews.reduce((sum, r) => {
        const averageScore =
          (r.clarity + r.responsiveness + r.availability + r.organization + r.knowledge) / 5;
        return sum + averageScore;
      }, 0) / allReviews.length;

    await Lecturer.findByIdAndUpdate(existingReview.lecturer, {
      averageRating: avg.toFixed(2),
      ratingsCount: allReviews.length,
    });

    res.status(200).json(updatedReview);
  } catch (err) {
    console.error("Error updating lecturer review:", err);
    res.status(500).json({ 
      message: "שגיאת שרת בעדכון הביקורת", 
      error: err.message 
    });
  }
};

// Delete a lecturer review
exports.deleteLecturerReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Find the existing review
    const existingReview = await LecturerReview.findById(reviewId);

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

    await LecturerReview.findByIdAndDelete(reviewId);

    // Recalculate lecturer's average rating
    const allReviews = await LecturerReview.find({ lecturer: existingReview.lecturer });
    
    if (allReviews.length > 0) {
      const avg =
        allReviews.reduce((sum, r) => {
          const averageScore =
            (r.clarity + r.responsiveness + r.availability + r.organization + r.knowledge) / 5;
          return sum + averageScore;
        }, 0) / allReviews.length;

      await Lecturer.findByIdAndUpdate(existingReview.lecturer, {
        averageRating: avg.toFixed(2),
        ratingsCount: allReviews.length,
      });
    } else {
      // No reviews left, reset rating
      await Lecturer.findByIdAndUpdate(existingReview.lecturer, {
        averageRating: null,
        ratingsCount: 0,
      });
    }

    res.status(200).json({ message: "ביקורת נמחקה בהצלחה" });
  } catch (err) {
    console.error("Error deleting lecturer review:", err);
    res.status(500).json({ 
      message: "שגיאת שרת במחיקת הביקורת", 
      error: err.message 
    });
  }
};