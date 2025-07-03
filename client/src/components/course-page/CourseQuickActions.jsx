import React, { useState, useEffect } from 'react';
import { HeartHandshake, Plus, Check, Copy } from 'lucide-react';
import ExistingReviewModal from '../common/ExistingReviewModal';

const CourseQuickActions = ({ onShowReviewForm, courseId, courseName, user, onDataChanged }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [showExistingReviewModal, setShowExistingReviewModal] = useState(false);
    const [userExistingReview, setUserExistingReview] = useState(null);

    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!user?.token || !courseId) return;

            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tracked-courses`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const trackedCourses = await response.json();
                    setIsFollowing(trackedCourses.some(tracked => tracked.course?._id === courseId));
                }
            } catch (error) {
                console.error('Error checking follow status:', error);
            }
        };

        const fetchReviews = async () => {
            if (!user?.token || !courseId) return;

            try {
                const reviewsResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/reviews/course/${courseId}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (reviewsResponse.ok) {
                    const reviewsData = await reviewsResponse.json();
                    setReviews(reviewsData);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };

        checkFollowStatus();
        fetchReviews();
    }, [courseId, user?.token]);

    // Check for existing review when user wants to write a new one
    const checkForExistingReview = () => {
        if (!user?.user) return null;
        
        return reviews.find(review => 
            review.user && review.user._id === user.user._id
        );
    };

    const handleWriteReviewClick = () => {
        if (!user) {
            alert('יש להתחבר כדי לכתוב ביקורת');
            return;
        }

        const existingReview = checkForExistingReview();
        
        if (existingReview) {
            setUserExistingReview(existingReview);
            setShowExistingReviewModal(true);
        } else {
            onShowReviewForm();
        }
    };

    const handleEditExistingReview = () => {
        setShowExistingReviewModal(false);
        // Signal parent that we want to edit this review
        onShowReviewForm(userExistingReview);
    };

    const handleCancelExistingReview = () => {
        setShowExistingReviewModal(false);
        setUserExistingReview(null);
    };

    const handleFollowToggle = async () => {
        if (!user?.token) {
            alert('יש להתחבר כדי להוסיף קורסים למעקב');
            return;
        }
    
        setIsLoading(true);
        try {
            let response;
    
            if (isFollowing) {
                response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tracked-courses/${courseId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                });
            } else {
                // הוספה למעקב
                response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tracked-courses`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ courseId }),
                });
            }
    
            if (response.ok) {
                setIsFollowing(!isFollowing);
                // Call callback to refresh parent data if provided
                if (onDataChanged) {
                    onDataChanged();
                }

                // Notify other tabs/components about tracked course change
                const eventType = isFollowing ? 'trackedCourseRemoved' : 'trackedCourseAdded';
                const trackingEvent = new CustomEvent(eventType, {
                    detail: { courseId, timestamp: Date.now() }
                });
                window.dispatchEvent(trackingEvent);

                // Update localStorage for cross-tab synchronization
                localStorage.setItem('trackedCourseChanged', JSON.stringify({
                    courseId,
                    action: isFollowing ? 'removed' : 'added',
                    timestamp: Date.now()
                }));

                // Clear dashboard cache so it refreshes on next visit
                const dashboardCache = window.localStorage.getItem('dashboard_tracked_courses');
                if (dashboardCache) {
                    window.localStorage.removeItem('dashboard_tracked_courses');
                    window.localStorage.removeItem('dashboard_tracked_courses_timestamp');
                }
                
                // Refresh dashboard data if the global function is available
                if (window.refreshDashboardData) {
                    window.refreshDashboardData();
                }
            } else {
                const error = await response.json();
                console.error('Follow error:', error);
                alert(error.message || 'שגיאה בעדכון המעקב');
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            alert('שגיאה בעדכון המעקב');
        } finally {
            setIsLoading(false);
        }
    };
    

    const handleShare = async () => {
        const currentUrl = window.location.href;
        try {
            await navigator.clipboard.writeText(currentUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
        } catch (error) {
            const textArea = document.createElement('textarea');
            textArea.value = currentUrl;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
        }
    };

    return (
        <>
            <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">פעולות מהירות</h3>

                <div className="space-y-3">
                    {!isFollowing && (
                        <button 
                            onClick={handleFollowToggle}
                            disabled={isLoading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    מוסיף למעקב...
                                </>
                            ) : (
                                <>
                                    <HeartHandshake className="w-5 h-5" />
                                    הוסף למעקב
                                </>
                            )}
                        </button>
                    )}

                    {isFollowing && (
                        <button 
                            onClick={handleFollowToggle}
                            disabled={isLoading}
                            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    מסיר מהמעקב...
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    הסר מהמעקב
                                </>
                            )}
                        </button>
                    )}

                    <button
                        onClick={handleWriteReviewClick}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        כתוב ביקורת
                    </button>

                    <button 
                        onClick={handleShare}
                        className={`w-full py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                            copySuccess 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-500 hover:bg-gray-600 text-white'
                        }`}
                    >
                        {copySuccess ? (
                            <>
                                <Check className="w-5 h-5" />
                                הקישור הועתק בהצלחה!
                            </>
                        ) : (
                            <>
                                <Copy className="w-5 h-5" />
                                שתף עם חברים
                            </>
                        )}
                    </button>
                </div>

                {copySuccess && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700 text-center">
                            חברים שיקבלו את הקישור יצטרכו להתחבר למערכת כדי לצפות בפרטים
                        </p>
                    </div>
                )}
            </div>

            {/* Existing Review Modal */}
            {showExistingReviewModal && userExistingReview && (
                <ExistingReviewModal
                    onEdit={handleEditExistingReview}
                    onCancel={handleCancelExistingReview}
                    existingReview={userExistingReview}
                    reviewType="course"
                />
            )}
        </>
    );
};

export default CourseQuickActions;