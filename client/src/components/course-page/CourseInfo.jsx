import React from 'react';

const CourseInfo = ({ course }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">פרטי הקורס</h3>

            <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-600">מספר קורס:</span>
                    <span className="font-medium">{course.courseNumber}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-600">נקודות זכות:</span>
                    <span className="font-medium">{course.credits}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-600">מוסד:</span>
                    <span className="font-medium">{course.academicInstitution}</span>
                </div>

                {course.department && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">מחלקה:</span>
                        <span className="font-medium">{course.department}</span>
                    </div>
                )}

                <div className="flex justify-between">
                    <span className="text-gray-600">נוצר בתאריך:</span>
                    <span className="font-medium">
                        {new Date(course.createdAt).toLocaleDateString('he-IL')}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CourseInfo;