import React from 'react';
import { Shield, AlertCircle } from 'lucide-react';

const SecurityInfo = () => {
  return (
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
  );
};

export default SecurityInfo;