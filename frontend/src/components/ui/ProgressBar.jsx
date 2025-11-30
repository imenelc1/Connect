import React from "react";

const ProgressBar = ({ value = 50, title = "Progression" }) => {
  return (
    <div className="w-full">
      {/* Titre */}
      <p className="text-xl font-semibold mb-2 text-textc">{title}</p>

      {/* Barre */}
      <div className="w-full bg-gray-300 rounded-full h-4 relative">
        <div
          className="h-4 rounded-full transition-all duration-300 bg-blue"
          style={{ width: `${value}%` }}
        ></div>

        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded">
          {value}%
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
