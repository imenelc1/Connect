import React from "react";

export default function ProgressBar({ progress = 0 }) {
  return (
    <div className="w-full h-2 bg-[#DCE9FF] rounded-full overflow-hidden">
      <div
        className="h-2 rounded-full bg-gradient-to-r from-[#4f9dde] to-[#9bc5f3] transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
