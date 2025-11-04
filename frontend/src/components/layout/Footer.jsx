import React from "react";
import "../../styles/index.css"; 

export default function Footer() {
  return (
     <footer
      style={{
         backgroundColor: "#4F9DDE1F", //couleur du fond
        display: "flex", //les alligner
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        position: "relative",
      }}
    >
      {/* Texte principal au centre */}
      <p style={{ color: "var(--color-secondary)", textAlign: "center", margin: 0 }}>
        Copy right ©2025{" "}
        <span style={{ color: "var(--color-primary)", fontWeight: "600" }}>
         {"C{}nnect"}
        </span>{" "}
        || all right reserved
      </p>

      {/* Lien à droite */}
      <p
        style={{
          color: "var(--color-secondary)",
          position: "absolute",
          right: "1rem",
          margin: 0,
        }}
      >
        &gt; Politique de réservation
      </p>
    </footer>
  );
}

