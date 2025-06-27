import React from 'react';
import { User, Mail, Shield, Calendar, Save, Edit3, Loader2 } from 'lucide-react';
import MessageAlert from './MessageAlert';

const ProfileForm = ({
  userProfile,
  editedProfile,
  setEditedProfile,
  isEditing,
  setIsEditing,
  handleProfileUpdate,
  loading,
  messages,
  formatDate
}) => {
  const handleEditToggle = () => {
    if (isEditing) {
      setEditedProfile(userProfile);
    }
    setIsEditing(!isEditing);
  };

  return (
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

      <MessageAlert message={messages.profile} />

      <form onSubmit={handleProfileUpdate} className="space-y-6">
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
  );
};

export default ProfileForm;