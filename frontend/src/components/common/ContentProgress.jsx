import React from "react";
import "../../styles/index.css"

export default function ContentProgress({ value = 0, status=" " }) {
  return (
    <div className="mt-4 w-full">
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-grad-1 rounded-full transition-all"
          style={{ width: `${value}%` }}
        ></div>
      </div>

     <div className="flex justify-between mt-1 text-xs text-textc">
        <span>Completed {value} %</span>
        <span>{status}</span>
      </div>
    </div>
  );
}