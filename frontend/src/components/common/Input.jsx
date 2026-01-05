import React from "react";

export default function Input({
  label,
  icon,
  rightIcon,
  error,
  className = "",        // container
  inputClassName = "",   // input 👈
  ...props
}) {
  return (
    <div className="flex flex-col mb-4">

      {label && (
        <label className="mb-1 font-semibold text-sm text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <div
        className={`flex items-center rounded-xl px-4 py-3 border
          bg-[rgb(var(--color-input-bg))]
          text-[rgb(var(--color-input-text))]
          ${error ? "border-red-500" : "border-[rgb(var(--color-input-border))]"}
          focus-within:ring-2 focus-within:ring-[rgb(var(--color-primary))]
          transition
          ${className}
        `}
      >
        {icon && (
          <span className="mr-3 text-gray-400 flex items-center">
            {icon}
          </span>
        )}

        <input
          {...props}
          className={`flex-1 bg-transparent outline-none text-sm
            placeholder-[rgb(var(--color-input-placeholder))]
            ${inputClassName}
          `}
        />

        {rightIcon && (
          <span className="ml-3 text-gray-400 cursor-pointer flex items-center">
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
