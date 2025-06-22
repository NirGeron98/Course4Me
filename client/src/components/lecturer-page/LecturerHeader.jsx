import React from 'react';
import { User, Building, Mail, Award } from 'lucide-react';

const LecturerHeader = ({ lecturer, courses, stats, renderStars }) => {
    return (
        <div className="relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800"></div>

            <div className="relative max-w-5xl mx-auto px-6 py-12 text-center">
                {/* Lecturer Icon */}
                <div className="mx-auto mb-4 inline-flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-lg">
                    <User className="w-10 h-10 text-white" />
                </div>

                {/* Lecturer Name */}
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                    {lecturer.name}
                </h1>

                {/* Tags with info */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {lecturer.department && (
                        <div className="bg-white/25 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium text-white">
                            <Building className="w-4 h-4" />
                            {lecturer.department}
                        </div>
                    )}
                    {lecturer.email && (
                        <div className="bg-white/25 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium text-white">
                            <Mail className="w-4 h-4" />
                            {lecturer.email}
                        </div>
                    )}
                    {lecturer.academicInstitution && (
                        <div className="bg-white/25 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium text-white">
                            <Building className="w-4 h-4" />
                            {lecturer.academicInstitution}
                        </div>
                    )}
                </div>

                {/* Stats */}
                {stats && (
                    <div className="mb-8">
                        <div className="text-3xl font-bold text-white mb-2">
                            {stats.overallRating}
                        </div>
                        <div className="flex justify-center gap-1 mb-1">
                            {renderStars(parseFloat(stats.overallRating), 'w-5 h-5')}
                        </div>
                        <div className="text-white/90 text-sm font-medium">
                            מתוך {stats.total} ביקורות
                        </div>
                    </div>
                )}

                {/* Courses list */}
                {courses.length > 0 && (
                    <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-lg inline-block text-left max-w-2xl mx-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-white/20 rounded-lg p-2">
                                <Award className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="font-semibold text-white text-lg">
                                קורסים שהועברו על ידי המרצה
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {courses.map((course) => (
                                <div
                                    key={course._id}
                                    className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg p-3 hover:bg-white/15 transition-all duration-200"
                                >
                                    <div className="font-semibold text-white text-sm mb-1">
                                        {course.title}
                                    </div>
                                    <div className="text-white/80 text-xs">
                                        {course.courseNumber} • {course.credits} נק"ז
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LecturerHeader;
