// //BUTTON CREATE ACCOUNT

// /*import React from "react";
// import "../../styles/index.css"; 

// export default function CreateAccount({ label }) {
//   return (
//     <button className="create-account px-4 py-2 rounded-lg"
//      style={{
//      padding: "8px 16px",               // espace à l'intérieur du bouton
//         borderRadius: "12px",              // coins arrondis
//         background: "var(--color-primary)",// couleur depuis ton index.css
//         color: "white",                     // texte blanc
//         border: "none",                     // pas de bordure
//         cursor: "pointer",                  // curseur main au survol
//         fontWeight: "500",                  // texte semi-bold
//         fontSize: "1rem",                   // taille du texte
//       }}
//     >
//       {label}  
// {/* label pour pouvoir l'utiliser un peu partout et lui donner nimporte quelle val }
//     </button>
//   );
//  }*/
// import { FaArrowRight } from "react-icons/fa";

// export default function CreateAccountButton() {
//   return (
//     <button
//       style={{
//         background: "var(--color-primary)",
//         color: "white",
//         border: "none",
//         borderRadius: "0.5rem",
//         padding: "0.7rem 1.5rem",
//         display: "flex",
//         alignItems: "center",
//         gap: "0.5rem",
//         cursor: "pointer",
//         fontWeight: "600",
//       }}
//     >
//       Create Account <FaArrowRight />
//     </button>
//   );
// }
import React from "react";
import "../../styles/index.css";
import { FiArrowRight } from "react-icons/fi";

export default function ButtonCA() {
  return (
    <button className="flex items-center space-x-2 bg-gradient-to-r from-[#4F9DDE] to-[#A3AAED] text-white px-4 py-2 rounded-full shadow-md hover:opacity-90 transition">
      <span>Create Account</span>
      <FiArrowRight size={18} />
    </button>
  );
}
