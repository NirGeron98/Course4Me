import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchTypeToggle from '../components/search/SearchTypeToggle';
import SearchFilters from '../components/search/SearchFilters';
import SearchResults from '../components/search/SearchResults';
import CourseDetailsModal from '../components/tracked-courses/CourseDetailsModal';

const AdvancedSearch = ({ user }) => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState('courses'); // 'courses' or 'lecturers'
  const [filters, setFilters] = useState({
    // Common filters
    searchTerm: '',
    departments: [], // Array of department names
    academicInstitution: '',
    
    // Course-specific filters
    courseNumber: '',
    credits: '',
    minRating: '',
    maxRating: '',
    hasReviews: false,
    lecturer: '',
    
    // Lecturer-specific filters
    lecturerName: '',
    lecturerEmail: '',
    minLecturerRating: '',
    maxLecturerRating: '',
    hasLecturerReviews: false
  });

  // Store filters for each search type separately
  const [courseFilters, setCourseFilters] = useState({
    searchTerm: '',
    departments: [],
    academicInstitution: '',
    courseNumber: '',
    credits: '',
    minRating: '',
    maxRating: '',
    hasReviews: false,
    lecturer: ''
  });

  const [lecturerFilters, setLecturerFilters] = useState({
    searchTerm: '',
    departments: [],
    academicInstitution: '',
    lecturerEmail: '',
    minLecturerRating: '',
    maxLecturerRating: '',
    hasLecturerReviews: false
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = 'חיפוש מתקדם - Course4Me';
    
    return () => {
      document.title = 'Course4Me';
    };
  }, []);

  // Fetch filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch departments from the separate departments model instead of extracting from courses/lecturers
        const [departmentsRes, lecturersRes, coursesRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/departments`, { headers }),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/lecturers`, { headers }),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/courses`, { headers })
        ]);

        // Extract department names from the departments model
        const allDepts = departmentsRes.data.map(dept => dept.name).sort();

        // Extract unique institutions from both courses and lecturers
        const courseInsts = coursesRes.data.map(course => course.academicInstitution).filter(Boolean);
        const lecturerInsts = lecturersRes.data.map(lecturer => lecturer.academicInstitution).filter(Boolean);
        const allInsts = [...new Set([...courseInsts, ...lecturerInsts])].sort();

        setDepartments(allDepts);
        setLecturers(lecturersRes.data);
        setInstitutions(allInsts);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Update filters when search type changes
  useEffect(() => {
    if (searchType === 'courses') {
      setFilters(courseFilters);
    } else {
      setFilters(lecturerFilters);
    }
    setResults([]);
    setHasSearched(false);
  }, [searchType, courseFilters, lecturerFilters]);

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    
    setFilters(newFilters);
    
    // Update the appropriate filter store
    if (searchType === 'courses') {
      setCourseFilters(newFilters);
    } else {
      setLecturerFilters(newFilters);
    }
  };

  const clearFilters = () => {
    const clearedFilters = searchType === 'courses' ? {
      searchTerm: '',
      departments: [],
      academicInstitution: '',
      courseNumber: '',
      credits: '',
      minRating: '',
      maxRating: '',
      hasReviews: false,
      lecturer: ''
    } : {
      searchTerm: '',
      departments: [],
      academicInstitution: '',
      lecturerEmail: '',
      minLecturerRating: '',
      maxLecturerRating: '',
      hasLecturerReviews: false
    };

    setFilters(clearedFilters);
    
    if (searchType === 'courses') {
      setCourseFilters(clearedFilters);
    } else {
      setLecturerFilters(clearedFilters);
    }
    
    setResults([]);
    setHasSearched(false);
  };

  const performSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      if (searchType === 'courses') {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/courses`, { headers });
        let filteredResults = response.data;

        // Apply search term filter
        if (filters.searchTerm) {
          const term = filters.searchTerm.toLowerCase();
          filteredResults = filteredResults.filter(course =>
            course.title?.toLowerCase().includes(term) ||
            course.name?.toLowerCase().includes(term) ||
            course.description?.toLowerCase().includes(term)
          );
        }

        // Apply departments filter - check if course has any of the selected departments
        if (filters.departments && filters.departments.length > 0) {
          filteredResults = filteredResults.filter(course => {
            if (!course.department) return false;
            
            // Handle both old format (comma-separated string) and new format (array)
            let courseDepartments = [];
            if (Array.isArray(course.department)) {
              courseDepartments = course.department;
            } else if (typeof course.department === 'string') {
              // Split by comma for backward compatibility
              courseDepartments = course.department.split(',').map(d => d.trim());
            }
            
            // Check if any selected department matches course departments
            return filters.departments.some(selectedDept => 
              courseDepartments.includes(selectedDept)
            );
          });
        }

        // Apply academic institution filter
        if (filters.academicInstitution) {
          filteredResults = filteredResults.filter(course => 
            course.academicInstitution === filters.academicInstitution
          );
        }

        // Apply course number filter
        if (filters.courseNumber) {
          filteredResults = filteredResults.filter(course =>
            course.courseNumber?.toLowerCase().includes(filters.courseNumber.toLowerCase()) ||
            course.code?.toLowerCase().includes(filters.courseNumber.toLowerCase())
          );
        }

        // Apply credits filter
        if (filters.credits) {
          filteredResults = filteredResults.filter(course =>
            course.credits?.toString() === filters.credits
          );
        }

        // Apply lecturer filter
        if (filters.lecturer) {
          filteredResults = filteredResults.filter(course => {
            if (!course.lecturers || !Array.isArray(course.lecturers)) return false;
            return course.lecturers.some(lec => 
              lec._id === filters.lecturer || lec === filters.lecturer
            );
          });
        }

        // Apply rating range filter
        if (filters.minRating || filters.maxRating) {
          filteredResults = filteredResults.filter(course => {
            const rating = course.averageRating || 0;
            const min = filters.minRating ? parseFloat(filters.minRating) : 0;
            const max = filters.maxRating ? parseFloat(filters.maxRating) : 5;
            return rating >= min && rating <= max;
          });
        }

        // Apply has reviews filter
        if (filters.hasReviews) {
          filteredResults = filteredResults.filter(course => 
            course.ratingsCount > 0 || course.reviewsCount > 0
          );
        }

        setResults(filteredResults);
      } else {
        // Lecturers search
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/lecturers`, { headers });
        let filteredResults = response.data;

        // Apply search term filter for lecturers
        if (filters.searchTerm || filters.lecturerName) {
          const term = (filters.searchTerm || filters.lecturerName).toLowerCase();
          filteredResults = filteredResults.filter(lecturer =>
            lecturer.name?.toLowerCase().includes(term) ||
            lecturer.bio?.toLowerCase().includes(term)
          );
        }

        // Apply departments filter for lecturers
        if (filters.departments && filters.departments.length > 0) {
          filteredResults = filteredResults.filter(lecturer => {
            if (!lecturer.department) return false;
            
            // Handle both old format (comma-separated string) and new format (array)
            let lecturerDepartments = [];
            if (Array.isArray(lecturer.department)) {
              lecturerDepartments = lecturer.department;
            } else if (typeof lecturer.department === 'string') {
              // Split by comma for backward compatibility
              lecturerDepartments = lecturer.department.split(',').map(d => d.trim());
            }
            
            // Check if any selected department matches lecturer departments
            return filters.departments.some(selectedDept => 
              lecturerDepartments.includes(selectedDept)
            );
          });
        }

        // Apply academic institution filter for lecturers
        if (filters.academicInstitution) {
          filteredResults = filteredResults.filter(lecturer => 
            lecturer.academicInstitution === filters.academicInstitution
          );
        }

        // Apply lecturer email filter
        if (filters.lecturerEmail) {
          filteredResults = filteredResults.filter(lecturer =>
            lecturer.email?.toLowerCase().includes(filters.lecturerEmail.toLowerCase())
          );
        }

        // Apply lecturer rating range filter
        if (filters.minLecturerRating || filters.maxLecturerRating) {
          filteredResults = filteredResults.filter(lecturer => {
            const rating = lecturer.averageRating || 0;
            const min = filters.minLecturerRating ? parseFloat(filters.minLecturerRating) : 0;
            const max = filters.maxLecturerRating ? parseFloat(filters.maxLecturerRating) : 5;
            return rating >= min && rating <= max;
          });
        }

        // Apply has reviews filter for lecturers
        if (filters.hasLecturerReviews) {
          filteredResults = filteredResults.filter(lecturer => 
            lecturer.ratingsCount > 0 || lecturer.reviewsCount > 0
          );
        }

        setResults(filteredResults);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
  };

  const handleLecturerSelect = (lecturer) => {
    navigate(`/lecturer/${lecturer._id}`);
  };

  const handleSearchTypeChange = (newType) => {
    setSearchType(newType);
    // Filters will be automatically updated by the useEffect
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="bg-white/20 rounded-full p-4">
              <Search className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">חיפוש מתקדם</h1>
              <p className="text-blue-100 text-lg">חפש קורסים ומרצים עם פילטרים מתקדמים</p>
            </div>
          </div>

          {/* Search Type Toggle */}
          <SearchTypeToggle 
            searchType={searchType} 
            onSearchTypeChange={handleSearchTypeChange}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Filters Section */}
        <SearchFilters
          searchType={searchType}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          onSearch={performSearch}
          loading={loading}
          departments={departments}
          institutions={institutions}
          lecturers={lecturers}
        />

        {/* Results Section */}
        <SearchResults
          searchType={searchType}
          results={results}
          loading={loading}
          hasSearched={hasSearched}
          onCourseSelect={handleCourseSelect}
          onLecturerSelect={handleLecturerSelect}
        />
      </div>

      {/* Course Details Modal */}
      {selectedCourse && (
        <CourseDetailsModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
};

export default AdvancedSearch;