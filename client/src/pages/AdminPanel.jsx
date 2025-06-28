import React, { useState, useEffect } from "react";
import axios from "axios";
import CourseManagement from "../components/admin/CourseManagement";
import LecturerManagement from "../components/admin/LecturerManagement";
import DepartmentManagement from "../components/admin/DepartmentManagement";
import { AlertCircle, BookOpen, Users, Building, CheckCircle, X } from "lucide-react";

const AdminPanel = ({ user }) => {
  const [activeTab, setActiveTab] = useState("courses");
  const [lecturers, setLecturers] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isAdmin = user?.user?.role === "admin";

  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/lecturers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLecturers(response.data);
      } catch (err) {
        console.error("Error fetching lecturers:", err);
        setLecturers([]);
      }
    };
    fetchLecturers();
  }, []);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">אין הרשאה</h1>
          <p className="text-gray-600">דף זה מיועד למנהלי המערכת בלבד</p>
        </div>
      </div>
    );
  }

  const handleMessage = (msg) => {
    setMessage(msg);
    setError("");
    setTimeout(() => setMessage(""), 5000);
  };

  const handleError = (err) => {
    setError(err);
    setMessage("");
    setTimeout(() => setError(""), 7000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100" dir="rtl">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">פאנל ניהול מערכת</h1>
          <p className="text-emerald-100">ניהול קורסים ומרצים במערכת</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("courses")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === "courses"
                ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50"
                : "text-gray-600 hover:text-emerald-600"
              }`}
            >
              <BookOpen className="w-5 h-5 inline-block ml-2" />
              ניהול קורסים
            </button>
            <button
              onClick={() => setActiveTab("lecturers")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === "lecturers"
                ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50"
                : "text-gray-600 hover:text-emerald-600"
              }`}
            >
              <Users className="w-5 h-5 inline-block ml-2" />
              ניהול מרצים
            </button>
            <button
              onClick={() => setActiveTab("departments")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === "departments"
                ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50"
                : "text-gray-600 hover:text-emerald-600"
              }`}
            >
              <Building className="w-5 h-5 inline-block ml-2" />
              ניהול מחלקות
            </button>
          </div>

          {message && (
            <div className="m-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center animate-fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-500 ml-3" />
              <span className="text-emerald-700 font-medium">{message}</span>
              <button
                onClick={() => setMessage("")}
                className="mr-auto text-emerald-400 hover:text-emerald-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 ml-3" />
              <span className="text-red-700 font-medium">{error}</span>
              <button
                onClick={() => setError("")}
                className="mr-auto text-red-400 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeTab === "courses" && (
            <CourseManagement
              lecturers={lecturers}
              onMessage={handleMessage}
              onError={handleError}
            />
          )}

          {activeTab === "lecturers" && (
            <LecturerManagement
              onMessage={handleMessage}
              onError={handleError}
              onLecturersUpdate={setLecturers}
            />
          )}

          {activeTab === "departments" && (
            <DepartmentManagement
              onMessage={handleMessage}
              onError={handleError}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
