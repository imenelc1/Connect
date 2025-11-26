import React from "react";
import MascotteImg from "../../assets/mascotte.svg";

export default function Mascotte({ width = "", className = "" }) { 
    return( <img src={MascotteImg} alt="Robot Mascotte" 
        className={`${width} z-10 ${className}`} />) }