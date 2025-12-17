import React from "react";

const ProgressBar = ({ value = 50, title = "Progression" }) => {
  return (
    <div className="w-full group relative">
      {/* Titre */}
      <p className="text-xl font-semibold mb-2 text-textc">{title}</p>

      {/* Barre */}
      <div className="w-full bg-gray-300 rounded-full h-4 relative cursor-pointer">
        <div
          className="h-4 rounded-full transition-all duration-500 bg-blue"
          style={{ width: `${value}%` }}
        ></div>

        {/* Value visible seulement au hover */}
        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-muted text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {value}%
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
