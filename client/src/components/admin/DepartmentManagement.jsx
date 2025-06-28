import React, { useState, useEffect } from "react";
import axios from "axios";
import { Building, Trash2, Edit, Save, Plus, X } from "lucide-react";

const DepartmentManagement = ({ onMessage, onError }) => {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/departments`);
      setDepartments(res.data);
    } catch (err) {
      onError("שגיאה בטעינת המחלקות");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", code: "", description: "" });
    setEditId(null);
    setIsEditing(false);
  };

  const generateCodeFromName = (name) => {
    // Generate code from name - remove spaces, hebrew to english approximation
    const hebrewToEnglish = {
      'מדעי': 'cs',
      'מחשב': 'computer',
      'הנדסת': 'eng',
      'הנדסה': 'eng',
      'תוכנה': 'software',
      'חשמל': 'electricity',
      'מכנית': 'mechanical',
      'ביורפואית': 'biomedical',
      'תעשייה': 'industrial',
      'ניהול': 'management',
      'נתונים': 'data',
      'אנגלית': 'english',
      'כללי': 'general'
    };

    let code = name.toLowerCase();
    
    // Replace known Hebrew words
    Object.keys(hebrewToEnglish).forEach(hebrew => {
      if (code.includes(hebrew.toLowerCase())) {
        code = hebrewToEnglish[hebrew];
        return;
      }
    });

    // If no match found, create a simple code
    if (code === name.toLowerCase()) {
      code = name.replace(/\s+/g, '').toLowerCase().slice(0, 8);
    }

    return code;
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      // Auto-generate code only if not editing and code is empty
      code: !isEditing && !prev.code ? generateCodeFromName(name) : prev.code
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      onError("יש למלא שם וקוד מחלקה");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      setLoading(true);

      if (isEditing) {
        await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/api/departments/${editId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        onMessage("מחלקה עודכנה בהצלחה!");
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/departments`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        onMessage("מחלקה נוספה בהצלחה!");
      }

      resetForm();
      fetchDepartments();
    } catch (err) {
      onError(err.response?.data?.message || "שגיאה בשמירת המחלקה");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (dept) => {
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || ""
    });
    setEditId(dept._id);
    setIsEditing(true);
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("האם למחוק את המחלקה הזו?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onMessage("המחלקה נמחקה בהצלחה!");
      fetchDepartments();
    } catch (err) {
      onError("שגיאה במחיקת המחלקה");
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Building className="w-8 h-8 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            ניהול מחלקות אקדמיות
          </h2>
        </div>

        {/* Add/Edit Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {isEditing ? "עריכת מחלקה" : "הוספת מחלקה חדשה"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Department Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שם המחלקה *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 text-right"
                  placeholder="לדוגמה: מדעי המחשב"
                  required
                />
              </div>

              {/* Department Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  קוד המחלקה * 
                  <span className="text-xs text-gray-500">(באנגלית)</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
                  placeholder="לדוגמה: cs"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                תיאור (אופציונלי)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 text-right"
                placeholder="תיאור קצר של המחלקה..."
                rows="2"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition disabled:opacity-50"
              >
                {loading ? "שומר..." : (
                  <>
                    {isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isEditing ? "עדכן מחלקה" : "הוסף מחלקה"}
                  </>
                )}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
                >
                  <X className="w-4 h-4" />
                  ביטול
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Departments List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            מחלקות קיימות ({departments.length})
          </h3>
          
          {departments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              אין מחלקות במערכת
            </div>
          ) : (
            <div className="space-y-3">
              {departments.map((dept) => (
                <div
                  key={dept._id}
                  className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-800">{dept.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                            {dept.code}
                          </span>
                          {dept.description && (
                            <span className="text-sm text-gray-600">
                              {dept.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(dept)}
                      className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="ערוך מחלקה"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept._id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="מחק מחלקה"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagement;