import React from 'react';
import { HeartHandshake, Plus, MessageCircle } from 'lucide-react';

const QuickActions = ({ onShowReviewForm }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">פעולות מהירות</h3>

            <div className="space-y-3">
                <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <HeartHandshake className="w-5 h-5" />
                    הוסף למעקב
                </button>

                <button
                    onClick={onShowReviewForm}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    כתוב ביקורת
                </button>

                <button className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    שתף עם חברים
                </button>
            </div>
        </div>
    );
};

export default QuickActions;