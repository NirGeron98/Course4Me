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
      investment,
      teachingQuality,
      recommendation,
      comment,
      isAnonymous,
    } = req.body;

    console.log('Request body received:', req.body);
    console.log('isAnonymous value:', isAnonymous, 'type:', typeof isAnonymous);

    // Validate required fields
    if (!course || !lecturer || !interest || !difficulty || !investment || !teachingQuality || !recommendation) {
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

    // Ensure isAnonymous is properly converted to boolean
    const anonymousValue = Boolean(isAnonymous);
    console.log('Processed isAnonymous:', anonymousValue);

    // Create review using the authenticated user's ID
    const review = new CourseReview({
      course,
      lecturer,
      user: req.user._id,
      interest: Number(interest),
      difficulty: Number(difficulty),
      investment: Number(investment),
      teachingQuality: Number(teachingQuality),
      recommendation: Number(recommendation),
      comment: comment || '',
      isAnonymous: anonymousValue,
    });

    console.log('Creating review with data:', {
      course,
      lecturer,
      user: req.user._id,
      isAnonymous: anonymousValue
    });

    const savedReview = await review.save();
    console.log('Saved review:', savedReview);

    // Update the course's average rating based on recommendation score
    const allReviews = await CourseReview.find({ course });
    const avgRecommendation =
      allReviews.reduce((sum, r) => sum + r.recommendation, 0) / allReviews.length;

    await Course.findByIdAndUpdate(course, {
      averageRating: avgRecommendation.toFixed(2),
      ratingsCount: allReviews.length,
    });

    // Return the review with populated fields
    const populatedReview = await CourseReview.findById(savedReview._id)
      .populate("user", "fullName _id")
      .populate("lecturer", "name");

    console.log('Populated review before processing:', {
      id: populatedReview._id,
      isAnonymous: populatedReview.isAnonymous,
      userName: populatedReview.user?.fullName
    });

    // Process the returned review to handle anonymity
    const reviewObj = populatedReview.toObject();
    
    console.log('Review object after toObject:', {
      id: reviewObj._id,
      isAnonymous: reviewObj.isAnonymous,
      userName: reviewObj.user?.fullName
    });
    
    if (reviewObj.isAnonymous === true) {
      reviewObj.user = {
        _id: reviewObj.user._id,
        fullName: 'משתמש אנונימי'
      };
      console.log('Made anonymous, final user name:', reviewObj.user.fullName);
    }

    console.log('Final review object being sent:', {
      id: reviewObj._id,
      isAnonymous: reviewObj.isAnonymous,
      userName: reviewObj.user?.fullName
    });

    res.status(201).json(reviewObj);
  } catch (err) {
    console.error("Error creating review:", err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        message: "שגיאות אימות",
        errors: validationErrors,
      });
    }
    
    // Handle duplicate key error
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

    // Process reviews to handle anonymous ones
    const processedReviews = reviews.map(review => {
      const reviewObj = review.toObject();
      
      console.log('Processing review in getReviewsByCourse:', {
        id: reviewObj._id,
        isAnonymous: reviewObj.isAnonymous,
        isAnonymousType: typeof reviewObj.isAnonymous,
        originalUserName: reviewObj.user?.fullName
      });
      
      if (reviewObj.isAnonymous === true) {
        reviewObj.user = {
          _id: reviewObj.user._id,
          fullName: 'משתמש אנונימי'
        };
        console.log('Made anonymous in getReviewsByCourse:', reviewObj.user.fullName);
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

    // Process reviews to handle anonymous ones
    const processedReviews = reviews.map(review => {
      const reviewObj = review.toObject();
      
      if (reviewObj.isAnonymous === true) {
        reviewObj.user = {
          _id: reviewObj.user._id,
          fullName: 'משתמש אנונימי'
        };
      }
      
      return reviewObj;
    });

    res.status(200).json(processedReviews);
  } catch (err) {
    console.error("Error fetching all reviews:", err);
    res.status(500).json({ 
      message: "שגיאת שרת פנימית",
      error: err.message 
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
      investment,
      teachingQuality,
      recommendation,
      comment,
      isAnonymous,
    } = req.body;

    console.log('Update request body:', req.body);
    console.log('isAnonymous value for update:', isAnonymous, 'type:', typeof isAnonymous);

    // Find the existing review
    const existingReview = await CourseReview.findById(reviewId);

    if (!existingReview) {
      return res.status(404).json({ message: "ביקורת לא נמצאה" });
    }

    // Check if the user owns this review
    if (existingReview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "אין הרשאה לעדכן ביקורת זו" });
    }

    // Ensure isAnonymous is properly converted to boolean
    const anonymousValue = Boolean(isAnonymous);
    console.log('Processed isAnonymous for update:', anonymousValue);

    // Update the review
    const updatedReview = await CourseReview.findByIdAndUpdate(
      reviewId,
      {
        interest: Number(interest),
        difficulty: Number(difficulty),
        investment: Number(investment),
        teachingQuality: Number(teachingQuality),
        recommendation: Number(recommendation),
        comment: comment || '',
        isAnonymous: anonymousValue,
      },
      { new: true, runValidators: true }
    )
      .populate("user", "fullName _id")
      .populate("lecturer", "name");

    console.log('Updated review from DB:', {
      id: updatedReview._id,
      isAnonymous: updatedReview.isAnonymous,
      userName: updatedReview.user?.fullName
    });

    // Process the updated review to handle anonymity
    const reviewObj = updatedReview.toObject();
    if (reviewObj.isAnonymous === true) {
      reviewObj.user = {
        _id: reviewObj.user._id,
        fullName: 'משתמש אנונימי'
      };
    }

    // Recalculate course's average rating based on recommendation
    const allReviews = await CourseReview.find({
      course: existingReview.course,
    });
    const avgRecommendation =
      allReviews.reduce((sum, r) => sum + r.recommendation, 0) / allReviews.length;

    await Course.findByIdAndUpdate(existingReview.course, {
      averageRating: avgRecommendation.toFixed(2),
      ratingsCount: allReviews.length,
    });

    console.log('Final updated review object:', {
      id: reviewObj._id,
      isAnonymous: reviewObj.isAnonymous,
      userName: reviewObj.user?.fullName
    });

    res.status(200).json(reviewObj);
  } catch (err) {
    console.error("Error updating review:", err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
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
        allReviews.reduce((sum, r) => sum + r.recommendation, 0) / allReviews.length;

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