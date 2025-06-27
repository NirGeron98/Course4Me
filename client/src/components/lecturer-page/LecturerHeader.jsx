import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { User, Building, Mail, Award, BookOpen, Hash } from 'lucide-react';

const LecturerHeader = ({ lecturer, courses, reviews = [], renderStars }) => {
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

    return (
        <div className="relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800"></div>

            <div className="relative max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col lg:flex-row items-start gap-8">
                    {/* Lecturer Icon */}
                    <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-lg">
                        <User className="w-10 h-10 text-white" />
                    </div>

                    {/* Lecturer Details */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight text-center lg:text-right">
                            {lecturer.name}
                        </h1>

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
                        {courses.length > 0 && (
                            <div className="mb-6">
                                <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-lg inline-block">
                                    <div className="flex items-start gap-4">
                                        {/* Courses Label */}
                                        <div className="flex items-center gap-2 text-white font-semibold whitespace-nowrap">
                                            <BookOpen className="w-4 h-4" />
                                            <span>קורסים:</span>
                                        </div>

                                        {/* Courses Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                                            {courses.map((course) => (
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

export default LecturerHeader;