
import React from "react";
/* ==================================================
   Composant de liste déroulante réutilisable
   Props :
     - label : texte du label au-dessus du select
     - name : attribut name / id du select
     - value : valeur sélectionnée
     - onChange : callback au changement de valeur
     - options : tableau d’options [{ value, label }]
     - error : message d’erreur (affiché sous le select)
     - placeholder : option par défaut non sélectionnable
================================================== */

export default function Select({ label, name, value, onChange, options = [], error, placeholder }) {
  return (
    <div className="flex flex-col text-black rounded-lg">
      {/*label */}
      {label && <label htmlFor={name} className="text-sm font-medium text-grayc mb-1">{label}</label>}
      {/*select principal */}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`border rounded-2xl p-2 focus:outline-none focus:text-black text-black/50 ${
          error ? "border-red-500" : "border-grayc"
        }`}
      >
        {/* placeholder option si fourni */}
        {placeholder && <option value="">{placeholder}</option>}
        {/* options dynamiques */}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {/* message d'erreur */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}