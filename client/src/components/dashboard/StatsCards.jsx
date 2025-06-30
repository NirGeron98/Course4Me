import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, MessageSquare, TrendingUp, Users } from 'lucide-react';

const StatsCards = ({ stats, allCoursesCount, lecturersCount }) => {
  const navigate = useNavigate();

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Tracked Courses */}
      <div
        onClick={() => navigate('/tracked-courses')}
        className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 rounded-full p-3">
            <BookOpen className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{stats.coursesCount}</h3>
            <p className="text-gray-600">הקורסים שלי</p>
          </div>
        </div>
      </div>

      {/* My Reviews */}
      <div
        onClick={() => navigate('/my-reviews')}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 rounded-full p-3">
            <MessageSquare className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{stats.reviewsCount}</h3>
            <p className="text-gray-600">ביקורות שכתבתי</p>
          </div>
        </div>
      </div>

      {/* Total Courses */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 rounded-full p-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{allCoursesCount}</h3>
            <p className="text-gray-600">קורסים במערכת</p>
          </div>
        </div>
      </div>

      {/* Total Lecturers */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
        <div className="flex items-center gap-4">
          <div className="bg-purple-100 rounded-full p-3">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{lecturersCount}</h3>
            <p className="text-gray-600">מרצים במערכת</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsCards;
