import React, { useState, useEffect } from 'react';
import { HeartHandshake, Plus, Check, Copy } from 'lucide-react';
import ExistingReviewModal from '../common/ExistingReviewModal'; 

const LecturerQuickActions = ({ onShowReviewForm, lecturerId, lecturerName, user, reviews, onEditReview }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [showExistingReviewModal, setShowExistingReviewModal] = useState(false);
    const [userExistingReview, setUserExistingReview] = useState(null);

    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!user?.token || !lecturerId) return;

            try {
                const response = await fetch(`http://localhost:5000/api/tracked-lecturers`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const trackedLecturers = await response.json();
                    setIsFollowing(trackedLecturers.some(tracked => tracked.lecturer?._id === lecturerId));
                }
            } catch (error) {
                console.error('Error checking follow status:', error);
            }
        };

        checkFollowStatus();
    }, [lecturerId, user?.token]);

    const checkForExistingReview = () => {
        if (!user?.user || !reviews) {
            return null;
        }
    
        
        const existingReview = reviews.find(review => 
            review.user && review.user._id === user.user._id
        );
        
        return existingReview;
    };

    const handleReviewClick = () => {
        
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
        onEditReview(userExistingReview);
    };

    const handleCancelExistingReview = () => {
        setShowExistingReviewModal(false);
        setUserExistingReview(null);
    };

    const handleFollowToggle = async () => {
        if (!user?.token) {
            alert('יש להתחבר כדי להוסיף מרצים למעקב');
            return;
        }
    
        setIsLoading(true);
        try {
            let response;
    
            if (isFollowing) {
                response = await fetch(`http://localhost:5000/api/tracked-lecturers/${lecturerId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                });
            } else {
                response = await fetch(`http://localhost:5000/api/tracked-lecturers`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ lecturerId }),
                });
            }
    
            if (response.ok) {
                setIsFollowing(!isFollowing);
            } else {
                const error = await response.json();
                console.error('שגיאה:', error);
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
            <div className="bg-white rounded-2xl shadow-lg p-6" dir="rtl">
                <h3 className="text-xl font-bold text-gray-800 mb-4">פעולות מהירות</h3>

                <div className="space-y-3">
                    {user && (
                        <>
                            {!isFollowing && (
                                <button 
                                    onClick={handleFollowToggle}
                                    disabled={isLoading}
                                    className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            מוסיף למעקב...
                                        </>
                                    ) : (
                                        <>
                                            <HeartHandshake className="w-5 h-5" />
                                            הוסף מרצה למעקב
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
                                            הסר מרצה מהמעקב
                                        </>
                                    )}
                                </button>
                            )}

                            <button
                                onClick={handleReviewClick}
                                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                כתוב ביקורת מרצה
                            </button>
                        </>
                    )}

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
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-700 text-center">
                            חברים שיקבלו את הקישור יצטרכו להתחבר למערכת כדי לצפות בפרטים
                        </p>
                    </div>
                )}
            </div>

            {/* Existing Review Modal */}
            {showExistingReviewModal && userExistingReview && (
                <ExistingReviewModal
                    existingReview={userExistingReview}
                    onEdit={handleEditExistingReview}
                    onCancel={handleCancelExistingReview}
                    reviewType="lecturer"
                />
            )}
        </>
    );
};

export default LecturerQuickActions;