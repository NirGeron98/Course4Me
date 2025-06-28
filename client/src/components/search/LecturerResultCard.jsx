import React from 'react';
import { User, Building, Mail, Hash, Star, Eye } from 'lucide-react';

const LecturerResultCard = ({ lecturer, onSelect }) => {
  // Add safety checks
  if (!lecturer) {
    return null;
  }

  const renderStars = (rating) => {
    const stars = [];
    const numRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-200 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(numRating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-purple-300 bg-gradient-to-br from-white to-purple-50/30">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-full p-3 shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              {lecturer?.name || 'שם לא זמין'}
            </h4>
            
            {/* Lecturer Info Pills */}
            <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
              {lecturer?.department && (
                <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  <Building className="w-3 h-3" />
                  <span className="font-medium">{lecturer.department}</span>
                </div>
              )}
              {lecturer?.academicInstitution && (
                <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  <Hash className="w-3 h-3" />
                  <span className="font-medium">{lecturer.academicInstitution}</span>
                </div>
              )}
            </div>

            {/* Email */}
            {lecturer?.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-blue-600 hover:text-blue-700 transition-colors">
                  {lecturer.email}
                </span>
              </div>
            )}

            {/* Rating */}
            {lecturer?.averageRating && (
              <div className="flex items-center gap-3 mb-3">
                <div className="flex gap-1">
                  {renderStars(lecturer.averageRating)}
                </div>
                <span className="text-sm font-medium text-yellow-600">
                  {lecturer.averageRating.toFixed(1)}
                </span>
                {lecturer?.ratingsCount && (
                  <span className="text-xs text-gray-500">
                    ({lecturer.ratingsCount} ביקורות)
                  </span>
                )}
              </div>
            )}

            {/* Bio */}
            {lecturer?.bio && (
              <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                {lecturer.bio.length > 120
                  ? `${lecturer.bio.substring(0, 120)}...`
                  : lecturer.bio}
              </p>
            )}

            {/* Research Areas/Specialization */}
            {lecturer?.specialization && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                  {lecturer.specialization.split(',').slice(0, 3).map((area, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {area.trim()}
                    </span>
                  ))}
                  {lecturer.specialization.split(',').length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-600">
                      +{lecturer.specialization.split(',').length - 3} נוספים
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          onClick={onSelect}
          className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <Eye className="w-4 h-4" />
          פרטים מלאים
        </button>
      </div>
    </div>
  );
};

export default LecturerResultCard;