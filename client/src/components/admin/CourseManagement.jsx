import React, { useState, useEffect } from "react";
import axios from "axios";
import { BookOpen, Hash, Save, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import Select from "react-select";

const CourseManagement = ({ lecturers, onMessage, onError }) => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showPrerequisites, setShowPrerequisites] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredCourses, setFilteredCourses] = useState([]);
    const coursesPerPage = 5;

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

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showPrerequisites && !event.target.closest('.prerequisites-dropdown')) {
                setShowPrerequisites(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPrerequisites]);

    useEffect(() => {
        const filtered = courses.filter((course) =>
            course.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCourses(filtered);
        setCurrentPage(1);
    }, [searchTerm, courses]);


    const fetchCourses = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/courses");
            setCourses(response.data);
            setFilteredCourses(response.data);
        } catch (err) {
            console.error("Error fetching courses:", err);
            onError("שגיאה בטעינת הקורסים");
        }
    };

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
                response = await axios.put(`http://localhost:5000/api/courses/${editId}`, courseData, {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });
                onMessage("הקורס עודכן בהצלחה!");
            } else {
                response = await axios.post("http://localhost:5000/api/courses", courseData, {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });
                onMessage("קורס נוסף בהצלחה!");
            }

            if (response.status === 200 || response.status === 201) {
                resetForm();
                fetchCourses();
                setCurrentPage(1);
            }
        } catch (err) {
            console.error("Error creating course:", err);
            onError(err.response?.data?.message || "שגיאה בהוספת הקורס");
        } finally {
            setIsLoading(false);
        }
    };

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

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm("האם אתה בטוח שברצונך למחוק את הקורס?")) return;
        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(`http://localhost:5000/api/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) {
                onMessage("קורס נמחק בהצלחה!");
                fetchCourses();
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

    const totalPages = Math.ceil(courses.length / coursesPerPage);
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    const currentCourses = filteredCourses.slice(startIndex, endIndex);

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
                            {/* Course Number */}
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

                            {/* Course Title */}
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

                            {/* Credits */}
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

                            {/* Lecturer */}
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


                            {/* Prerequisites - spanning full width */}
                            <div className="md:col-span-2 xl:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    דרישות קדם
                                </label>
                                <div className="relative prerequisites-dropdown">
                                    <button
                                        type="button"
                                        onClick={() => setShowPrerequisites(!showPrerequisites)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 text-right bg-white flex justify-between items-center hover:bg-gray-50 transition-all"
                                    >
                                        <span className="text-gray-700">
                                            {courseForm.prerequisites.length === 0
                                                ? "בחר דרישות קדם..."
                                                : `נבחרו ${courseForm.prerequisites.length} קורסים`
                                            }
                                        </span>
                                        <svg
                                            className={`w-5 h-5 transition-transform ${showPrerequisites ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Dropdown with checkboxes */}
                                    {showPrerequisites && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                                            {courses.length === 0 ? (
                                                <div className="p-4 text-center text-gray-500">
                                                    אין קורסים זמינים עדיין
                                                </div>
                                            ) : (
                                                <div className="p-2">
                                                    {courses
                                                        .filter(course => course.courseNumber !== courseForm.courseNumber)
                                                        .map((course) => (
                                                            <label
                                                                key={course._id}
                                                                className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={courseForm.prerequisites.includes(course.title)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setCourseForm({
                                                                                ...courseForm,
                                                                                prerequisites: [...courseForm.prerequisites, course.title]
                                                                            });
                                                                        } else {
                                                                            setCourseForm({
                                                                                ...courseForm,
                                                                                prerequisites: courseForm.prerequisites.filter(p => p !== course.title)
                                                                            });
                                                                        }
                                                                    }}
                                                                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 ml-3"
                                                                />
                                                                <div className="flex-1 text-right">
                                                                    <div className="font-medium text-sm">{course.title}</div>
                                                                    <div className="text-xs text-gray-500">{course.courseNumber}</div>
                                                                </div>
                                                            </label>
                                                        ))
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Selected prerequisites display */}
                                {courseForm.prerequisites.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {courseForm.prerequisites.map((prerequisite, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800"
                                            >
                                                {prerequisite}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCourseForm({
                                                            ...courseForm,
                                                            prerequisites: courseForm.prerequisites.filter(p => p !== prerequisite)
                                                        });
                                                    }}
                                                    className="mr-2 hover:text-emerald-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Description - spanning full width */}
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

                            {/* Submit Button - spanning full width */}
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
                    <div className="space-y-3">
                        <div className="min-h-[500px]"> {/* Fixed height container */}
                            {courses.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <BookOpen className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                                    <p className="text-sm">אין קורסים במערכת עדיין</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {currentCourses.map((course) => (
                                        <div key={course._id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow group">
                                            <div className="flex items-start justify-between">
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

                        {/* Pagination Controls */}
                        {courses.length > coursesPerPage && (
                            <div className="flex items-center justify-center gap-2 mt-4 py-3 border-t border-gray-200">
                                {/* Previous Button */}
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg transition-all duration-200 ${currentPage === 1
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                                        }`}
                                    title="עמוד קודם"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>

                                {/* Page Numbers */}
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                                        <button
                                            key={pageNumber}
                                            onClick={() => handlePageClick(pageNumber)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === pageNumber
                                                ? 'bg-emerald-500 text-white shadow-md'
                                                : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                                                }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    ))}
                                </div>

                                {/* Next Button */}
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg transition-all duration-200 ${currentPage === totalPages
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                                        }`}
                                    title="עמוד הבא"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseManagement;