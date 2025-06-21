import React, { useState, useEffect } from 'react';
import { HeartHandshake, Plus, Check, Copy } from 'lucide-react';

const QuickActions = ({ onShowReviewForm, courseId, courseName, user }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        const checkFollowStatus = async () => {
            if (!user?.token || !courseId) return;

            try {
                const response = await fetch(`http://localhost:5000/api/tracked-courses`, {
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

        checkFollowStatus();
    }, [courseId, user?.token]);

    const handleFollowToggle = async () => {
        if (!user?.token) {
            alert('יש להתחבר כדי להוסיף קורסים למעקב');
            return;
        }

        setIsLoading(true);
        try {
            const endpoint = isFollowing ? 'unfollow' : 'follow';
            const response = await fetch(`http://localhost:5000/api/users/${endpoint}/${courseId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setIsFollowing(!isFollowing);
            } else {
                alert('שגיאה בעדכון המעקב');
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
                    onClick={onShowReviewForm}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
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
    );
};

export default QuickActions;