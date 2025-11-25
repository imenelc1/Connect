import React from "react";
import LogoLight from "../../assets/LogoLight.svg";

export default function Topbar({ rightButton }) {
  return (
    <div className="flex items-center justify-between w-full px-6 py-4 bg-transparent">
      
      {/* LEFT — LOGO + Curriculum */}
      <div className="flex items-center gap-4">
        <img
          src={LogoLight}
          alt="logo"
          className="w-10 h-10 object-contain"
        />
        <span className="text-[#2B3A67] font-semibold text-lg">
          Curriculum
        </span>
      </div>

      {/* RIGHT — Custom Button (optional) */}
      {rightButton && (
        <button className="px-5 py-2 bg-primary text-white rounded-xl shadow text-sm">
          {rightButton}
        </button>
      )}
    </div>
  );
}
