import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  BookOpen, 
  Building, 
  Hash,
  SortAsc,
  SortDesc,
  X,
  Eye,
  EyeOff,
  Star
} from 'lucide-react';

const ReviewFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  sortBy, 
  setSortBy, 
  sortOrder, 
  setSortOrder,
  uniqueLecturers,
  uniqueCourses,
  uniqueDepartments 
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 'all'
  );

  const sortOptions = [
    { value: 'newest', label: 'הכי חדש', icon: Calendar },
    { value: 'oldest', label: 'הכי ישן', icon: Calendar },
    { value: 'course', label: 'לפי קורס', icon: BookOpen },
    { value: 'lecturer', label: 'לפי מרצה', icon: User },
    { value: 'rating', label: 'לפי דירוג', icon: Star },
    { value: 'department', label: 'לפי מחלקה', icon: Building }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      {/* Main Search and Quick Actions */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="חיפוש לפי שם קורס, מרצה, מחלקה או תוכן..."
            value={filters.searchTerm}
            onChange={(e) => onFilterChange('searchTerm', e.target.value)}
            className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium">מיין לפי:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title={sortOrder === 'desc' ? 'מיון יורד' : 'מיון עולה'}
          >
            {sortOrder === 'desc' ? (
              <SortDesc className="w-4 h-4 text-gray-600" />
            ) : (
              <SortAsc className="w-4 h-4 text-gray-600" />
            )}
          </button>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showAdvancedFilters 
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                : 'bg-gray-100 text-gray-700 border-gray-200'
            } border`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">סינון מתקדם</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">נקה סינון</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Lecturer Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                מרצה
              </label>
              <select
                value={filters.lecturer}
                onChange={(e) => onFilterChange('lecturer', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">כל המרצים</option>
                {uniqueLecturers.map(lecturer => (
                  <option key={lecturer} value={lecturer}>
                    {lecturer}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-500" />
                קורס
              </label>
              <select
                value={filters.course}
                onChange={(e) => onFilterChange('course', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">כל הקורסים</option>
                {uniqueCourses.map(course => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Number Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-500" />
                מספר קורס
              </label>
              <input
                type="text"
                placeholder="לדוגמה: 12345"
                value={filters.courseNumber}
                onChange={(e) => onFilterChange('courseNumber', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-500" />
                מחלקה
              </label>
              <select
                value={filters.department}
                onChange={(e) => onFilterChange('department', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">כל המחלקות</option>
                {uniqueDepartments.map(department => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                מתאריך
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => onFilterChange('startDate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* End Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                עד תאריך
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => onFilterChange('endDate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Min Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-gray-500" />
                דירוג מינימלי
              </label>
              <select
                value={filters.minRating}
                onChange={(e) => onFilterChange('minRating', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">ללא מגבלה</option>
                <option value="1">1 כוכב ומעלה</option>
                <option value="2">2 כוכבים ומעלה</option>
                <option value="3">3 כוכבים ומעלה</option>
                <option value="4">4 כוכבים ומעלה</option>
                <option value="5">5 כוכבים</option>
              </select>
            </div>

            {/* Max Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-gray-500" />
                דירוג מקסימלי
              </label>
              <select
                value={filters.maxRating}
                onChange={(e) => onFilterChange('maxRating', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">ללא מגבלה</option>
                <option value="1">1 כוכב</option>
                <option value="2">2 כוכבים ומטה</option>
                <option value="3">3 כוכבים ומטה</option>
                <option value="4">4 כוכבים ומטה</option>
                <option value="5">5 כוכבים ומטה</option>
              </select>
            </div>

            {/* Anonymous Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-500" />
                סוג ביקורת
              </label>
              <select
                value={filters.isAnonymous}
                onChange={(e) => onFilterChange('isAnonymous', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">כל הביקורות</option>
                <option value="false">ביקורות גלויות</option>
                <option value="true">ביקורות אנונימיות</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">סינונים פעילים:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value || value === 'all') return null;
                  
                  const filterLabels = {
                    searchTerm: 'חיפוש',
                    lecturer: 'מרצה',
                    course: 'קורס',
                    courseNumber: 'מספר קורס',
                    department: 'מחלקה',
                    startDate: 'מתאריך',
                    endDate: 'עד תאריך',
                    minRating: 'דירוג מינימלי',
                    maxRating: 'דירוג מקסימלי',
                    isAnonymous: 'סוג ביקורת'
                  };

                  const displayValue = key === 'isAnonymous' 
                    ? (value === 'true' ? 'אנונימי' : 'גלוי')
                    : value;

                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full"
                    >
                      {filterLabels[key]}: {displayValue}
                      <button
                        onClick={() => onFilterChange(key, key === 'isAnonymous' ? 'all' : '')}
                        className="ml-1 hover:text-emerald-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewFilters;