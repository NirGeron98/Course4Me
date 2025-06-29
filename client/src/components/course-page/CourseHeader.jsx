import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Hash, Award, Building, BookMarked, Users, Star } from 'lucide-react';

const CourseHeader = ({ course, stats }) => {
    const renderStars = (rating, size = 'w-4 h-4') => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const decimal = rating - fullStars;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} className={`${size} fill-yellow-400 text-yellow-400`} />);
        }

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

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} className={`${size} text-gray-300`} />);
        }

        return stars;
    };

    const displayRating = stats?.recommendation
        ? parseFloat(stats.recommendation)
        : null;


    const reviewsCount = stats?.total || course.ratingsCount || 0;

    return (
        <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800"></div>

            <div className="relative max-w-7xl mx-auto px-6 py-12">
                {/* Course Name and Icon - Centered at top */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-lg">
                        <BookOpen className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                        {course.title}
                    </h1>
                </div>

                {/* Content below - course details centered with rating on the side */}
                <div className="relative flex justify-center">
                    {/* Course Details - Always Centered */}
                    <div className="flex flex-col items-center text-center max-w-4xl w-full">
                        {/* Course Meta - Compact Pills */}
                        <div className="flex flex-wrap gap-2 mb-6 justify-center items-center w-full">
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

                        {/* Lecturers Section - Centered */}
                        {course.lecturers?.length > 0 && (
                            <div className="mb-6 w-full flex justify-center">
                                <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-lg">
                                    <div className="flex flex-col lg:flex-row items-center gap-4">
                                        <div className="flex items-center gap-2 text-white font-semibold whitespace-nowrap">
                                            <Users className="w-4 h-4" />
                                            <span>{course.lecturers.length > 1 ? 'מרצים:' : 'מרצה:'}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-3 justify-center">
                                            {course.lecturers.map((lecturer, index) => (
                                                <Link
                                                    key={index}
                                                    to={`/lecturer/${lecturer._id}`}
                                                    className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 hover:bg-white/30 hover:scale-105 transition-all duration-200 group cursor-pointer"
                                                >
                                                    <span className="text-white font-medium group-hover:text-white/90">
                                                        {lecturer.name}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* Rating Box - Positioned on the left side */}
                {displayRating && (
                    <div className="absolute left-0 top-20 hidden lg:block">
                        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-6 shadow-lg">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white mb-3">
                                    {displayRating.toFixed(1)}
                                </div>
                                <div className="flex justify-center gap-1 mb-3">
                                    {renderStars(displayRating, 'w-5 h-5')}
                                </div>
                                <div className="text-white/90 text-sm font-medium">
                                    ציון ההמלצה מתוך {reviewsCount} ביקורות
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rating Box for mobile - centered below */}
                {displayRating && (
                    <div className="lg:hidden mt-8 flex justify-center w-full">
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
    );
};

export default CourseHeader;