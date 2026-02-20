import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BookOpen, Hash, Save, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import Select from "react-select";

const CourseManagement = ({ lecturers, onMessage, onError }) => {
    // State management
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredCourses, setFilteredCourses] = useState([]);
    const coursesPerPage = 5;

    // Form state
    const [courseForm, setCourseForm] = useState({
        courseNumber: "",
        title: "",
        description: "",
        lecturers: [],
        academicInstitution: "מכללת אפקה",
        credits: "",
        department: "",
        prerequisites: []
    });

    // Fetch all courses from API
    const fetchCourses = useCallback(async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/courses`);
            setCourses(response.data);
            setFilteredCourses(response.data);
        } catch (err) {
            console.error("Error fetching courses:", err);
            onError("שגיאה בטעינת הקורסים");
        }
    }, [onError]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    // Filter courses based on search term and update filtered courses
    useEffect(() => {
        const filtered = courses.filter((course) =>
            course.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCourses(filtered);
    }, [searchTerm, courses]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Reset form to initial state
    const resetForm = () => {
        setCourseForm({
            courseNumber: "",
            title: "",
            description: "",
            lecturers: [],
            academicInstitution: "מכללת אפקה",
            credits: "",
            department: "",
            prerequisites: []
        });
        setIsEditing(false);
        setEditId(null);
    };

    // Handle form submission for both adding and editing courses
    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const user = JSON.parse(localStorage.getItem("user"));
            const courseData = {
                ...courseForm,
                credits: parseInt(courseForm.credits),
                prerequisites: courseForm.prerequisites.join(", "),
                createdBy: user?._id,
            };

            let response;
            if (isEditing) {
                response = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/courses/${editId}`, courseData, {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });
                onMessage("הקורס עודכן בהצלחה!");
            } else {
                response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/courses`, courseData, {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });
                onMessage("קורס נוסף בהצלחה!");
            }

            if (response.status === 200 || response.status === 201) {
                resetForm();
                fetchCourses();
                // Removed setCurrentPage(1) to preserve current page position
            }
        } catch (err) {
            console.error("Error creating course:", err);
            onError(err.response?.data?.message || "שגיאה בהוספת הקורס");
        } finally {
            setIsLoading(false);
        }
    };

    // Populate form with course data for editing
    const handleEditCourse = (course) => {
        setCourseForm({
            courseNumber: course.courseNumber,
            title: course.title,
            description: course.description,
            lecturers: course.lecturers.map((l) => l._id),
            academicInstitution: course.academicInstitution,
            credits: course.credits.toString(),
            department: course.department || "",
            prerequisites: course.prerequisites ? course.prerequisites.split(",").map(s => s.trim()) : []
        });
        setEditId(course._id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Delete course with confirmation
    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm("האם אתה בטוח שברצונך למחוק את הקורס?")) return;
        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) {
                onMessage("קורס נמחק בהצלחה!");
                fetchCourses();
                // Adjust current page if needed after deletion
                const totalPages = Math.ceil((courses.length - 1) / coursesPerPage);
                if (currentPage > totalPages && totalPages > 0) {
                    setCurrentPage(totalPages);
                }
            }
        } catch (err) {
            console.error("Error deleting course:", err);
            onError(err.response?.data?.message || "שגיאה במחיקת הקורס");
        }
    };

    // Pagination calculations
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    const currentCourses = filteredCourses.slice(startIndex, endIndex);

    // Pagination handlers
    const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const handlePageClick = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="p-8">
            {/* Main Grid Layout - 3/4 for form, 1/4 for list */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 max-w-8xl mx-auto">

                {/* Left Side - Add Course Form (3/4 width) */}
                <div className="xl:col-span-3 space-y-6">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8">הוספת קורס חדש</h2>

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 shadow-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {/* Course Number Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    מספר קורס *
                                </label>
                                <div className="relative">
                                    <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={courseForm.courseNumber}
                                        onChange={(e) => setCourseForm({ ...courseForm, courseNumber: e.target.value })}
                                        className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                                        placeholder="123456"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Course Title Input */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    שם הקורס *
                                </label>
                                <div className="relative">
                                    <BookOpen className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={courseForm.title}
                                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                                        className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                                        placeholder="שם הקורס"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Credits Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    נקודות זכות *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={courseForm.credits}
                                    onChange={(e) => setCourseForm({ ...courseForm, credits: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                                    placeholder="4"
                                    required
                                />
                            </div>

                            {/* Lecturer Multi-Select */}
                            <div className="md:col-span-2 xl:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    מרצים (ניתן לבחור יותר מאחד)
                                </label>
                                <Select
                                    options={lecturers.map((lecturer) => ({
                                        value: lecturer._id,
                                        label: lecturer.name
                                    }))}
                                    isMulti
                                    value={lecturers
                                        .filter((lecturer) => courseForm.lecturers.includes(lecturer._id))
                                        .map((lecturer) => ({
                                            value: lecturer._id,
                                            label: lecturer.name
                                        }))}
                                    onChange={(selectedOptions) => {
                                        setCourseForm({
                                            ...courseForm,
                                            lecturers: selectedOptions.map((option) => option.value)
                                        });
                                    }}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    placeholder="בחר מרצים..."
                                />
                            </div>

                            {/* Prerequisites Multi-Select with Search - Full Width */}
                            <div className="md:col-span-2 xl:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    דרישות קדם (ניתן לחפש ולבחור יותר מקורס אחד)
                                </label>
                                <Select
                                    options={courses
                                        .filter(course => course.courseNumber !== courseForm.courseNumber) // Don't include current course
                                        .map((course) => ({
                                            value: course.title,
                                            label: `${course.title} (${course.courseNumber})`,
                                            courseNumber: course.courseNumber
                                        }))}
                                    isMulti
                                    value={courseForm.prerequisites.map(prereq => ({
                                        value: prereq,
                                        label: prereq
                                    }))}
                                    onChange={(selectedOptions) => {
                                        setCourseForm({
                                            ...courseForm,
                                            prerequisites: selectedOptions ? selectedOptions.map((option) => option.value) : []
                                        });
                                    }}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    placeholder="חפש ובחר קורסים..."
                                    noOptionsMessage={() => "לא נמצאו קורסים"}
                                    isSearchable={true}
                                    isClearable={true}
                                    styles={{
                                        control: (provided) => ({
                                            ...provided,
                                            minHeight: '48px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '0.75rem',
                                            '&:hover': {
                                                borderColor: '#10b981'
                                            },
                                            '&:focus-within': {
                                                borderColor: '#10b981',
                                                boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)'
                                            }
                                        }),
                                        multiValue: (provided) => ({
                                            ...provided,
                                            backgroundColor: '#d1fae5',
                                            borderRadius: '0.5rem'
                                        }),
                                        multiValueLabel: (provided) => ({
                                            ...provided,
                                            color: '#065f46',
                                            fontWeight: '500'
                                        }),
                                        multiValueRemove: (provided) => ({
                                            ...provided,
                                            color: '#065f46',
                                            '&:hover': {
                                                backgroundColor: '#10b981',
                                                color: 'white'
                                            }
                                        })
                                    }}
                                />
                            </div>

                            {/* Course Description Textarea - Full Width */}
                            <div className="md:col-span-2 xl:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    תיאור הקורס
                                </label>
                                <textarea
                                    value={courseForm.description}
                                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all resize-none"
                                    placeholder="תיאור מפורט של הקורס..."
                                />
                            </div>

                            {/* Submit Button - Full Width */}
                            <div className="md:col-span-2 xl:col-span-3">
                                <button
                                    onClick={handleCourseSubmit}
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                                            מוסיף קורס...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <Save className="w-5 h-5 ml-2" />
                                            הוסף קורס
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Existing Courses List (1/4 width) */}
                <div className="xl:col-span-1 space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 sticky top-6 bg-white py-2 border-b border-gray-200">
                        קורסים קיימים ({courses.length})
                    </h3>

                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="חפש לפי שם קורס..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-10 py-2 border border-emerald-500 rounded-lg focus:outline-none focus:border-emerald-500 mb-3 text-right"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute left-3 inset-y-0 my-auto flex items-center text-gray-400 hover:text-gray-600"
                                aria-label="נקה חיפוש"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Courses List Container */}
                    <div className="space-y-3 min-h-[500px]">
                        {courses.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <BookOpen className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                                <p className="text-sm">אין קורסים במערכת עדיין</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {currentCourses.map((course) => (
                                    <div key={course._id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow group min-h-[100px] flex flex-col">
                                        <div className="flex items-start justify-between flex-1">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm mb-1 truncate" title={course.title}>
                                                    {course.title}
                                                </h4>
                                                <div className="space-y-1">
                                                    <div className="flex flex-wrap gap-1">
                                                        <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-xs font-medium">
                                                            {course.courseNumber}
                                                        </span>
                                                        <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs font-medium">
                                                            {course.credits} נק״ז
                                                        </span>
                                                    </div>
                                                    {Array.isArray(course.lecturers) && course.lecturers.length > 0 && (
                                                        <p className="text-xs text-gray-600 truncate">
                                                            מרצים: {course.lecturers.map((lecturer) => lecturer.name).join(", ")}
                                                        </p>
                                                    )}

                                                    {course.department && (
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {course.department}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Edit and Delete Buttons */}
                                            <div className="flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => handleEditCourse(course)}
                                                    className="text-blue-400 hover:text-blue-600 p-1 rounded"
                                                    title="ערוך קורס"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCourse(course._id)}
                                                    className="text-red-400 hover:text-red-600 p-1 rounded"
                                                    title="מחק קורס"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls - Fixed Position */}
                    {filteredCourses.length > coursesPerPage && (
                        <div className="flex items-center justify-center gap-2 mt-4 py-3 border-t border-gray-200">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-lg ${currentPage === 1
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                                    }`}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((pageNumber) =>
                                        Math.abs(pageNumber - currentPage) <= 2
                                    )
                                    .map((pageNumber) => (
                                        <button
                                            key={pageNumber}
                                            onClick={() => handlePageClick(pageNumber)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === pageNumber
                                                ? "bg-emerald-500 text-white shadow-md"
                                                : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                                                }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    ))}
                            </div>

                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-lg ${currentPage === totalPages
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                                    }`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseManagement;