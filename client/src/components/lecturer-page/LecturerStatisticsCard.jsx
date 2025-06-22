import React from 'react';
import { Eye, Users, Clock, Zap, Award, Star } from 'lucide-react';

const LecturerStatisticsCard = ({ stats, renderStars }) => {
  const metrics = [
    {
      label: 'Clarity of Teaching',
      value: stats.avgClarity,
      icon: <Eye className="w-4 h-4 text-blue-500" />,
      color: 'blue-500',
    },
    {
      label: 'Student Consideration',
      value: stats.avgResponsiveness,
      icon: <Users className="w-4 h-4 text-green-500" />,
      color: 'green-500',
    },
    {
      label: 'Availability',
      value: stats.avgAvailability,
      icon: <Clock className="w-4 h-4 text-orange-500" />,
      color: 'orange-500',
    },
    {
      label: 'Lesson Organization',
      value: stats.avgOrganization,
      icon: <Zap className="w-4 h-4 text-red-500" />,
      color: 'red-500',
    },
    {
      label: 'Depth of Knowledge',
      value: stats.avgKnowledge,
      icon: <Award className="w-4 h-4 text-yellow-500" />,
      color: 'yellow-500',
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-500" />
        Rating Breakdown
      </h3>

      <div className="space-y-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {metric.icon}
              <span className="text-sm font-medium">{metric.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {renderStars(parseFloat(metric.value), 'w-3 h-3')}
              </div>
              <span className={`text-sm font-bold text-${metric.color}`}>
                {metric.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LecturerStatisticsCard;
