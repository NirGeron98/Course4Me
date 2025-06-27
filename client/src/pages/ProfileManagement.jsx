import React, { useState, useEffect } from "react";
import axios from "axios";
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileForm from '../components/profile/ProfileForm';
import PasswordForm from '../components/profile/PasswordForm';
import SecurityInfo from '../components/profile/SecurityInfo';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Mock data for development when API is not available
const mockUserProfile = {
  fullName: "יוחנן כהן",
  email: "yohanan@example.com",
  role: "user",
  createdAt: "2024-01-15T10:30:00Z",
  academicInstitution: "מכללת אפקה"
};

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
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          console.warn("No token found, using mock data");
          setUserProfile(mockUserProfile);
          setEditedProfile(mockUserProfile);
          setUseMockData(true);
          setMessages(prev => ({
            ...prev,
            profile: { type: "error", text: "לא נמצא token - עובד עם נתונים לדוגמה" }
          }));
          return;
        }

        const response = await axios.get("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        });
        
        setUserProfile(response.data);
        setEditedProfile(response.data);
        setUseMockData(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        
        // Use mock data when API fails
        setUserProfile(mockUserProfile);
        setEditedProfile(mockUserProfile);
        setUseMockData(true);
        
        let errorMessage = "שגיאה בטעינת הפרופיל - עובד עם נתונים לדוגמה";
        
        if (error.code === 'ECONNABORTED') {
          errorMessage = "זמן תגובה ארוך מדי - עובד עם נתונים לדוגמה";
        } else if (error.response?.status === 404) {
          errorMessage = "ה-API לא נמצא - עובד עם נתונים לדוגמה";
        } else if (error.response?.status === 401) {
          errorMessage = "אין הרשאה - עובד עם נתונים לדוגמה";
        }
        
        setMessages(prev => ({
          ...prev,
          profile: { type: "error", text: errorMessage }
        }));
      } finally {
        setLoading(prev => ({ ...prev, profile: false }));
      }
    };

    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, updateProfile: true }));

    try {
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUserProfile(editedProfile);
        setIsEditing(false);
        setMessages(prev => ({
          ...prev,
          profile: { type: "success", text: "הפרופיל עודכן בהצלחה! (מצב פיתוח)" }
        }));
      } else {
        const token = localStorage.getItem("token");
        const response = await axios.put(
          "http://localhost:5000/api/user/profile",
          editedProfile,
          { 
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          }
        );

        setUserProfile(response.data);
        setIsEditing(false);
        setMessages(prev => ({
          ...prev,
          profile: { type: "success", text: "הפרופיל עודכן בהצלחה!" }
        }));
      }

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
      if (useMockData) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setMessages(prev => ({
          ...prev,
          password: { type: "success", text: "הסיסמה עודכנה בהצלחה! (מצב פיתוח)" }
        }));
      } else {
        const token = localStorage.getItem("token");
        await axios.put(
          "http://localhost:5000/api/user/password",
          {
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword
          },
          { 
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          }
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
      }

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("he-IL", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading.profile) {
    return <LoadingSpinner message="טוען פרטי פרופיל..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-blue-50/40" dir="rtl">
      <ProfileHeader userProfile={userProfile} />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {useMockData && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-yellow-800 font-medium">מצב פיתוח - עובד עם נתונים לדוגמה</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              השרת לא זמין או ה-API endpoint לא קיים. המערכת עובדת עם נתונים מקומיים.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProfileForm
            userProfile={userProfile}
            editedProfile={editedProfile}
            setEditedProfile={setEditedProfile}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleProfileUpdate={handleProfileUpdate}
            loading={loading}
            messages={messages}
            formatDate={formatDate}
          />
          
          <PasswordForm
            passwords={passwords}
            setPasswords={setPasswords}
            showPasswords={showPasswords}
            togglePasswordVisibility={togglePasswordVisibility}
            handlePasswordUpdate={handlePasswordUpdate}
            loading={loading}
            messages={messages}
          />
        </div>

        <SecurityInfo />
      </div>
    </div>
  );
};

export default ProfileManagement;