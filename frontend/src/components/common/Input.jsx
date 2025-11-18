import React from "react";

export default function Input({
  label,
  icon,
  rightIcon,
  error,
  ...props
}) {
  return (
    <div className="flex flex-col mb-4">
      {/* Label */}
      <label className="mb-1 font-semibold text-gray-700">
        {label}
      </label>

      {/* Input wrapper */}
      <div
        className={`flex items-center border rounded-full px-4 py-2 bg-white
        ${error ? "border-red-500" : "border-gray-300"}
        focus-within:ring-2 focus-within:ring-sky-300`}
      >
        {/* LEFT ICON */}
        {icon && (
          <span className="mr-3 text-gray-400 text-lg flex items-center">
            {icon}
          </span>
        )}

        {/* INPUT FIELD */}
        <input
          {...props}
          className="flex-1 outline-none bg-transparent text-sm"
        />

        {/* RIGHT ICON */}
        {rightIcon && (
          <span
            className="ml-3 text-gray-400 text-lg cursor-pointer flex items-center"
          >
            {rightIcon}
          </span>
        )}
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
