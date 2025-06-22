import React from "react";
import { Eye, Plus, User, Building, Mail, Star } from "lucide-react";

const LecturerItem = ({ lecturer, onViewDetails, onAdd, isAdding }) => {
  // Helper function to render rating stars
  const renderStars = (rating) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-3 h-3 fill-yellow-200 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-3 h-3 text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="group bg-white hover:bg-purple-50 border-2 border-gray-100 hover:border-purple-200 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg" dir="rtl">
      <div className="flex items-center justify-between">
        
        {/* Lecturer Info */}
        <div className="flex-1">
          <div className="flex items-start space-x-3">
            <div className="bg-purple-100 group-hover:bg-purple-200 rounded-full p-2 transition-colors">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            
            <div className="flex-1 text-right mr-3">
              <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-purple-700 transition-colors">
                {lecturer.name}
              </h3>
              
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                {/* Department */}
                {lecturer.department && (
                  <div className="flex items-center space-x-1">
                    <Building className="w-4 h-4 text-gray-400 ml-1" />
                    <span>{lecturer.department}</span>
                  </div>
                )}
                
                {/* Email */}
                {lecturer.email && (
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4 text-gray-400 ml-1" />
                    <span className="text-blue-600 hover:text-blue-700 transition-colors">
                      {lecturer.email}
                    </span>
                  </div>
                )}
              </div>

              {/* Rating */}
              {lecturer.averageRating && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1">
                    {renderStars(lecturer.averageRating)}
                  </div>
                  <span className="text-sm font-medium text-yellow-600">
                    {lecturer.averageRating}
                  </span>
                  {lecturer.ratingsCount && (
                    <span className="text-xs text-gray-500">
                      ({lecturer.ratingsCount} ביקורות)
                    </span>
                  )}
                </div>
              )}

              {/* Academic Institution Badge */}
              {lecturer.academicInstitution && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {lecturer.academicInstitution}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 mr-4">
          {/* View Details Button */}
          {onViewDetails && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(lecturer);
              }}
              disabled={isAdding}
              className="group/btn flex items-center justify-center w-10 h-10 bg-blue-100 hover:bg-blue-200 text-blue-600 hover:text-blue-700 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="הצג פרטים"
              aria-label="הצג פרטים"
            >
              <Eye className="w-5 h-5" />
            </button>
          )}

          {/* Add Lecturer Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(lecturer._id || lecturer.id);
            }}
            disabled={isAdding}
            className="group/btn flex items-center justify-center w-10 h-10 bg-purple-100 hover:bg-purple-200 text-purple-600 hover:text-purple-700 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="הוסף למעקב"
            aria-label="הוסף למעקב"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bio/Description Preview */}
      {lecturer.bio && (
        <div className="mt-4 pt-4 border-t border-gray-100 group-hover:border-purple-100">
          <p className="text-sm text-gray-600 text-right line-clamp-2 leading-relaxed">
            {lecturer.bio.length > 120 
              ? `${lecturer.bio.substring(0, 120)}...` 
              : lecturer.bio
            }
          </p>
        </div>
      )}

      {/* Research Areas or Specialization */}
      {lecturer.specialization && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-1 justify-end">
            {lecturer.specialization.split(',').slice(0, 3).map((area, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 group-hover:bg-purple-50 group-hover:text-purple-700 transition-colors"
              >
                {area.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerItem;