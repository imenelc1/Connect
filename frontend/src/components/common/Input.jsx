import React from "react";

export default function Input({ 
  label, 
  icon, 
  rightIcon, 
  error, 
  className = "",   // <-- ajouter ici
  ...props 
}) {

  return (
    <div className="flex flex-col mb-4 appearance-none text-secondary">

      <label className="mb-1 font-semibold text-textc">
        {label}
      </label>

      {/* On applique les styles par défaut + les overrides */}
      <div
        className={`flex items-center border rounded-full px-4 py-2 
          bg-white text-black
          ${error ? "border-red-500" : "border-gray-300"}
          focus-within:ring-2 focus-within:ring-sky-300
          ${className}   // <-- Permet l’override
        `}
      >
        {icon && (
          <span className="mr-3 text-gray-300 text-lg flex items-center">
            {icon}
          </span>
        )}

        <input
          {...props}
          className="flex-1 outline-none bg-transparent text-sm"
        />

        {rightIcon && (
          <span className="ml-3 text-gray-400 text-lg cursor-pointer flex items-center">
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
