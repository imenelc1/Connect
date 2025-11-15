import React from "react";
import "../../styles/index.css";

export default function Button({ children, className = "", ...props }) {
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
} 