import React from "react";

//Un composant Input reutilisable
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
      {/* Label (affiché uniquement si fourni) */}
      {label && (
        <label className="mb-1 font-semibold text-sm text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      {/* Conteneur principal de l'input */}
      <div
        className={`flex items-center rounded-xl px-4 py-3 border
          bg-[rgb(var(--color-input-bg))]
          text-[rgb(var(--color-input-text))]
          ${error ? "border-red" : "border-[rgb(var(--color-input-border))]"}
          focus-within:ring-2 focus-within:ring-[rgb(var(--color-primary))]
          transition
          ${className} 
        `}
      >
        {/* Icône à gauche */}
        {icon && (
          <span className="mr-3 text-gray-400 flex items-center">
            {icon}
          </span>
        )}
        {/* Champ input natif */}
        <input
          {...props}
          className={`flex-1 bg-transparent outline-none text-sm
            placeholder-[rgb(var(--color-input-placeholder))]
            ${inputClassName}
          `}
        />
        {/* Icône à droite (ex: afficher / masquer mot de passe) */}
        {rightIcon && (
          <span className="ml-3 text-gray-400 cursor-pointer flex items-center">
            {rightIcon}
          </span>
        )}
      </div>
      {/* Message d'erreur */}
      {error && (
        <p className="text-red text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
