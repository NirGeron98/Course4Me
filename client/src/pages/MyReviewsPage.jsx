import React, { useEffect, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import ReviewFilters from "../components/my-reviews/ReviewFilters";
import ReviewsList from "../components/my-reviews/ReviewsList";
import ReviewEditModal from "../components/my-reviews/ReviewEditModal";
import DeleteConfirmationModal from "../components/common/DeleteConfirmationModal";
import ElegantLoadingSpinner from "../components/common/ElegantLoadingSpinner";
import { useMyReviews } from "../hooks/useMyReviews";

const DEFAULT_FILTERS = {
  searchTerm: "",
  lecturer: "",
  course: "",
  courseNumber: "",
  department: "",
  startDate: "",
  endDate: "",
  minRating: "",
  maxRating: "",
  isAnonymous: "all",
  reviewType: "all",
};

// Computes the effective rating value to use for numeric filtering/sorting,
// falling back across the multiple shapes the review resources can return.
const resolveReviewRating = (review) => {
  if (review.reviewType === "course") {
    return (
      review.recommendation ||
      review.overallRating ||
      (review.interest + review.difficulty + review.workload + review.teachingQuality) / 4
    );
  }
  return (
    review.overallRating ||
    (review.clarity + review.responsiveness + review.availability + review.organization + review.knowledge) / 5
  );
};

const MyReviewsPage = ({ user }) => {
  const userId = user?.user?._id || null;

  const {
    reviews,
    loading,
    error,
    deleteReview,
    replaceReview,
  } = useMyReviews(userId);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState("newest");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    document.title = "הביקורות שלי - Course4Me";
    return () => {
      document.title = "Course4Me";
    };
  }, []);

  // Unique filter dropdown values — derived from the current reviews collection.
  const { uniqueLecturers, uniqueCourses, uniqueDepartments } = useMemo(() => {
    return {
      uniqueLecturers: [
        ...new Set(reviews.map((r) => r.lecturer?.name).filter(Boolean)),
      ],
      uniqueCourses: [
        ...new Set(reviews.map((r) => r.course?.title).filter(Boolean)),
      ],
      uniqueDepartments: [
        ...new Set(reviews.map((r) => r.course?.department).filter(Boolean)),
      ],
    };
  }, [reviews]);

  // Fully derived filtered + sorted collection. No local state, no effects.
  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    if (filters.searchTerm) {
      const q = filters.searchTerm.toLowerCase();
      list = list.filter(
        (review) =>
          review.course?.title?.toLowerCase().includes(q) ||
          review.course?.courseNumber?.toLowerCase().includes(q) ||
          review.lecturer?.name?.toLowerCase().includes(q) ||
          review.course?.department?.toLowerCase().includes(q) ||
          review.comment?.toLowerCase().includes(q)
      );
    }
    if (filters.lecturer) {
      list = list.filter((r) => r.lecturer?.name === filters.lecturer);
    }
    if (filters.course) {
      list = list.filter((r) => r.course?.title === filters.course);
    }
    if (filters.courseNumber) {
      list = list.filter((r) =>
        r.course?.courseNumber?.includes(filters.courseNumber)
      );
    }
    if (filters.department) {
      list = list.filter((r) => r.course?.department === filters.department);
    }
    if (filters.startDate) {
      list = list.filter(
        (r) => new Date(r.createdAt) >= new Date(filters.startDate)
      );
    }
    if (filters.endDate) {
      list = list.filter(
        (r) => new Date(r.createdAt) <= new Date(filters.endDate)
      );
    }
    if (filters.minRating) {
      list = list.filter(
        (r) => resolveReviewRating(r) >= parseInt(filters.minRating, 10)
      );
    }
    if (filters.maxRating) {
      list = list.filter(
        (r) => resolveReviewRating(r) <= parseInt(filters.maxRating, 10)
      );
    }
    if (filters.reviewType !== "all") {
      list = list.filter((r) => r.reviewType === filters.reviewType);
    }
    if (filters.isAnonymous !== "all") {
      const isAnonymous = filters.isAnonymous === "true";
      list = list.filter((r) => Boolean(r.isAnonymous) === isAnonymous);
    }

    list.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "newest":
          comparison = new Date(b.createdAt) - new Date(a.createdAt);
          break;
        case "oldest":
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case "course":
          comparison = (a.course?.title || "").localeCompare(b.course?.title || "");
          break;
        case "lecturer":
          comparison = (a.lecturer?.name || "").localeCompare(b.lecturer?.name || "");
          break;
        case "rating":
          comparison = resolveReviewRating(b) - resolveReviewRating(a);
          break;
        case "department":
          comparison = (a.course?.department || "").localeCompare(
            b.course?.department || ""
          );
          break;
        default:
          break;
      }
      return sortOrder === "desc" ? comparison : -comparison;
    });

    return list;
  }, [reviews, filters, sortBy, sortOrder]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  const handleEditClick = (review) => {
    setEditingReview(review);
    setShowEditModal(true);
  };

  const handleDeleteClick = (review) => {
    setReviewToDelete(review);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    try {
      await deleteReview(reviewToDelete);
      setShowDeleteModal(false);
      setReviewToDelete(null);
    } catch (err) {
      alert(err?.message || "שגיאה במחיקת הביקורת");
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setReviewToDelete(null);
  };

  const handleReviewUpdated = (updatedReview) => {
    replaceReview(updatedReview);
    setShowEditModal(false);
    setEditingReview(null);
  };

  if (loading) {
    return <ElegantLoadingSpinner message="טוען ביקורות..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <div className="inline-flex flex-col items-center">
            <div className="mb-4 p-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full shadow-card">
              <MessageCircle className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
              הביקורות שלי
            </h1>
            <div className="flex items-center gap-3 text-gray-600">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-gray-300" />
              <p className="text-base sm:text-lg font-medium">
                נמצאו <span className="text-gray-600 font-bold">{filteredReviews.length}</span> ביקורות מתוך <span className="text-gray-600 font-bold">{reviews.length}</span> סה"כ
              </p>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-gray-300" />
            </div>
            <div className="mt-4 w-24 h-1 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full" />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-card text-center">
            {error}
          </div>
        )}

        <ReviewFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          uniqueLecturers={uniqueLecturers}
          uniqueCourses={uniqueCourses}
          uniqueDepartments={uniqueDepartments}
        />

        <ReviewsList
          reviews={filteredReviews}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />

        {showEditModal && editingReview && (
          <ReviewEditModal
            review={editingReview}
            user={user}
            onClose={() => {
              setShowEditModal(false);
              setEditingReview(null);
            }}
            onReviewUpdated={handleReviewUpdated}
          />
        )}

        {showDeleteModal && reviewToDelete && (
          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            title="מחיקת ביקורת"
            message="האם אתה בטוח שברצונך למחוק את הביקורת? פעולה זו אינה ניתנת לביטול."
          />
        )}
      </div>
    </div>
  );
};

export default MyReviewsPage;
