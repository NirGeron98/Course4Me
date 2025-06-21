import React from 'react';
import { FileText, Target } from 'lucide-react';

const CourseDescription = ({ course }) => {
    return (
        <>
            {/* Description Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-emerald-500" />
                    תיאור הקורס
                </h2>

                {course.description ? (
                    <div className="prose prose-gray max-w-none text-right">
                        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {course.description}
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-500 italic">
                        אין תיאור זמין לקורס זה
                    </div>
                )}
            </div>

            {/* Prerequisites */}
            {course.prerequisites && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5 text-amber-500" />
                        דרישות קדם
                    </h3>
                    <div className="text-gray-700">{course.prerequisites}</div>
                </div>
            )}
        </>
    );
};

export default CourseDescription;