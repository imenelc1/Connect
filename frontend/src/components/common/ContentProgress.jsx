import React from "react";

export default function ContentProgress({ value, color }) {
  return (
    <div className="mt-4 w-full">
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${color}`}
          style={{ width: `${value}%` }}
        ></div>
      </div>

      <p className="text-sm text-muted mt-1">{value}% completed</p>
    </div>
  );
}
