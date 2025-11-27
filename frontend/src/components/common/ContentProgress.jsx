import React from "react";

export default function ContentProgress({ value = 0 }) {
  return (
    <div className="mt-4 w-full">
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${value}%` }}
        ></div>
      </div>

      <p className="text-sm text-muted mt-1">{value}% completed</p>
    </div>
  );
}
