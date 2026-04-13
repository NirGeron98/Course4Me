import React from 'react';
import { User } from 'lucide-react';

const WelcomeHeader = ({ userName }) => {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-full p-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">שלום, {userName}! 👋</h1>
              <p className="text-emerald-100 text-lg">איזה כיף שחזרת!</p>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 rounded-card-lg p-4 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-2xl font-bold">{new Date().toLocaleDateString('he-IL')}</div>
                <div className="text-emerald-200 text-sm">היום</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeader;