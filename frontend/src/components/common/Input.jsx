import React from "react";

const Input = ({ label, name, value, onChange, type="text", placeholder, icon }) => {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm text-gray-600">{label}</label>
      <div className="flex items-center border border-gray-200 rounded-full px-3 py-2 focus-within:ring-2 focus-within:ring-sky-300">
        {icon && <span className="text-gray-300 text-sm mr-2">{icon}</span>}
        <input
          name={name}
          value={value}
          onChange={onChange}
          type={type}
          placeholder={placeholder}
          className="flex-1 outline-none text-sm bg-transparent"
        />
      </div>
    </div>
  );
};

export default Input;
