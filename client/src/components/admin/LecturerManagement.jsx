import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Building,
  Mail,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import EntityForm from "../common/EntityForm";

const LecturerManagement = ({ onMessage, onError, onLecturersUpdate }) => {
  const [lecturers, setLecturers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLecturers, setFilteredLecturers] = useState([]);

  const lecturersPerPage = 7;

  const [lecturerForm, setLecturerForm] = useState({
    name: "",
    email: "",
    department: "",
  });

  useEffect(() => {
    fetchLecturers();
  }, []);

  useEffect(() => {
    const filtered = lecturers.filter((lecturer) =>
      lecturer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLecturers(filtered);
    setCurrentPage(1);
  }, [searchTerm, lecturers]);

  const fetchLecturers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/lecturers", {
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
    setLecturerForm({ name: "", email: "", department: "" });
    setIsEditing(false);
    setEditId(null);
  };

  const handleLecturerSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (isEditing) {
        await axios.put(
          `http://localhost:5000/api/lecturers/${editId}`,
          lecturerForm,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        onMessage("מרצה עודכן בהצלחה!");
      } else {
        await axios.post("http://localhost:5000/api/lecturers", lecturerForm, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        onMessage("מרצה נוסף בהצלחה!");
      }

      resetForm();
      fetchLecturers();
      setCurrentPage(1);
    } catch (err) {
      console.error("Error saving lecturer:", err);
      onError(err.response?.data?.message || "שגיאה בשמירת המרצה");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLecturer = (lecturer) => {
    setLecturerForm({
      name: lecturer.name,
      email: lecturer.email,
      department: lecturer.department,
    });
    setEditId(lecturer._id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteLecturer = async (id) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את המרצה?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/lecturers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onMessage("מרצה נמחק בהצלחה!");
      fetchLecturers();
    } catch (err) {
      console.error("Error deleting lecturer:", err);
      onError(err.response?.data?.message || "שגיאה במחיקת המרצה");
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

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 max-w-8xl mx-auto">
        <div className="xl:col-span-3">
          <EntityForm
            title={isEditing ? "עריכת מרצה" : "הוספת מרצה חדש"}
            fields={[
              {
                name: "name",
                label: "שם המרצה *",
                placeholder: "ד״ר יוסי כהן",
                required: true,
                icon: <User />,
              },
              {
                name: "email",
                label: "אימייל *",
                type: "email",
                placeholder: "lecturer@afeka.ac.il",
                required: true,
                icon: <Mail />,
              },
              {
                name: "department",
                label: "מחלקה *",
                placeholder: "מדעי המחשב",
                required: true,
                icon: <Building />,
                fullWidth: true,
              },
            ]}
            formState={lecturerForm}
            setFormState={setLecturerForm}
            onSubmit={handleLecturerSubmit}
            isLoading={isLoading}
            isEditing={isEditing}
          />
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
                className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4
                      className="font-semibold text-sm mb-1 truncate"
                      title={lecturer.name}
                    >
                      {lecturer.name}
                    </h4>
                    <p
                      className="text-xs text-gray-600 truncate"
                      title={lecturer.email}
                    >
                      {lecturer.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {lecturer.department}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => handleEditLecturer(lecturer)}
                      className="text-blue-400 hover:text-blue-600 p-1"
                      title="ערוך מרצה"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteLecturer(lecturer._id)}
                      className="text-red-400 hover:text-red-600 p-1"
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
                className={`p-2 rounded-lg ${
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageClick(pageNumber)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium ${
                        currentPage === pageNumber
                          ? "bg-emerald-500 text-white shadow-md"
                          : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${
                  currentPage === totalPages
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

export default LecturerManagement;
