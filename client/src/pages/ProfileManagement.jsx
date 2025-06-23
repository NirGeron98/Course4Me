import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  Eye, 
  EyeOff, 
  Shield, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit3
} from "lucide-react";

const ProfileManagement = () => {
  const [userProfile, setUserProfile] = useState({
    fullName: "",
    email: "",
    role: "",
    createdAt: "",
    academicInstitution: ""
  });
  
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState({
    profile: true,
    updateProfile: false,
    updatePassword: false
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [messages, setMessages] = useState({
    profile: { type: "", text: "" },
    password: { type: "", text: "" }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUserProfile(response.data);
        setEditedProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setMessages(prev => ({
          ...prev,
          profile: { type: "error", text: "שגיאה בטעינת הפרופיל" }
        }));
      } finally {
        setLoading(prev => ({ ...prev, profile: false }));
      }
    };

    fetchProfile();
  }, []);

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, updateProfile: true }));

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/user/profile",
        editedProfile,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserProfile(response.data);
      setIsEditing(false);
      setMessages(prev => ({
        ...prev,
        profile: { type: "success", text: "הפרופיל עודכן בהצלחה!" }
      }));

      // Update localStorage if name changed
      if (editedProfile.fullName !== userProfile.fullName) {
        localStorage.setItem("userFullName", editedProfile.fullName);
      }

    } catch (error) {
      console.error("Error updating profile:", error);
      setMessages(prev => ({
        ...prev,
        profile: { type: "error", text: error.response?.data?.message || "שגיאה בעדכון הפרופיל" }
      }));
    } finally {
      setLoading(prev => ({ ...prev, updateProfile: false }));
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessages(prev => ({
        ...prev,
        password: { type: "error", text: "הסיסמאות החדשות אינן תואמות" }
      }));
      return;
    }

    if (passwords.newPassword.length < 6) {
      setMessages(prev => ({
        ...prev,
        password: { type: "error", text: "הסיסמה החדשה חייבת להיות באורך של לפחות 6 תווים" }
      }));
      return;
    }

    setLoading(prev => ({ ...prev, updatePassword: true }));

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:5000/api/user/password",
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      setMessages(prev => ({
        ...prev,
        password: { type: "success", text: "הסיסמה עודכנה בהצלחה!" }
      }));

    } catch (error) {
      console.error("Error updating password:", error);
      setMessages(prev => ({
        ...prev,
        password: { type: "error", text: error.response?.data?.message || "שגיאה בעדכון הסיסמה" }
      }));
    } finally {
      setLoading(prev => ({ ...prev, updatePassword: false }));
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (messages.profile.text) {
      const timer = setTimeout(() => {
        setMessages(prev => ({ ...prev, profile: { type: "", text: "" } }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [messages.profile.text]);

  useEffect(() => {
    if (messages.password.text) {
      const timer = setTimeout(() => {
        setMessages(prev => ({ ...prev, password: { type: "", text: "" } }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [messages.password.text]);

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedProfile(userProfile); // Reset changes
    }
    setIsEditing(!isEditing);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("he-IL", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading.profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-blue-50/40 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-4" />
          <p className="text-gray-600">טוען פרטי פרופיל...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-blue-50/40" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className={`rounded-full p-4 ${userProfile.role === 'admin' ? 'bg-purple-500/20' : 'bg-white/20'}`}>
              {userProfile.role === 'admin' ? (
                <Shield className="w-8 h-8 text-white" />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">ניהול פרופיל</h1>
              <p className="text-emerald-100 text-lg">
                ברוך הבא, {userProfile.fullName}
              </p>
              {userProfile.role === 'admin' && (
                <span className="inline-flex items-center bg-purple-500/20 text-purple-100 px-3 py-1 rounded-full text-sm font-medium mt-2">
                  <Shield className="w-4 h-4 ml-2" />
                  מנהל מערכת
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Profile Information Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-emerald-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <User className="w-6 h-6 text-emerald-600" />
                פרטים אישיים
              </h2>
              <button
                onClick={handleEditToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isEditing
                    ? 'bg-gray-500 hover:bg-gray-600 text-white'
                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                {isEditing ? 'ביטול' : 'עריכה'}
              </button>
            </div>

            {/* Messages */}
            {messages.profile.text && (
              <div className={`mb-6 p-4 rounded-lg border-r-4 ${
                messages.profile.type === 'success'
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'bg-red-50 border-red-500 text-red-700'
              }`}>
                <div className="flex items-center gap-2">
                  {messages.profile.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{messages.profile.text}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שם מלא
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={isEditing ? editedProfile.fullName || "" : userProfile.fullName}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, fullName: e.target.value }))}
                    disabled={!isEditing}
                    className={`w-full pr-11 pl-4 py-3 border rounded-lg transition-all duration-300 ${
                      isEditing
                        ? 'border-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    placeholder="הכנס שם מלא"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  כתובת אימייל
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={isEditing ? editedProfile.email || "" : userProfile.email}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className={`w-full pr-11 pl-4 py-3 border rounded-lg transition-all duration-300 ${
                      isEditing
                        ? 'border-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                    placeholder="הכנס כתובת אימייל"
                  />
                </div>
              </div>

              {/* Academic Institution */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  מוסד אקדמי
                </label>
                <input
                  type="text"
                  value={isEditing ? editedProfile.academicInstitution || "" : userProfile.academicInstitution || "מכללת אפקה"}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, academicInstitution: e.target.value }))}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-300 ${
                    isEditing
                      ? 'border-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  placeholder="הכנס מוסד אקדמי"
                />
              </div>

              {/* Role & Join Date - Read Only */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תפקיד
                  </label>
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    {userProfile.role === 'admin' ? (
                      <>
                        <Shield className="w-5 h-5 text-purple-600" />
                        <span className="text-purple-700 font-medium">מנהל מערכת</span>
                      </>
                    ) : (
                      <>
                        <User className="w-5 h-5 text-emerald-600" />
                        <span className="text-emerald-700 font-medium">משתמש</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תאריך הצטרפות
                  </label>
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">
                      {userProfile.createdAt ? formatDate(userProfile.createdAt) : "לא זמין"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <button
                  type="submit"
                  disabled={loading.updateProfile}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {loading.updateProfile ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {loading.updateProfile ? "שומר..." : "שמור שינויים"}
                </button>
              )}
            </form>
          </div>

          {/* Password Change Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-emerald-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <Lock className="w-6 h-6 text-emerald-600" />
              שינוי סיסמה
            </h2>

            {/* Messages */}
            {messages.password.text && (
              <div className={`mb-6 p-4 rounded-lg border-r-4 ${
                messages.password.type === 'success'
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'bg-red-50 border-red-500 text-red-700'
              }`}>
                <div className="flex items-center gap-2">
                  {messages.password.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{messages.password.text}</span>
                </div>
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  סיסמה נוכחית
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full pr-11 pl-11 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="הכנס סיסמה נוכחית"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  סיסמה חדשה
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full pr-11 pl-11 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="הכנס סיסמה חדשה (לפחות 6 תווים)"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  אישור סיסמה חדשה
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full pr-11 pl-11 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="הכנס שוב את הסיסמה החדשה"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">דרישות סיסמה:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${passwords.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    לפחות 6 תווים
                  </li>
                  <li className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${passwords.newPassword === passwords.confirmPassword && passwords.newPassword ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    הסיסמאות תואמות
                  </li>
                </ul>
              </div>

              {/* Update Password Button */}
              <button
                type="submit"
                disabled={
                  loading.updatePassword ||
                  !passwords.currentPassword ||
                  !passwords.newPassword ||
                  !passwords.confirmPassword ||
                  passwords.newPassword !== passwords.confirmPassword ||
                  passwords.newPassword.length < 6
                }
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading.updatePassword ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
                {loading.updatePassword ? "מעדכן סיסמה..." : "עדכן סיסמה"}
              </button>
            </form>
          </div>
        </div>

        {/* Additional Security Info */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 border border-emerald-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-emerald-600" />
            מידע אבטחה
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-medium text-emerald-800 mb-2">חשבון מאובטח</h4>
              <p className="text-sm text-emerald-700">
                החשבון שלך מוגן בהצפנה מתקדמת ומערכת אימות בטוחה.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">הגנת פרטיות</h4>
              <p className="text-sm text-blue-700">
                המידע שלך נשמר בצורה מוצפנת ואינו נחשף לגורמים חיצוניים.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h4 className="font-medium text-yellow-800">טיפים לאבטחה</h4>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• השתמש בסיסמה חזקה וייחודית</li>
              <li>• אל תשתף את פרטי הכניסה שלך עם אחרים</li>
              <li>• התנתק מהמערכת כשאתה מסיים להשתמש בה</li>
              <li>• עדכן את הסיסמה שלך באופן קבוע</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagement;