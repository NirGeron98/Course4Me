import React from 'react';
import { Search, X, BookOpen, User } from 'lucide-react';
import CourseResultCard from './CourseResultCard';
import LecturerResultCard from './LecturerResultCard';

const SearchResults = ({
  searchType,
  results,
  loading,
  hasSearched,
  onCourseSelect,
  onLecturerSelect
}) => {
  if (!hasSearched) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Search className="w-12 h-12 text-blue-500" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">
            התחל את החיפוש שלך
          </h3>
          <p className="text-gray-600 text-lg">
            השתמש בפילטרים למעלה כדי לחפש {searchType === 'courses' ? 'קורסים' : 'מרצים'}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="text-center py-16">
          {loading && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="text-center py-16">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">מחפש...</h3>
                <p className="text-gray-500">
                  מחפש {searchType === 'courses' ? 'קורסים' : 'מרצים'} עבורך
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <X className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">
            לא נמצאו תוצאות
          </h3>
          <p className="text-gray-600 text-lg mb-4">
            נסה לשנות את הפילטרים או להשתמש במילות חיפוש אחרות
          </p>
          <div className="text-sm text-gray-500">
            💡 טיפ: נסה חיפוש רחב יותר או בדוק אות כתיב
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {searchType === 'courses' ? (
              <div className="bg-blue-100 rounded-full p-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
            ) : (
              <div className="bg-purple-100 rounded-full p-2">
                <User className="w-5 h-5 text-purple-600" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">
                תוצאות חיפוש
              </h3>
              <p className="text-sm text-gray-600">
                נמצאו {results.length} {searchType === 'courses' ? 'קורסים' : 'מרצים'}
              </p>
            </div>
          </div>

          {/* Results counter badge */}
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
            <span className="text-sm font-medium text-gray-700">
              {results.length} תוצאות
            </span>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {results.map((item) => (
            searchType === 'courses' ? (
              <CourseResultCard
                key={item._id}
                course={item}
                onSelect={() => onCourseSelect(item)}
              />
            ) : (
              <LecturerResultCard
                key={item._id}
                lecturer={item}
                onSelect={() => onLecturerSelect(item)}
              />
            )
          ))}
        </div>

        {/* Load more hint (for future pagination) */}
        {results.length >= 20 && (
          <div className="text-center mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              מוצגות {results.length} התוצאות הראשונות
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;