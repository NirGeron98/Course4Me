import React from 'react';
import { User, Star, Building, X, Eye, Mail } from 'lucide-react';
import { getLecturerSlug } from '../../utils/slugUtils';

const TrackedLecturerCard = ({ lecturer, onRemove, onViewDetails }) => {
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
        }

        if (hasHalfStar) {
            stars.push(<Star key="half" className="w-4 h-4 fill-yellow-200 text-yellow-400" />);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
        }

        return stars;
    };

    const handleViewDetails = () => {
        // Navigate using lecturer slug instead of _id
        window.location.href = `/lecturer/${getLecturerSlug(lecturer)}`;
    };

    return (
        <div
            onClick={handleViewDetails}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-purple-100"
        >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-full p-3 shadow-lg">
                    <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-800 mb-1 truncate">
                        {lecturer.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Building className="w-4 h-4" />
                        <span className="truncate">{lecturer.department}</span>
                    </div>
                    {lecturer.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{lecturer.email}</span>
                        </div>
                    )}
                </div>

                {/* Remove Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(lecturer._id);
                    }}
                    className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                    title="הסר מרשימה"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Rating */}
            {lecturer.averageRating && lecturer.ratingsCount > 0 ? (
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">דירוג</span>
                        <span className="text-lg font-bold text-yellow-600">
                            {lecturer.averageRating.toFixed(1)}/5.0
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                            {renderStars(lecturer.averageRating)}
                        </div>
                        <span className="text-xs text-gray-600">
                            {lecturer.ratingsCount} ביקורות
                        </span>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center">
                    <span className="text-sm text-gray-500">עדיין אין ביקורות</span>
                </div>
            )}

            {/* Action */}
            <div className="flex items-center justify-between">
                <button className="text-purple-500 hover:text-purple-600 font-medium text-sm flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    צפה בפרטים
                </button>
                <div className="text-xs text-gray-500">
                    {lecturer.academicInstitution || 'מכללת אפקה'}
                </div>
            </div>
        </div>
    );
};

export default TrackedLecturerCard;