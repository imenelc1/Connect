import React from "react";
import "../../styles/index.css";

export default function Button({
  children,
  className = "",
  type = "button",
  variant = "",
  onClick,
  ...props
}) {
  // styles par défaut si on utilise "variant"
  const base = "w-auto inline-flex items-center justify-center rounded-full py-2 px-4 text-sm font-medium transition";

  const variants = {
    primary: `${base} bg-sky-500 text-white hover:bg-sky-600`,
    outline: `${base} border border-gray-200 bg-white text-gray-700 hover:shadow`,
  };

  // si variant existe → utiliser variants, sinon → className normal
  const finalClass =
    variant && variants[variant] ? variants[variant] : className;

  return (
    <button type={type} onClick={onClick} className={finalClass} {...props}>
      {children}
    </button>
  );
}
