import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, MessageSquare, TrendingUp, Users } from 'lucide-react';

// Simple and elegant primary loading component
const ElegantLoadingSpinner = ({ message = "טוען נתונים..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center" dir="rtl">
      <div className="text-center space-y-6">
        {/* Simple elegant spinner */}
        <div className="relative mx-auto w-12 h-12">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        {/* Clean typography */}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-700">{message}</h3>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple secondary loading component
const ElegantSecondaryLoading = ({ message = "טוען עוד נתונים..." }) => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="text-center space-y-3">
        {/* Simple compact spinner */}
        <div className="relative mx-auto w-8 h-8">
          <div className="absolute inset-0 border-3 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        {/* Simple text */}
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
};

// Skeleton loading for individual stat card
const StatCardSkeleton = ({ color = "emerald" }) => {
  const colorClasses = {
    emerald: "bg-emerald-50 border-emerald-100",
    gray: "bg-gray-50 border-gray-100", 
    blue: "bg-blue-50 border-blue-100",
    purple: "bg-purple-50 border-purple-100"
  };

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg border ${colorClasses[color]} animate-pulse`}>
      <div className="flex items-center gap-4">
        {/* Icon skeleton */}
        <div className={`${colorClasses[color]} rounded-full p-3 w-12 h-12`}>
          <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="flex-1">
          {/* Number skeleton */}
          <div className="h-8 bg-gray-300 rounded w-16 mb-2 animate-pulse"></div>
          {/* Text skeleton */}
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

// Enhanced StatsCards with skeleton loading
const StatsCards = ({ stats, allCoursesCount, lecturersCount, isLoading = false }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardSkeleton color="emerald" />
        <StatCardSkeleton color="gray" />
        <StatCardSkeleton color="blue" />
        <StatCardSkeleton color="purple" />
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Tracked Courses */}
      <div
        onClick={() => navigate('/tracked-courses')}
        className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 rounded-full p-3 group-hover:bg-emerald-200 transition-colors">
            <BookOpen className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">
              {stats.coursesCount}
            </h3>
            <p className="text-gray-600">הקורסים שלי</p>
          </div>
        </div>
      </div>

      {/* My Reviews */}
      <div
        onClick={() => navigate('/my-reviews')}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 rounded-full p-3 group-hover:bg-gray-200 transition-colors">
            <MessageSquare className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 group-hover:text-gray-600 transition-colors">
              {stats.reviewsCount}
            </h3>
            <p className="text-gray-600">ביקורות שכתבתי</p>
          </div>
        </div>
      </div>

      {/* Total Courses */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 rounded-full p-3 group-hover:bg-blue-200 transition-colors">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
              {allCoursesCount}
            </h3>
            <p className="text-gray-600">קורסים במערכת</p>
          </div>
        </div>
      </div>

      {/* Total Lecturers */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl hover:scale-105 transition-all duration-300 group">
        <div className="flex items-center gap-4">
          <div className="bg-purple-100 rounded-full p-3 group-hover:bg-purple-200 transition-colors">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
              {lecturersCount}
            </h3>
            <p className="text-gray-600">מרצים במערכת</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export { ElegantLoadingSpinner, ElegantSecondaryLoading, StatsCards };