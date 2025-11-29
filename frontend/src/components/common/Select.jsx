
import React from "react";

export default function Select({ label, name, value, onChange, options = [], error, placeholder }) {
  return (
    <div className="flex flex-col text-black rounded-lg">
      {label && <label htmlFor={name} className="text-sm font-medium text-grayc mb-1">{label}</label>}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`border rounded-2xl p-2 focus:outline-none focus:text-black text-black/50 ${
          error ? "border-red-500" : "border-grayc"
        }`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}