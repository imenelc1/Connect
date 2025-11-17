import React from "react";

const Input = ({ label, icon, rightIcon, error, ...props }) => (
  <div className="flex flex-col mb-4">
    <label className="mb-1 font-semibold text-gray-700">{label}</label>

    <div
      className={`flex items-center border rounded-full px-3 py-2 bg-white 
      ${error ? "border-red-500" : "border-gray-300"}
      focus-within:ring-2 focus-within:ring-sky-300`}
    >
      {/* ICÔNE À GAUCHE */}
      {icon && <span className="mr-3 text-gray-400 text-base">{icon}</span>}

      {/* INPUT */}
      <input
        {...props}
        className="flex-1 outline-none bg-transparent text-sm"
      />

      {/* ICÔNE À DROITE (yeux mdp) */}
      {rightIcon && (
        <span className="ml-3 text-gray-400 cursor-pointer">{rightIcon}</span>
      )}
    </div>

    {/* MESSAGE D'ERREUR */}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default Input;
