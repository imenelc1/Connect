import React from "react";
import "../../styles/index.css";
export default function Text() {
  return (
    <div className="space-y-6">
      {/* Grand titre */}
      <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
        <span  className="text-[var(--color-primary)]">A</span>{" "}
        <span style={{ color: "#A3AAED36" }} className=" drop-shadow-md">Smarter Way</span>{" "}
        <span className="text-[var(--color-primary)]">To</span>
        <br />
        <span className="text-[var(--color-primary)]">Learn </span>
        <span style={{ color: "#A3AAED36" }} className="drop-shadow-md">C</span>
      </h1>

      {/* Texte descriptif */}
      <p className="text-[var(--color-text-main)] text-lg leading-relaxed max-w-lg">
        Empowering Students And Teachers To Learn, Teach, And Collaborate
        Around C Programming.
      </p>
    </div>
  );
}
