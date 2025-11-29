
import React from "react";
import LogoIconeLight from "../../assets/LogoIconeLight.svg";

export default function Icon() {
  return (
    <div className="mt-[-3rem] md:mt-[-8rem]">
      {/* 
        L'image est remontée vers le haut avec une marge négative.
        - version mobile : -3rem
        - version desktop : -8rem
      */}
      <img
        src={LogoIconeLight}
        alt="Icon"
        className="w-32 md:w-44 h-auto drop-shadow-lg"
      />
    </div>
  );
}
