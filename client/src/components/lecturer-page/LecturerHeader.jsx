import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Building, Mail, Award, BookOpen, Hash, X } from 'lucide-react';

const LecturerHeader = ({ lecturer, courses, reviews = [], renderStars }) => {
    const [showAllCourses, setShowAllCourses] = useState(false);

    // Calculate real-time statistics from reviews
    const stats = useMemo(() => {
        if (!reviews.length) {
            return null;
        }

        const total = reviews.length;
        const avgClarity = reviews.reduce((sum, r) => sum + (r.clarity || 0), 0) / total;
        const avgResponsiveness = reviews.reduce((sum, r) => sum + (r.responsiveness || 0), 0) / total;
        const avgAvailability = reviews.reduce((sum, r) => sum + (r.availability || 0), 0) / total;
        const avgOrganization = reviews.reduce((sum, r) => sum + (r.organization || 0), 0) / total;
        const avgKnowledge = reviews.reduce((sum, r) => sum + (r.knowledge || 0), 0) / total;

        const overallRating = (avgClarity + avgResponsiveness + avgAvailability + avgOrganization + avgKnowledge) / 5;

        return {
            total,
            overallRating: overallRating.toFixed(1)
        };
    }, [reviews]);

    // Use calculated stats from reviews if available, otherwise use lecturer data
    const displayRating = stats ? parseFloat(stats.overallRating) :
        (lecturer.averageRating ? parseFloat(lecturer.averageRating) : null);
    const reviewsCount = stats ? stats.total : (lecturer.ratingsCount || 0);

    // Limit courses display
    const maxCoursesToShow = 4;
    const coursesToShow = courses.slice(0, maxCoursesToShow);
    const remainingCourses = courses.length > maxCoursesToShow ? courses.length - maxCoursesToShow : 0;

    return (
        <div className="relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800"></div>

            <div className="relative max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row items-start gap-8">
                    {/* Lecturer Icon */}
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-3 shadow-lg">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                            {lecturer.name}
                        </h1>
                    </div>

                    {/* Lecturer Details */}
                    <div className="flex-1 min-w-0">
                        {/* Lecturer Meta - Compact Pills */}
                        <div className="flex flex-wrap gap-2 mb-6 justify-center lg:justify-start">
                            {lecturer.department && (
                                <div className="bg-white/25 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium text-white">
                                    <Building className="w-3.5 h-3.5" />
                                    {lecturer.department}
                                </div>
                            )}
                            {lecturer.email && (
                                <div className="bg-white/25 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium text-white">
                                    <Mail className="w-3.5 h-3.5" />
                                    {lecturer.email}
                                </div>
                            )}
                            {lecturer.academicInstitution && (
                                <div className="bg-white/25 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium text-white">
                                    <Building className="w-3.5 h-3.5" />
                                    {lecturer.academicInstitution}
                                </div>
                            )}
                        </div>

                        {/* Courses Section - Inline */}
                        {coursesToShow.length > 0 && (
                            <div className="mb-6">
                                <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-lg inline-block">
                                    <div className="flex items-start gap-4">
                                        {/* Courses Label */}
                                        <div className="flex items-center gap-2 text-white font-semibold whitespace-nowrap">
                                            <BookOpen className="w-4 h-4" />
                                            <span>קורסים:</span>
                                        </div>

                                        {/* Courses Grid */}
                                        <div className="flex flex-col gap-3">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                                                {coursesToShow.map((course) => (
                                                    <Link
                                                        key={course._id}
                                                        to={`/course/${course._id}`}
                                                        className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-3 hover:bg-white/30 hover:scale-105 transition-all duration-200 group cursor-pointer"
                                                    >
                                                        <div className="font-semibold text-white text-sm mb-1 group-hover:text-white/90">
                                                            {course.title}
                                                        </div>
                                                        <div className="text-white/80 text-xs group-hover:text-white/70 flex items-center gap-2">
                                                            <span className="flex items-center gap-1">
                                                                <Hash className="w-3 h-3" />
                                                                {course.courseNumber}
                                                            </span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <Award className="w-3 h-3" />
                                                                {course.credits} נק"ז
                                                            </span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>

                                            {remainingCourses > 0 && (
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => setShowAllCourses(true)}
                                                        className="bg-purple-500/80 backdrop-blur-md border border-purple-400/50 rounded-lg px-4 py-2 shadow-lg hover:bg-purple-400/80 hover:scale-105 transition-all cursor-pointer"
                                                    >
                                                        <span className="text-white font-semibold text-sm">
                                                            +{remainingCourses} קורסים נוספים
                                                        </span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rating Section */}
                    {displayRating && (
                        <div className="flex-shrink-0">
                            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-6 shadow-lg">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-white mb-3">
                                        {displayRating.toFixed(1)}
                                    </div>
                                    <div className="flex justify-center gap-1 mb-3">
                                        {renderStars(displayRating, 'w-5 h-5')}
                                    </div>
                                    <div className="text-white/90 text-sm font-medium">
                                        מבוסס על {reviewsCount} ביקורות
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* All courses popup */}
            {showAllCourses && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[80vh] overflow-hidden">
                        {/* Popup header */}
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                כל הקורסים של {lecturer.name} ({courses.length})
                            </h3>
                            <button
                                onClick={() => setShowAllCourses(false)}
                                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Popup content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {courses.map((course) => (
                                    <Link
                                        key={course._id}
                                        to={`/course/${course._id}`}
                                        onClick={() => setShowAllCourses(false)}
                                        className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 hover:shadow-lg hover:scale-105 transition-all duration-200 group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                                <BookOpen className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-800 group-hover:text-purple-700 transition-colors text-sm mb-2 leading-tight">
                                                    {course.title}
                                                </h4>
                                                <div className="space-y-1">
                                                    <div className="text-xs text-gray-600 flex items-center gap-1">
                                                        <Hash className="w-3 h-3" />
                                                        <span>קוד קורס: {course.courseNumber}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-600 flex items-center gap-1">
                                                        <Award className="w-3 h-3" />
                                                        <span>{course.credits} נק"ז</span>
                                                    </div>
                                                    {course.academicInstitution && (
                                                        <div className="text-xs text-gray-600 flex items-center gap-1">
                                                            <Building className="w-3 h-3" />
                                                            <span>{course.academicInstitution}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-purple-600 mt-2 font-medium">
                                                    לחץ לצפייה בקורס
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LecturerHeader;