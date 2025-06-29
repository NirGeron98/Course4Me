import React from 'react';
import { X, Edit3, Star } from 'lucide-react';

const ExistingReviewModal = ({ onEdit, onCancel, existingReview, reviewType = 'lecturer' }) => {
    
    // Auto-detect review type if not explicitly set or if data doesn't match
    const detectReviewType = () => {
        if (existingReview.interest !== undefined || existingReview.difficulty !== undefined || existingReview.workload !== undefined) {
            return 'course';
        } else if (existingReview.clarity !== undefined || existingReview.responsiveness !== undefined || existingReview.availability !== undefined) {
            return 'lecturer';
        }
        return reviewType; // fallback to provided type
    };
    
    const actualReviewType = detectReviewType();
    
    // Define criteria based on review type
    const getCriteria = () => {
        if (actualReviewType === 'course') {
            return [
                { key: 'interest', label: 'עניין', color: 'red' },
                { key: 'difficulty', label: 'קושי', color: 'yellow' },
                { key: 'workload', label: 'עומס', color: 'orange' },
                { key: 'workload', label: 'השקעה', color: 'green' },
                { key: 'teachingQuality', label: 'איכות הוראה', color: 'purple' }
            ];
        } else {
            return [
                { key: 'clarity', label: 'בהירות', color: 'blue' },
                { key: 'responsiveness', label: 'התחשבות', color: 'green' },
                { key: 'availability', label: 'זמינות', color: 'orange' },
                { key: 'organization', label: 'ארגון', color: 'red' },
                { key: 'knowledge', label: 'עומק הידע', color: 'yellow' }
            ];
        }
    };

    const criteria = getCriteria();
    
    // Calculate overall rating based on review type
    const calculateOverallRating = () => {
        if (existingReview.overallRating) {
            return existingReview.overallRating;
        }
        
        const sum = criteria.reduce((total, criterion) => {
            return total + (existingReview[criterion.key] || 0);
        }, 0);
        
        return (sum / criteria.length).toFixed(1);
    };

    const overallRating = calculateOverallRating();

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

    const getColorClass = (color) => {
        const colorMap = {
            blue: 'text-blue-600',
            green: 'text-green-600',
            orange: 'text-orange-600',
            red: 'text-red-600',
            yellow: 'text-yellow-600',
            purple: 'text-purple-600'
        };
        return colorMap[color] || 'text-gray-600';
    };

    const getTitle = () => {
        if (actualReviewType === 'course') {
            return 'כבר כתבת ביקורת על הקורס הזה';
        } else {
            return 'כבר כתבת ביקורת על המרצה הזה';
        }
    };

    const getDescription = () => {
        if (actualReviewType === 'course') {
            return 'נמצאה ביקורת קיימת שלך על הקורס הזה. האם תרצה לערוך אותה?';
        } else {
            return 'נמצאה ביקורת קיימת שלך על המרצה בקורס זה. האם תרצה לערוך אותה?';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in duration-300">
                {/* Header */}
                <div className={`bg-gradient-to-r ${actualReviewType === 'course' ? 'from-emerald-500 to-emerald-600' : 'from-purple-500 to-purple-600'} text-white p-6`}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">ביקורת קיימת נמצאה</h2>
                        <button
                            onClick={onCancel}
                            className="text-white hover:text-opacity-80 transition-colors bg-white/20 rounded-full p-2 hover:bg-white/30"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="mb-4">
                            <div className={`w-16 h-16 ${actualReviewType === 'course' ? 'bg-emerald-100' : 'bg-purple-100'} rounded-full flex items-center justify-center mx-auto mb-3`}>
                                <Edit3 className={`w-8 h-8 ${actualReviewType === 'course' ? 'text-emerald-500' : 'text-purple-500'}`} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {getTitle()}
                            </h3>
                            <p className="text-gray-600 text-sm">
                                {getDescription()}
                            </p>
                        </div>

                        {/* Current Review Preview */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <div className="flex gap-1">
                                    {renderStars(parseFloat(overallRating))}
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    {overallRating}/5.0
                                </span>
                            </div>
                            
                            {/* Dynamic criteria display */}
                            <div className="grid grid-cols-5 gap-2 text-xs mb-3">
                                {criteria.map((criterion) => (
                                    <div key={criterion.key} className="text-center">
                                        <div className="text-gray-600 mb-1">{criterion.label}</div>
                                        <div className={`font-bold ${getColorClass(criterion.color)}`}>
                                            {existingReview[criterion.key] || 0}/5
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {existingReview.comment && (
                                <div className="mt-3 p-3 bg-white rounded-lg">
                                    <p className="text-xs text-gray-700 italic">
                                        "{existingReview.comment.substring(0, 100)}{existingReview.comment.length > 100 ? '...' : ''}"
                                    </p>
                                </div>
                            )}

                            <div className="mt-2 text-xs text-gray-500">
                                נכתבה ב-{new Date(existingReview.createdAt).toLocaleDateString('he-IL')}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl transition-colors font-medium"
                        >
                            ביטול
                        </button>
                        <button
                            onClick={onEdit}
                            className={`flex-1 ${actualReviewType === 'course' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-purple-500 hover:bg-purple-600'} text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium`}
                        >
                            <Edit3 className="w-4 h-4" />
                            ערוך ביקורת
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExistingReviewModal;