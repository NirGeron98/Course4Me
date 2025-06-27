import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = "טוען..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-blue-50/40 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;