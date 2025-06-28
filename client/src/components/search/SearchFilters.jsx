// components/search/SearchFilters.jsx
import React, { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Hash, Award, Users, Star, Mail } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput';
import MultiSelectDepartments from '../common/MultiSelectDepartments';

const SearchFilters = ({
    searchType,
    filters,
    onFilterChange,
    onClearFilters,
    onSearch,
    loading,
    departments,
    institutions,
    lecturers
}) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    const handleDepartmentsChange = (selectedDepartments) => {
        onFilterChange('departments', selectedDepartments);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded-full p-2">
                        <Filter className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">פילטרי חיפוש</h3>
                </div>
                <button
                    onClick={onClearFilters}
                    className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-all duration-200 font-semibold border border-red-200 hover:border-red-300"
                >
                    נקה הכל
                </button>
            </div>

            {/* Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* General Search */}
                <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        חיפוש כללי
                    </label>
                    <div className="relative">
                        <Search className="absolute right-3 top-3.5 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={filters.searchTerm}
                            onChange={(e) => onFilterChange('searchTerm', e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={searchType === 'courses' ? 'שם קורס, תיאור...' : 'שם מרצה, ביוגרפיה...'}
                            className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                        />
                    </div>
                </div>

                {/* Multi-Select Departments */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        מחלקות
                    </label>
                    <MultiSelectDepartments
                        departments={departments}
                        selectedDepartments={filters.departments || []}
                        onChange={handleDepartmentsChange}
                        placeholder="בחר מחלקות..."
                    />
                </div>

                {/* Academic Institution Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        מוסד אקדמי
                    </label>
                    <select
                        value={filters.academicInstitution}
                        onChange={(e) => onFilterChange('academicInstitution', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    >
                        <option value="">כל המוסדות</option>
                        {institutions.map(inst => (
                            <option key={inst} value={inst}>{inst}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="border-t border-gray-200 pt-4">
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                    <span>פילטרים מתקדמים</span>
                    {showAdvanced ? (
                        <ChevronUp className="w-4 h-4" />
                    ) : (
                        <ChevronDown className="w-4 h-4" />
                    )}
                </button>

                {/* Advanced Filters */}
                {showAdvanced && (
                    <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchType === 'courses' ? (
                                <>
                                    {/* Course Number */}
                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <Hash className="w-4 h-4 text-blue-500" />
                                            מספר קורס
                                        </label>
                                        <input
                                            type="text"
                                            value={filters.courseNumber}
                                            onChange={(e) => onFilterChange('courseNumber', e.target.value)}
                                            placeholder="לדוגמה: 12345"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    {/* Credits */}
                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <Award className="w-4 h-4 text-green-500" />
                                            נקודות זכות
                                        </label>
                                        <select
                                            value={filters.credits}
                                            onChange={(e) => onFilterChange('credits', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">כל הנקודות</option>
                                            <option value="1">1 נק"ז</option>
                                            <option value="2">2 נק"ז</option>
                                            <option value="3">3 נק"ז</option>
                                            <option value="4">4 נק"ז</option>
                                            <option value="5">5 נק"ז</option>
                                            <option value="6">6 נק"ז</option>
                                        </select>
                                    </div>

                                    {/* Lecturer Autocomplete */}
                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <Users className="w-4 h-4 text-purple-500" />
                                            מרצה
                                        </label>
                                        <AutocompleteInput
                                            options={lecturers.map(lec => ({ id: lec._id, name: lec.name }))}
                                            value={filters.lecturer}
                                            onChange={(value) => onFilterChange('lecturer', value)}
                                            placeholder="חפש מרצה..."
                                            displayKey="name"
                                            valueKey="id"
                                        />
                                    </div>

                                    {/* Rating Range */}
                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <Star className="w-4 h-4 text-yellow-500" />
                                            דירוג
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-2">מינימום</label>
                                                <select
                                                    value={filters.minRating}
                                                    onChange={(e) => onFilterChange('minRating', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                                                >
                                                    <option value="">הכל</option>
                                                    <option value="1">1⭐</option>
                                                    <option value="2">2⭐</option>
                                                    <option value="3">3⭐</option>
                                                    <option value="4">4⭐</option>
                                                    <option value="5">5⭐</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-2">מקסימום</label>
                                                <select
                                                    value={filters.maxRating}
                                                    onChange={(e) => onFilterChange('maxRating', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                                                >
                                                    <option value="">הכל</option>
                                                    <option value="1">1⭐</option>
                                                    <option value="2">2⭐</option>
                                                    <option value="3">3⭐</option>
                                                    <option value="4">4⭐</option>
                                                    <option value="5">5⭐</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Has Reviews Checkbox */}
                                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-center">
                                        <label className="flex items-center gap-4 cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 rounded-xl p-4 w-full border border-blue-200 hover:border-blue-300 hover:shadow-md">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.hasReviews}
                                                    onChange={(e) => onFilterChange('hasReviews', e.target.checked)}
                                                    className="w-6 h-6 text-blue-600 bg-white border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2 transition-all"
                                                />
                                                {filters.hasReviews && (
                                                    <div className="absolute inset-0 w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base font-semibold text-gray-700">רק עם ביקורות</span>
                                                <span className="text-sm text-gray-500">הצג רק קורסים עם דירוגים</span>
                                            </div>
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Lecturer Email */}
                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-blue-500" />
                                            אימייל מרצה
                                        </label>
                                        <input
                                            type="email"
                                            value={filters.lecturerEmail}
                                            onChange={(e) => onFilterChange('lecturerEmail', e.target.value)}
                                            placeholder="כתובת אימייל"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>

                                    {/* Lecturer Rating Range */}
                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <Star className="w-4 h-4 text-yellow-500" />
                                            דירוג מרצה
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-2">מינימום</label>
                                                <select
                                                    value={filters.minLecturerRating}
                                                    onChange={(e) => onFilterChange('minLecturerRating', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                                                >
                                                    <option value="">הכל</option>
                                                    <option value="1">1⭐</option>
                                                    <option value="2">2⭐</option>
                                                    <option value="3">3⭐</option>
                                                    <option value="4">4⭐</option>
                                                    <option value="5">5⭐</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-2">מקסימום</label>
                                                <select
                                                    value={filters.maxLecturerRating}
                                                    onChange={(e) => onFilterChange('maxLecturerRating', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                                                >
                                                    <option value="">הכל</option>
                                                    <option value="1">1⭐</option>
                                                    <option value="2">2⭐</option>
                                                    <option value="3">3⭐</option>
                                                    <option value="4">4⭐</option>
                                                    <option value="5">5⭐</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Has Reviews Checkbox */}
                                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-center">
                                        <label className="flex items-center gap-4 cursor-pointer bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 rounded-xl p-4 w-full border border-purple-200 hover:border-purple-300 hover:shadow-md">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.hasLecturerReviews}
                                                    onChange={(e) => onFilterChange('hasLecturerReviews', e.target.checked)}
                                                    className="w-6 h-6 text-purple-600 bg-white border-2 border-gray-300 rounded-lg focus:ring-purple-500 focus:ring-2 transition-all"
                                                />
                                                {filters.hasLecturerReviews && (
                                                    <div className="absolute inset-0 w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base font-semibold text-gray-700">רק עם ביקורות</span>
                                                <span className="text-sm text-gray-500">הצג רק מרצים עם דירוגים</span>
                                            </div>
                                        </label>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Search Button */}
            <div className="mt-6 flex justify-center">
                <button
                    onClick={onSearch}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-3 px-8 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-3 min-w-[150px]"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            מחפש...
                        </>
                    ) : (
                        <>
                            <Search className="w-5 h-5" />
                            חפש
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default SearchFilters;