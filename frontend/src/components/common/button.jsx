import React from "react";
import "../../styles/index.css";

export default function Button({ children , className=" "}) {
  return (
    // <div className="flex space-x-4">
    //   <button className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl font-medium shadow hover:opacity-90 transition">
    //     Get Started
    //   </button>
    //   <button className="border border-[var(--color-primary)] text-[var(--color-primary)] bg-white px-6 py-3 rounded-xl font-medium hover:bg-[var(--color-bg)] transition">
    //     How it works
    //   </button>
    // </div>
    <button
     className={`${className}`}
    >
      {children}
     
    </button>
  );
}
