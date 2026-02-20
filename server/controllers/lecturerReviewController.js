const LecturerReview = require("../models/LecturerReview");
const Lecturer = require("../models/Lecturer");

// Get all reviews for a specific lecturer
exports.getReviewsByLecturer = async (req, res) => {
  try {
    const { lecturerId } = req.params;
    const { courseId } = req.query;

    // Validate lecturer ID format
    if (!lecturerId || !lecturerId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "מזהה מרצה לא תקין",
      });
    }

    let query = { lecturer: lecturerId };
    if (courseId) {
      if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          message: "מזהה קורס לא תקין",
        });
      }
      query.course = courseId;
    }

    // Check if lecturer exists first
    let lecturerExists;
    try {
      lecturerExists = await Lecturer.findById(lecturerId);
    } catch (lecturerError) {
      console.error("Error finding lecturer:", lecturerError);
      return res.status(500).json({
        message: "שגיאה בבדיקת קיום המרצה",
        error:
          process.env.NODE_ENV === "development"
            ? lecturerError.message
            : "Internal server error",
      });
    }

    if (!lecturerExists) {
      return res.status(404).json({
        message: "מרצה לא נמצא",
      });
    }

    // Find reviews with improved error handling
    let reviews;
    try {
      reviews = await LecturerReview.find(query)
        .populate("user", "fullName _id")
        .populate("course", "title courseNumber")
        .populate("courses", "title courseNumber")
        .populate("lecturer", "name")
        .sort({ createdAt: -1 });
    } catch (reviewsError) {
      console.error("Error finding reviews:", reviewsError);
      console.error("Review error details:", reviewsError.stack);

      // If populate fails, try without populate
      try {
        reviews = await LecturerReview.find(query).sort({ createdAt: -1 });
      } catch (basicError) {
        console.error("Basic review query also failed:", basicError);
        return res.status(500).json({
          message: "שגיאה בחיפוש ביקורות",
          error:
            process.env.NODE_ENV === "development"
              ? reviewsError.message
              : "Internal server error",
        });
      }
    }

    // If we have reviews, try to manually populate if needed
    if (reviews && reviews.length > 0 && !reviews[0].user?.fullName) {
      try {
        reviews = await LecturerReview.find(query)
          .populate("user", "fullName _id")
          .populate("course", "title courseNumber")
          .populate("courses", "title courseNumber")
          .populate("lecturer", "name")
          .sort({ createdAt: -1 });
      } catch (populateError) {
        console.warn(
          "Manual populate failed, returning reviews without population:",
          populateError.message
        );
      }
    }

    // Return reviews with calculated overall rating for each
    const reviewsWithOverall = (reviews || []).map((review) => {
      const overall = (
        (review.clarity +
          review.responsiveness +
          review.availability +
          review.organization +
          review.knowledge) /
        5
      ).toFixed(1);
      
      const reviewObj = {
        ...review.toObject(),
        overallRating: parseFloat(overall),
      };
      
      // If the review is anonymous, hide user details
      if (reviewObj.isAnonymous) {
        reviewObj.user = {
          _id: reviewObj.user._id, // Keep ID for edit/delete permissions
          fullName: 'משתמש אנונימי'
        };
      }
      
      return reviewObj;
    });

    res.status(200).json(reviewsWithOverall);
  } catch (err) {
    console.error("=== Critical Error fetching lecturer reviews ===");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);

    if (err.name === "CastError") {
      return res.status(400).json({
        message: "מזהה לא תקין",
      });
    }

    if (err.name === "MongooseError" || err.name === "MongoError") {
      return res.status(503).json({
        message: "שגיאת חיבור למסד נתונים",
        error:
          process.env.NODE_ENV === "development"
            ? err.message
            : "Database unavailable",
      });
    }

    res.status(500).json({
      message: "שגיאת שרת בקבלת הביקורות",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};

// Create a new lecturer review
exports.createLecturerReview = async (req, res) => {
  try {
    const {
      lecturer,
      course, // Keep for backward compatibility
      courses, // New field for multiple courses
      clarity,
      responsiveness,
      availability,
      organization,
      knowledge,
      comment,
      isAnonymous,
    } = req.body;

    // Handle both single course (old) and multiple courses (new) format
    let coursesToUse = [];
    if (courses && Array.isArray(courses)) {
      coursesToUse = courses;
    } else if (course) {
      coursesToUse = [course];
    }

    // Validate required fields
    if (!lecturer || (!coursesToUse || coursesToUse.length === 0)) {
      return res.status(400).json({
        message: "מרצה ולפחות קורס אחד הם שדות חובה",
      });
    }

    // Validate that lecturer is a valid ObjectId
    if (!lecturer.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: "מזהה מרצה לא תקין",
      });
    }

    // Validate that all courses are valid ObjectIds
    for (const courseId of coursesToUse) {
      if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          message: "מזהה קורס לא תקין",
        });
      }
    }

    // Validate ratings
    const ratings = {
      clarity,
      responsiveness,
      availability,
      organization,
      knowledge,
    };
    for (const [field, value] of Object.entries(ratings)) {
      if (!value || value < 1 || value > 5) {
        return res.status(400).json({
          message: `הערכה עבור ${field} חייבת להיות בין 1 ל-5`,
        });
      }
    }

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: "משתמש לא מאומת",
      });
    }

    // Check if review already exists
    // For backward compatibility, check both old format (lecturer+course+user) and new format (lecturer+user)
    let existing;
    
    if (coursesToUse.length === 1) {
      // Single course - check old format first
      existing = await LecturerReview.findOne({
        lecturer,
        course: coursesToUse[0],
        user: req.user._id,
      });
    }
    
    if (!existing) {
      // Check if user already has any review for this lecturer (new format)
      existing = await LecturerReview.findOne({
        lecturer,
        user: req.user._id,
      });
    }

    if (existing) {
      return res.status(400).json({
        message: "כבר כתבת ביקורת עבור מרצה זה",
      });
    }

    // Verify lecturer exists
    const lecturerExists = await Lecturer.findById(lecturer);
    if (!lecturerExists) {
      return res.status(404).json({
        message: "מרצה לא נמצא",
      });
    }

    // Create review using the authenticated user's ID
    const review = new LecturerReview({
      lecturer,
      courses: coursesToUse,
      course: coursesToUse[0], // For backward compatibility, keep the first course
      user: req.user._id,
      clarity: parseInt(clarity),
      responsiveness: parseInt(responsiveness),
      availability: parseInt(availability),
      organization: parseInt(organization),
      knowledge: parseInt(knowledge),
      comment: comment?.trim() || "",
      isAnonymous,
    });

    await review.save();

    // Update the lecturer's average rating
    const allReviews = await LecturerReview.find({ lecturer });

    if (allReviews.length > 0) {
      const avg =
        allReviews.reduce((sum, r) => {
          const averageScore =
            (r.clarity +
              r.responsiveness +
              r.availability +
              r.organization +
              r.knowledge) /
            5;
          return sum + averageScore;
        }, 0) / allReviews.length;

      await Lecturer.findByIdAndUpdate(lecturer, {
        averageRating: avg.toFixed(2),
        ratingsCount: allReviews.length,
      });
    }

    // Return the review with populated fields
    const populatedReview = await LecturerReview.findById(review._id)
      .populate("user", "fullName")
      .populate("course", "title courseNumber")
      .populate("courses", "title courseNumber")
      .populate("lecturer", "name");

    // Process the returned review to handle anonymity
    const reviewObj = populatedReview.toObject();
    if (reviewObj.isAnonymous) {
      reviewObj.user = {
        _id: reviewObj.user._id, // Keep ID for edit/delete permissions
        fullName: 'משתמש אנונימי'
      };
    }

    res.status(201).json(reviewObj);
  } catch (err) {
    console.error("=== Error creating lecturer review ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.error("Error details:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "כבר כתבת ביקורת עבור מרצה זה בקורס זה",
      });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "שגיאת validation",
        details: Object.values(err.errors).map((e) => e.message),
      });
    }

    if (err.name === "CastError") {
      return res.status(400).json({
        message: "ID לא תקין",
      });
    }

    res.status(500).json({
      message: "שגיאת שרת ביצירת הביקורת",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};

// Get all lecturer reviews (for admin panel or general use). Pagination optional for scalability.
exports.getAllLecturerReviews = async (req, res) => {
  try {
    const usePagination = req.query.page != null || req.query.limit != null;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = usePagination ? Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50)) : 0;
    const skip = usePagination ? (page - 1) * limit : 0;

    const query = LecturerReview.find()
      .populate("user", "fullName")
      .populate("course", "title courseNumber")
      .populate("lecturer", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .lean();
    if (limit > 0) query.limit(limit);

    const [reviews, total] = await Promise.all([
      query,
      usePagination ? LecturerReview.countDocuments() : Promise.resolve(0),
    ]);

    const processedReviews = reviews.map((review) => {
      if (review.isAnonymous && review.user) {
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
    console.error("Error fetching all lecturer reviews:", err);
    res.status(500).json({
      message: "שגיאת שרת פנימית",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};

// Update a lecturer review
exports.updateLecturerReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const {
      courses,
      clarity,
      responsiveness,
      availability,
      organization,
      knowledge,
      comment,
      isAnonymous,
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

    // Prepare update data
    const updateData = {
      clarity: parseInt(clarity),
      responsiveness: parseInt(responsiveness),
      availability: parseInt(availability),
      organization: parseInt(organization),
      knowledge: parseInt(knowledge),
      comment: comment?.trim() || "",
      isAnonymous,
    };

    // Handle courses update if provided
    if (courses && Array.isArray(courses)) {
      updateData.courses = courses;
      updateData.course = courses[0]; // For backward compatibility
    }

    // Update the review
    const updatedReview = await LecturerReview.findByIdAndUpdate(
      reviewId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("user", "fullName")
      .populate("course", "title courseNumber")
      .populate("courses", "title courseNumber")
      .populate("lecturer", "name");

    // Recalculate lecturer's average rating
    const allReviews = await LecturerReview.find({
      lecturer: existingReview.lecturer,
    });
    const avg =
      allReviews.reduce((sum, r) => {
        const averageScore =
          (r.clarity +
            r.responsiveness +
            r.availability +
            r.organization +
            r.knowledge) /
          5;
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
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
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
    const allReviews = await LecturerReview.find({
      lecturer: existingReview.lecturer,
    });

    if (allReviews.length > 0) {
      const avg =
        allReviews.reduce((sum, r) => {
          const averageScore =
            (r.clarity +
              r.responsiveness +
              r.availability +
              r.organization +
              r.knowledge) /
            5;
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
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};