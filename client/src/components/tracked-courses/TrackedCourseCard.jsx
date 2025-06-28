import React from 'react';
import { BookOpen, Eye, Star, Building, X, User } from 'lucide-react';

const TrackedCourseCard = ({ course, onRemove, onViewDetails }) => {
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
        }

        if (hasHalfStar) {
            stars.push(<Star key="half" className="w-4 h-4 fill-yellow-200 text-yellow-400" />);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
        }

        return stars;
    };

    const getLecturerName = (lecturers) => {
        if (!Array.isArray(lecturers) || lecturers.length === 0) return "מרצה לא מזוהה";
        const first = lecturers[0];
        if (typeof first === "object" && first.name) return first.name;
        return "מרצה לא מזוהה";
    };

    return (
        <div
            onClick={() => onViewDetails(course)}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-emerald-100"
        >
            {/* Course Header */}
            <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full p-3 shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-800 mb-1 truncate">
                        {course.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-medium">
                            {course.courseNumber}
                        </span>
                        <span>{course.credits} נק"ז</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="truncate">{getLecturerName(course.lecturers)}</span>
                    </div>
                    {course.department && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Building className="w-4 h-4" />
                            <span className="truncate">{course.department}</span>
                        </div>
                    )}
                </div>

                {/* Remove Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(course._id);
                    }}
                    className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                    title="הסר מעקב"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Rating */}
            {course.averageRating ? (
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">דירוג</span>
                        <span className="text-lg font-bold text-yellow-600">
                            {course.averageRating.toFixed(1)}/5.0
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                            {renderStars(course.averageRating)}
                        </div>
                        <span className="text-xs text-gray-600">
                            {course.ratingsCount} ביקורות
                        </span>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center">
                    <span className="text-sm text-gray-500">עדיין אין ביקורות</span>
                </div>
            )}

            {/* Course Description */}
            {course.description && (
                <div className="mb-4">
                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                        {course.description.length > 100
                            ? course.description.substring(0, 100) + "..."
                            : course.description}
                    </p>
                </div>
            )}

            {/* Action Button */}
            <div className="flex items-center justify-between">
                <button className="text-emerald-500 hover:text-emerald-600 font-medium text-sm flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    צפה בפרטים
                </button>

                {/* Additional Info */}
                <div className="text-xs text-gray-500">
                    {course.academicInstitution || 'מכללת אפקה'}
                </div>
            </div>
        </div>
    );
};

export default TrackedCourseCard;

