import React from "react";
import LogoIconeLight from "../../assets/LogoIconeLight.svg";

export default function Icon() {

  return (
    <div className="hidden md:block mt-[-8rem] lg:mt-[-10rem]"> {/* 🟢 monte légèrement l’image */}
      <img
        src={LogoIconeLight}
        alt="Icon"
        className="w-32 md:w-44 h-auto drop-shadow-lg"
      />
    </div>
  );
}
