import React from "react";
import logo from "../../assets/LogoLight.svg";

export default function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <img src={logo} alt="logo" className="w-32 h-32" />
      {/* <span className="text-xl font-bold text-[var(--color-primary)]"></span> */}
    </div>
  );
}