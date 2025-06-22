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
                <div className="flex flex-col items-center text-center gap-6">
                    {/* Main Content - 9 columns */}
                    <div className="lg:col-span-9">
                        <div className="flex items-start gap-6">
                            {/* Course Icon */}
                            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-lg">
                                <BookOpen className="w-10 h-10 text-white" />
                            </div>

                            {/* Course Details */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight text-center lg:text-right">
                                    {course.title}
                                </h1>

                                {/* Course Meta - Compact Pills */}
                                <div className="flex flex-wrap gap-2 mb-6">
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

                                {/* Lecturers and Rating Section */}
                                <div className="flex justify-center gap-6 flex-wrap">
                                    {/* Lecturers Section */}
                                    {course.lecturers && course.lecturers.length > 0 && (
                                        <div className="lg:col-span-2 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-5 shadow-lg">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="bg-white/20 rounded-lg p-2">
                                                    <Users className="w-4 h-4 text-white" />
                                                </div>
                                                <h3 className="font-semibold text-white text-lg">
                                                    {course.lecturers.length > 1 ? 'מרצים' : 'מרצה'}
                                                </h3>
                                            </div>

                                            <div className="space-y-3">
                                                {course.lecturers.map((lecturer, index) => (
                                                    <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-white/15 transition-all duration-200">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-semibold text-white text-lg mb-1">
                                                                    {lecturer.name}
                                                                </div>
                                                                {lecturer.department && (
                                                                    <div className="text-white/80 text-sm">
                                                                        {lecturer.department}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Rating Section */}
                                    {displayRating && (
                                        <div className="lg:col-span-1">
                                            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-5 shadow-lg h-full">
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseHeader;