import React from 'react';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import MessageAlert from './MessageAlert';

const PasswordForm = ({
  passwords,
  setPasswords,
  showPasswords,
  togglePasswordVisibility,
  handlePasswordUpdate,
  loading,
  messages
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-emerald-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Lock className="w-6 h-6 text-emerald-600" />
        שינוי סיסמה
      </h2>

      <MessageAlert message={messages.password} />

      <form onSubmit={handlePasswordUpdate} className="space-y-6">
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
  );
};

export default PasswordForm;