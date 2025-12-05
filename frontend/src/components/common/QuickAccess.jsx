// src/components/common/QuickAccess.jsx
import React from "react";

const QuickAccess = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Access</h2>
      
      <div className="space-y-3">
        <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-grad-2 rounded-xl transition-colors">
          My students
        </button>
        <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-grad-2 rounded-xl transition-colors">
          My community
        </button>
        <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-grad-2 rounded-xl transition-colors">
          Settings
        </button>
        <button className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
          Log Out
        </button>
      </div>
    </div>
  );
};

export default QuickAccess;