import React from "react";
import "../../styles/index.css";
export default function Text() {
  return (
    <div className="space-y-6 ">
      {/* Grand titre */}
      <h1 className="text-5xl md:text-6xl font-bold leading-tight text-3d">
        <span  className="text-primary">A</span>{" "}
        <span className="text-secondary text-3d">Smarter Way</span> {" "}
        <span className="text-primary">To</span> {" "}
       
        <span className="text-primary">Learn </span> {" "}
        <span className="text-secondary text-3d" >C</span> {" "}
         <span className="text-primary">and </span> {" "}
          <span className="text-primary">Algorithms </span>
      </h1>

      {/* Texte descriptif */}
      <p className="text-textc text-lg leading-relaxed max-w-lg font-regular">
        Empowering Students And Teachers To Learn, Teach, And Collaborate
        Around C Programming.
      </p>
    </div>
  );
}
