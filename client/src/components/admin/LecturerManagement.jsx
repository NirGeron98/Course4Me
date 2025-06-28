import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, Mail, Trash2, ChevronLeft, ChevronRight, X, ChevronDown } from "lucide-react";
import Popup from "../common/Popup";

const LecturerManagement = ({ onMessage, onError, onLecturersUpdate }) => {
  const [lecturers, setLecturers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLecturers, setFilteredLecturers] = useState([]);
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lecturerToDelete, setLecturerToDelete] = useState(null);
  const [, setPopupType] = useState("info");

  const lecturersPerPage = 6;

  const [lecturerForm, setLecturerForm] = useState({
    name: "",
    email: "",
    departments: [], // Changed to array for multi-select
  });

  useEffect(() => {
    fetchLecturers();
    fetchDepartments();
  }, []);

  useEffect(() => {
    const filtered = lecturers.filter((lecturer) =>
      lecturer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLecturers(filtered);
    setCurrentPage(1);
  }, [searchTerm, lecturers]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/departments`);
      setDepartments(response.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
      console.error("Error details:", err.response?.data);
      
      // If departments endpoint fails, show a user-friendly message
      if (err.response?.status === 500) {
        onError("שגיאה בטעינת המחלקות מהשרת. נסה לרענן את הדף.");
      } else {
        onError("שגיאה בטעינת המחלקות");
      }
      
      // Set empty array so the component doesn't crash
      setDepartments([]);
    }
  };

  const fetchLecturers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/lecturers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLecturers(response.data);
      setFilteredLecturers(response.data);
      if (onLecturersUpdate) onLecturersUpdate(response.data);
    } catch (err) {
      console.error("Error fetching lecturers:", err);
      setLecturers([]);
      setFilteredLecturers([]);
      if (onLecturersUpdate) onLecturersUpdate([]);
    }
  };

  const resetForm = () => {
    setLecturerForm({ name: "", email: "", departments: [] });
    setIsEditing(false);
    setEditId(null);
    setIsDepartmentDropdownOpen(false);
  };

  const handleDepartmentToggle = (departmentId) => {
    setLecturerForm(prev => ({
      ...prev,
      departments: prev.departments.includes(departmentId)
        ? prev.departments.filter(id => id !== departmentId)
        : [...prev.departments, departmentId]
    }));
  };

  const getSelectedDepartmentNames = () => {
    return lecturerForm.departments
      .map(id => departments.find(dept => dept._id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  const handleLecturerSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (lecturerForm.departments.length === 0) {
      onError("יש לבחור לפחות מחלקה אחת");
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (isEditing) {
        await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/api/lecturers/${editId}`,
          lecturerForm,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setPopupType("success");
        onMessage("מרצה עודכן בהצלחה!");
      } else {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/lecturers`, lecturerForm, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setPopupType("success");
        onMessage("מרצה נוסף בהצלחה!");
      }

      resetForm();
      fetchLecturers();
      setCurrentPage(1);
    } catch (err) {
      console.error("Error saving lecturer:", err);
      setPopupType("error");
      onError(err.response?.data?.message || "שגיאה בשמירת המרצה");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLecturer = (lecturer) => {
    let selectedDepartments = [];
    
    // Handle new format (departments array)
    if (lecturer.departments && lecturer.departments.length > 0) {
      selectedDepartments = lecturer.departments.map(dept => 
        typeof dept === 'object' ? dept._id : dept
      );
    }
    // Handle old format (department string) - could be comma-separated
    else if (lecturer.department && lecturer.department.trim() !== '') {
      // Split by comma and find matching departments
      const departmentNames = lecturer.department.split(',').map(name => name.trim());
      
      console.log('Looking for departments:', departmentNames);
      console.log('Available departments:', departments.map(d => `"${d.name}"`));
      
      departmentNames.forEach(deptName => {
        // Create variations of the department name to try
        const searchVariations = [
          deptName.trim(),
          deptName.trim().replace(/וניהול/g, '').trim(), // Remove "וניהול"
          deptName.trim().replace(/הנדסת /g, 'הנדסה '), // Replace "הנדסת" with "הנדסה"
          deptName.trim().replace(/הנדסה /g, 'הנדסת '), // Replace "הנדסה" with "הנדסת"
          deptName.trim().replace(/מדעי /g, 'מדע '), // Replace "מדעי" with "מדע"
          deptName.trim().replace(/מדע /g, 'מדעי ') // Replace "מדע" with "מדעי"
        ];
        
        let matchingDept = null;
        
        // Try each variation
        for (const variation of searchVariations) {
          matchingDept = departments.find(dept => 
            dept.name.trim().toLowerCase() === variation.toLowerCase()
          );
          if (matchingDept) {
            console.log(`Found exact match: "${deptName}" -> "${matchingDept.name}" (using variation: "${variation}")`);
            break;
          }
        }
        
        // If no exact match, try partial match with original name
        if (!matchingDept) {
          matchingDept = departments.find(dept => {
            const deptNameLower = dept.name.trim().toLowerCase();
            const searchLower = deptName.trim().toLowerCase();
            return deptNameLower.includes(searchLower) || searchLower.includes(deptNameLower);
          });
          if (matchingDept) {
            console.log(`Found partial match: "${deptName}" -> "${matchingDept.name}"`);
          }
        }
        
        if (matchingDept && !selectedDepartments.includes(matchingDept._id)) {
          selectedDepartments.push(matchingDept._id);
        } else if (!matchingDept) {
          console.log(`No match found for: "${deptName}"`);
        }
      });
    }
    
    setLecturerForm({
      name: lecturer.name,
      email: lecturer.email,
      departments: selectedDepartments,
    });
    setEditId(lecturer._id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDeleteModal = (lecturer) => {
    setLecturerToDelete(lecturer);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setLecturerToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteLecturer = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/lecturers/${lecturerToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPopupType("success");
      onMessage("מרצה נמחק בהצלחה!");
      fetchLecturers();
      closeDeleteModal();
    } catch (err) {
      console.error("Error deleting lecturer:", err);
      setPopupType("error");
      onError(err.response?.data?.message || "שגיאה במחיקת המרצה");
      closeDeleteModal();
    }
  };

  const totalPages = Math.ceil(filteredLecturers.length / lecturersPerPage);
  const startIndex = (currentPage - 1) * lecturersPerPage;
  const endIndex = startIndex + lecturersPerPage;
  const currentLecturers = filteredLecturers.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Custom MultiSelect Component
  const DepartmentMultiSelect = () => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        מחלקות *
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)}
          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 text-right bg-white flex items-center justify-between"
        >
          <span className="truncate text-right">
            {lecturerForm.departments.length === 0 
              ? "בחר מחלקות..." 
              : getSelectedDepartmentNames()
            }
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isDepartmentDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isDepartmentDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {departments.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 text-right">
                <div>אין מחלקות זמינות</div>
                <div className="text-xs mt-1">
                  ודא שקיימות מחלקות במערכת או רענן את הדף
                </div>
              </div>
            ) : (
              departments.map((department) => (
                <label
                  key={department._id}
                  className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={lecturerForm.departments.includes(department._id)}
                    onChange={() => handleDepartmentToggle(department._id)}
                    className="mr-3"
                  />
                  <div className="flex-1 text-right">
                    <div className="font-medium">{department.name}</div>
                  </div>
                </label>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Selected departments tags */}
      {lecturerForm.departments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {lecturerForm.departments.map(departmentId => {
            const dept = departments.find(d => d._id === departmentId);
            return dept ? (
              <span
                key={departmentId}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
              >
                {dept.name}
                <button
                  type="button"
                  onClick={() => handleDepartmentToggle(departmentId)}
                  className="mr-1 inline-flex items-center justify-center w-4 h-4 text-emerald-400 hover:text-emerald-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 max-w-8xl mx-auto">
        <div className="xl:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-right">
              {isEditing ? "עריכת מרצה" : "הוספת מרצה חדש"}
            </h2>
            
            <form onSubmit={handleLecturerSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    שם המרצה *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={lecturerForm.name}
                      onChange={(e) => setLecturerForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 text-right"
                      placeholder="ד״ר יוסי כהן"
                    />
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    אימייל *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={lecturerForm.email}
                      onChange={(e) => setLecturerForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 text-right"
                      placeholder="lecturer@afeka.ac.il"
                    />
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Department Multi-Select */}
              <DepartmentMultiSelect />

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "שומר..." : isEditing ? "עדכן מרצה" : "הוסף מרצה"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="xl:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-gray-800 sticky top-6 bg-white py-2 border-b border-gray-200">
            מרצים קיימים ({lecturers.length})
          </h3>

          <div className="relative">
            <input
              type="text"
              placeholder="חפש לפי שם מרצה..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 mb-3 text-right"
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

          <div className="space-y-3 min-h-[500px]">
            {currentLecturers.map((lecturer) => (
              <div
                key={lecturer._id}
                className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow group min-h-[100px] flex flex-col"
              >
                <div className="flex items-start justify-between flex-1">
                  <div className="flex-1 min-w-0">
                    <h4
                      className="font-semibold text-sm mb-1 truncate"
                      title={lecturer.name}
                    >
                      {lecturer.name}
                    </h4>
                    <p
                      className="text-xs text-gray-600 truncate mb-2"
                      title={lecturer.email}
                    >
                      {lecturer.email}
                    </p>
                    {/* Display departments with better styling */}
                    <div className="mt-auto">
                      {lecturer.departments && lecturer.departments.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {lecturer.departments.slice(0, 2).map((dept, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full"
                            >
                              {typeof dept === 'object' ? dept.name : dept}
                            </span>
                          ))}
                          {lecturer.departments.length > 2 && (
                            <span 
                              className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full cursor-help"
                              title={lecturer.departments.slice(2).map(dept => 
                                typeof dept === 'object' ? dept.name : dept
                              ).join(', ')}
                            >
                              +{lecturer.departments.length - 2} נוספות
                            </span>
                          )}
                        </div>
                      ) : lecturer.department ? (
                        <div className="flex flex-wrap gap-1">
                          {lecturer.department.split(',').slice(0, 2).map((deptName, index) => (
                            <span 
                              key={index}
                              className="inline-block px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full"
                            >
                              {deptName.trim()}
                            </span>
                          ))}
                          {lecturer.department.split(',').length > 2 && (
                            <span 
                              className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full cursor-help"
                              title={lecturer.department.split(',').slice(2).map(name => name.trim()).join(', ')}
                            >
                              +{lecturer.department.split(',').length - 2} נוספות
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">אין מחלקות</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-all ml-2">
                    <button
                      onClick={() => handleEditLecturer(lecturer)}
                      className="text-blue-400 hover:text-blue-600 p-1 flex items-center justify-center w-6 h-6"
                      title="ערוך מרצה"
                    >
                      <span className="text-sm">✏️</span>
                    </button>
                    <button
                      onClick={() => openDeleteModal(lecturer)}
                      className="text-red-400 hover:text-red-600 p-1 flex items-center justify-center w-6 h-6"
                      title="מחק מרצה"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredLecturers.length > lecturersPerPage && (
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

      {/* Delete Confirmation Modal */}
      <Popup
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteLecturer}
        title="אישור מחיקה"
        message="האם אתה בטוח שברצונך למחוק את המרצה הזה? פעולה זו לא ניתנת לשחזור."
        confirmText="מחק מרצה"
        cancelText="ביטול"
        type="error"
      />
    </div>
  );
};

export default LecturerManagement;