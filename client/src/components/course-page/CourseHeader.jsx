import React from 'react';
import { BookOpen, Hash, Award, Building, BookMarked, Users, Star } from 'lucide-react';

const CourseHeader = ({ course, stats }) => {
    const renderStars = (rating, size = 'w-4 h-4') => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const decimal = rating - fullStars;

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} className={`${size} fill-yellow-400 text-yellow-400`} />);
        }

        // Partial star if there's a decimal
        if (decimal > 0 && fullStars < 5) {
            const percentage = Math.round(decimal * 100);
            stars.push(
                <div key="partial" className={`relative ${size}`}>
                    <Star className={`${size} text-gray-300 absolute`} />
                    <div className="overflow-hidden" style={{ width: `${percentage}%` }}>
                        <Star className={`${size} fill-yellow-400 text-yellow-400`} />
                    </div>
                </div>
            );
        }

        // Empty stars
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} className={`${size} text-gray-300`} />);
        }

        return stars;
    };

    // Use course rating data (from API) if available, otherwise fall back to stats
    const displayRating = course.averageRating || (stats ? parseFloat(stats.overallRating) : null);
    const reviewsCount = course.ratingsCount || (stats ? stats.total : 0);

    return (
        <div className="relative overflow-hidden">
            {/* Background with gradient only */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800"></div>

            <div className="relative max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row items-start gap-8">
                    {/* Course Icon */}
                    <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-lg">
                        <BookOpen className="w-10 h-10 text-white" />
                    </div>

                    {/* Course Details */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight text-center lg:text-right">
                            {course.title}
                        </h1>

                        {/* Course Meta - Compact Pills */}
                        <div className="flex flex-wrap gap-2 mb-6 justify-center lg:justify-start">
                            <div className="bg-white/25 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium text-white">
                                <Hash className="w-3.5 h-3.5" />
                                {course.courseNumber}
                            </div>
                            <div className="bg-white/25 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium text-white">
                                <Award className="w-3.5 h-3.5" />
                                {course.credits} נק"ז
                            </div>
                            <div className="bg-white/25 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium text-white">
                                <Building className="w-3.5 h-3.5" />
                                {course.academicInstitution}
                            </div>
                            {course.department && (
                                <div className="bg-white/25 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium text-white">
                                    <BookMarked className="w-3.5 h-3.5" />
                                    {course.department}
                                </div>
                            )}
                        </div>

                        {/* Lecturers Section - Inline */}
                        {course.lecturers && course.lecturers.length > 0 && (
                            <div className="mb-6">
                                <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-lg inline-block">
                                    <div className="flex items-center gap-4">
                                        {/* Lecturers Label */}
                                        <div className="flex items-center gap-2 text-white font-semibold whitespace-nowrap">
                                            <Users className="w-4 h-4" />
                                            <span>{course.lecturers.length > 1 ? 'מרצים:' : 'מרצה:'}</span>
                                        </div>

                                        {/* Lecturers List */}
                                        <div className="flex gap-3">
                                            {course.lecturers.map((lecturer, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 hover:bg-white/25 transition-all duration-200 whitespace-nowrap"
                                                >
                                                    <span className="text-white font-medium">
                                                        {lecturer.name}
                                                    </span>
                                                </div>
                                            ))}
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
        </div>
    );
};

export default CourseHeader;