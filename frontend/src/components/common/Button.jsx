import React from "react";
import "../../styles/index.css";

export default function Button({ children , className=" "}) {
  return (
   
    <button
     className={`${className}`}
    >
      {children}
     
    </button>
  );
}