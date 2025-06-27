import React from 'react';
import { User, Shield } from 'lucide-react';

const ProfileHeader = ({ userProfile }) => {
  return (
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
  );
};

export default ProfileHeader;