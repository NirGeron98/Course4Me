import React from 'react';
import { BookOpen, Hash, Award, Building, BookMarked, Users, Star } from 'lucide-react';

const CourseHeader = ({ course, stats }) => {
    // Render star rating
    const renderStars = (rating, size = 'w-4 h-4') => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} className={`${size} fill-yellow-400 text-yellow-400`} />);
        }

        if (hasHalfStar) {
            stars.push(<Star key="half" className={`${size} fill-yellow-200 text-yellow-400`} />);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} className={`${size} text-gray-300`} />);
        }

        return stars;
    };

    return (
        <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">

                    {/* Course Icon */}
                    <div className="bg-white/25 rounded-3xl p-6 flex-shrink-0 self-start">
                        <BookOpen className="w-12 h-12 text-white" />
                    </div>

                    {/* Course Info */}
                    <div className="flex-1">
                        <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                            {course.title}
                        </h1>

                        {/* Course Meta */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                                <Hash className="w-4 h-4" />
                                <span className="font-medium">{course.courseNumber}</span>
                            </div>

                            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                <span className="font-medium">{course.credits} נק"ז</span>
                            </div>

                            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                                <Building className="w-4 h-4" />
                                <span className="font-medium">{course.academicInstitution}</span>
                            </div>

                            {course.department && (
                                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                                    <BookMarked className="w-4 h-4" />
                                    <span className="font-medium">{course.department}</span>
                                </div>
                            )}
                        </div>

                        {/* Lecturers */}
                        {course.lecturers && course.lecturers.length > 0 && (
                            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Users className="w-5 h-5" />
                                    <span className="font-medium">
                                        {course.lecturers.length > 1 ? 'מרצים' : 'מרצה'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {course.lecturers.map((lecturer, index) => (
                                        <div key={index} className="bg-white/10 rounded-lg p-3">
                                            <div className="font-semibold">{lecturer.name}</div>
                                            {lecturer.department && (
                                                <div className="text-sm text-white/80">{lecturer.department}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rating Overview */}
                    {stats && (
                        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 lg:min-w-[280px]">
                            <div className="text-center mb-4">
                                <div className="text-3xl font-bold mb-2">{stats.overallRating}</div>
                                <div className="flex justify-center gap-1 mb-2">
                                    {renderStars(parseFloat(stats.overallRating), 'w-5 h-5')}
                                </div>
                                <div className="text-white/80 text-sm">מבוסס על {stats.total} ביקורות</div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>עניין</span>
                                    <span className="font-medium">{stats.avgInterest}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>איכות הוראה</span>
                                    <span className="font-medium">{stats.avgTeachingQuality}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>השקעה נדרשת</span>
                                    <span className="font-medium">{stats.avgInvestment}</span>
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