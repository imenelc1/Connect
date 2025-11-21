import React from "react";
import LogoIconeLight from "../../assets/LogoIconeLight.svg";

export default function Icon() {

  return (
    <div className="mt-[-3rem] md:mt-[-8rem] "> {/* 🟢 monte légèrement l’image */}
      <img
        src={LogoIconeLight}
        alt="Icon"
        className="w-32 md:w-44 h-auto drop-shadow-lg"
      />
    </div>
  );
}
