
import React from "react";

export default function Input({ label, icon, rightIcon, error, ...props }) {
  return (
    <div className="flex flex-col mb-4 appearance-none text-secondary">
      {/* ---------------------- Label du champ ---------------------- */}
      <label className="mb-1 font-semibold text-grayc">
        {label}
      </label>

      {/* ---------------------- Conteneur de l'input ---------------------- 
          - border change en rouge si error = true
          - focus-within = active le ring lorsque l’input est focus
      */}
      <div
        className={`flex items-center border rounded-full px-4 py-2 bg-white text-black ${
          error ? "border-red-500" : "border-gray-300"
        } focus-within:ring-2 focus-within:ring-sky-300`}
      >
        {/* Icône à gauche */}
        {icon && (
          <span className="mr-3 text-gray-300 text-lg flex items-center">
            {icon}
          </span>
        )}

        {/* Champ input principal */}
        <input
          {...props}
          className="flex-1 outline-none bg-transparent text-sm"
        />

        {/*  Icône à droite (afficher/masquer mot de passe) */}
        {rightIcon && (
          <span className="ml-3 text-gray-400 text-lg cursor-pointer flex items-center">
            {rightIcon}
          </span>
        )}
      </div>

      {/* ---------------------- Texte d'erreur si présent ---------------------- */}
      {error && (
        <p className="text-red-500 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
