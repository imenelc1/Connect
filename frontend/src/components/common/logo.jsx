// import React from "react";
// import LogoLight from "../../assets/LogoLight.svg";



//  export default function Logo({ darkmode }) {//le composant du logo, prop(parametre) donner au composant pour qu'il change de comportement (c'est un booleen)
 
//     return (
//         <img 
//         src={LogoLight} 
//         alt= "logo" 
//        style={{ width: "120px", height: "auto" }}
    
//         />
//     );
// } 

import React from "react";
import logo from "../../assets/LogoLight.svg";

export default function Logo({ className = "" }) {
  return (
    <div className="flex items-center space-x-2">
      <img src={logo} alt="logo"className={`w-40 h-auto ${className}`} />
      {/* <span className="text-xl font-bold text-[var(--color-primary)]"></span> */}
    </div>
  );
}

 