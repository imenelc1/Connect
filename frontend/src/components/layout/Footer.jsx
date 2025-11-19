import React from "react";
import "../../styles/index.css"; 

export default function Footer() {
  return (
     <footer   className="bg-surface  w-screen py-4 flex flex-col md:flex-row
        items-center justify-between
        px-6 py-4
        text-center md:text-center
        "
      
    >
      {/* Texte principal au centre */}
      <p className= " text-secondary md:text-center m-0" >
        Copy right ©2025{" "}
        <span className="text-primary font-semibold" >
         {"C{}nnect"}
        </span>{" "}
        || all right reserved
      </p>

      {/* Lien à droite */}
      <p className="text-secondary mt-2 md:mt-0 cursor-pointer" >
        &gt; Politique de réservation
      </p>
    </footer>
  );
}

