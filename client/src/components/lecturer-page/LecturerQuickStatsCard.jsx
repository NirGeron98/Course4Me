import React from 'react';
import { Users, BookOpen, Star } from 'lucide-react';

const LecturerQuickStatsCard = ({ stats, reviewsCount, coursesCount }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Card Title */}
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Users className="w-5 h-5 text-purple-500" />
        סטטיסטיקות
      </h3>

      {/* Statistics */}
      <div className="space-y-4">
        {/* Total Reviews */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-500" />
            סה"כ ביקורות
          </span>
          <span className="font-bold text-purple-600">{reviewsCount}</span>
        </div>

        {/* Courses Count */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="text-gray-600 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-500" />
            מספר קורסים
          </span>
          <span className="font-bold text-purple-600">{coursesCount}</span>
        </div>

        {/* Overall Rating */}
        {stats && (
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              דירוג כללי
            </span>
            <span className="font-bold text-purple-600">
              {stats.overallRating}/5.0
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LecturerQuickStatsCard;
