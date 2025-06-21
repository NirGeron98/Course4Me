import React from 'react';
import { MessageCircle, Plus, Loader2, User, Star } from 'lucide-react';

const ReviewsSection = ({ 
    reviews, 
    reviewsLoading, 
    filteredReviews, 
    filterRating, 
    setFilterRating, 
    sortBy, 
    setSortBy, 
    onShowReviewForm 
}) => {
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
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <MessageCircle className="w-6 h-6 text-emerald-500" />
                    ביקורות סטודנטים ({reviews.length})
                </h2>

                <button
                    onClick={onShowReviewForm}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    כתוב ביקורת
                </button>
            </div>

            {/* Filters and Sort */}
            {reviews.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-6">
                    <select
                        value={filterRating}
                        onChange={(e) => setFilterRating(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="all">כל הדירוגים</option>
                        <option value="5">5 כוכבים</option>
                        <option value="4">4 כוכבים</option>
                        <option value="3">3 כוכבים</option>
                        <option value="2">2 כוכבים</option>
                        <option value="1">1 כוכב</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="newest">הכי חדש</option>
                        <option value="oldest">הכי ישן</option>
                        <option value="highest">דירוג גבוה</option>
                        <option value="lowest">דירוג נמוך</option>
                    </select>
                </div>
            )}

            {/* Reviews List */}
            {reviewsLoading ? (
                <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
                    <p className="text-gray-600">טוען ביקורות...</p>
                </div>
            ) : filteredReviews.length > 0 ? (
                <div className="space-y-4">
                    {filteredReviews.map((review) => (
                        <div key={review._id} className="border border-gray-200 rounded-xl p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-800">
                                            {review.user?.fullName || 'משתמש אנונימי'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString('he-IL')}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    {renderStars((review.interest + review.teachingQuality + review.investment) / 3)}
                                </div>
                            </div>

                            {/* Rating breakdown */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3 text-sm">
                                <div className="text-center">
                                    <div className="text-gray-600">עניין</div>
                                    <div className="font-bold text-emerald-600">{review.interest}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-600">קושי</div>
                                    <div className="font-bold text-orange-600">{review.difficulty}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-600">עומס</div>
                                    <div className="font-bold text-red-600">{review.workload}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-600">השקעה</div>
                                    <div className="font-bold text-blue-600">{review.investment}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-600">הוראה</div>
                                    <div className="font-bold text-purple-600">{review.teachingQuality}</div>
                                </div>
                            </div>

                            {review.comment && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="text-gray-700 leading-relaxed">
                                        {review.comment}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    {reviews.length === 0 ? 'אין ביקורות עדיין' : 'אין ביקורות התואמות את הסינון'}
                </div>
            )}
        </div>
    );
};

export default ReviewsSection;