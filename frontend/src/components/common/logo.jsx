

import React from "react";
import logo from "../../assets/LogoLight.svg";

export default function Logo() {
  return (
    <div className="flex-shrink-0 ">
      <img src={logo} alt="logo" className="w-16 h-16 md:w-20 md:h-20 lg:w-28 lg:h-28" />
      {/* <span className="text-xl font-bold text-[var(--color-primary)]"></span> */}
    </div>
  );
}

 