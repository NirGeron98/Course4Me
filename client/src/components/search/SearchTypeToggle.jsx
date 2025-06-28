import React from 'react';
import { BookOpen, User } from 'lucide-react';

const SearchTypeToggle = ({ searchType, onSearchTypeChange }) => {
  return (
    <div className="flex bg-white/20 rounded-xl p-1 max-w-md mx-auto">
      <button
        onClick={() => onSearchTypeChange('courses')}
        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
          searchType === 'courses'
            ? 'bg-white text-blue-600 shadow-lg'
            : 'text-white hover:bg-white/10'
        }`}
      >
        <BookOpen className="w-5 h-5" />
        קורסים
      </button>
      <button
        onClick={() => onSearchTypeChange('lecturers')}
        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
          searchType === 'lecturers'
            ? 'bg-white text-blue-600 shadow-lg'
            : 'text-white hover:bg-white/10'
        }`}
      >
        <User className="w-5 h-5" />
        מרצים
      </button>
    </div>
  );
};

export default SearchTypeToggle;