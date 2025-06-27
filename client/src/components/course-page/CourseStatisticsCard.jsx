import React from 'react';
import { BarChart3, Heart, Brain, Clock, Zap, Award } from 'lucide-react';

const CourseStatisticsCard = ({ stats }) => {
    const colors = {
        interest: 'red-500',
        difficulty: 'yellow-500',
        workload: 'orange-500',
        investment: 'green-500',
        teachingQuality: 'purple-500'
    };

    const renderStat = (Icon, label, value, color) => {
        if (value == null || isNaN(value)) return null;

        return (
            <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 text-${color}`} />
                <div className="flex-1">
                    <div className="flex justify-between">
                        <span className="text-gray-600">{label}</span>
                        <span className={`font-bold text-${color}`}>{value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                            className={`bg-${color} h-2 rounded-full`}
                            style={{ width: `${(value / 5) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        );
    };

    if (!stats || Object.values(stats).every(val => val == null)) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-6" dir="rtl">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                    סטטיסטיקות
                </h3>
                <div className="text-center py-8 text-gray-500">
                    אין מספיק ביקורות להצגת סטטיסטיקות
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6" dir="rtl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                סטטיסטיקות ({stats.total} ביקורות)
            </h3>

            <div className="space-y-4">
                {renderStat(Heart, 'עניין', stats.avgInterest, colors.interest)}
                {renderStat(Brain, 'קושי', stats.avgDifficulty, colors.difficulty)}
                {renderStat(Clock, 'עומס', stats.avgWorkload, colors.workload)}
                {renderStat(Zap, 'השקעה', stats.avgInvestment, colors.investment)}
                {renderStat(Award, 'איכות הוראה', stats.avgTeachingQuality, colors.teachingQuality)}
            </div>
        </div>
    );
};

export default CourseStatisticsCard;
