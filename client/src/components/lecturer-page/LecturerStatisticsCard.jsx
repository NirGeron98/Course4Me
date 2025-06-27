import React from 'react';
import { BarChart3, Eye, Users, Clock, Zap, Award } from 'lucide-react';

const LecturerStatisticsCard = ({ stats }) => {
    const colors = {
        clarity: 'blue-500',
        responsiveness: 'green-500',
        availability: 'orange-500',
        organization: 'red-500',
        knowledge: 'yellow-500'
    };

    const renderStat = (Icon, label, value, color) => (
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

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6" dir="rtl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                סטטיסטיקות
            </h3>

            <div className="space-y-4">
                {renderStat(Eye, 'בהירות הוראה', stats.avgClarity, colors.clarity)}
                {renderStat(Users, 'התחשבות בסטודנטים', stats.avgResponsiveness, colors.responsiveness)}
                {renderStat(Clock, 'זמינות', stats.avgAvailability, colors.availability)}
                {renderStat(Zap, 'ארגון השיעור', stats.avgOrganization, colors.organization)}
                {renderStat(Award, 'עומק הידע', stats.avgKnowledge, colors.knowledge)}
            </div>
        </div>
    );
};

export default LecturerStatisticsCard;