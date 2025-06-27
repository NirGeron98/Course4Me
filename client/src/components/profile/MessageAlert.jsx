import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const MessageAlert = ({ message }) => {
  if (!message.text) return null;

  return (
    <div className={`mb-6 p-4 rounded-lg border-r-4 ${
      message.type === 'success'
        ? 'bg-green-50 border-green-500 text-green-700'
        : 'bg-red-50 border-red-500 text-red-700'
    }`}>
      <div className="flex items-center gap-2">
        {message.type === 'success' ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <AlertCircle className="w-5 h-5" />
        )}
        <span>{message.text}</span>
      </div>
    </div>
  );
};

export default MessageAlert;