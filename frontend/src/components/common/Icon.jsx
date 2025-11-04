// import React from "react";
// import LogoLight from "../../assets/LogoIconeLight";



//  export default function Icon({ darkmode }) {//le composant du logo, prop(parametre) donner au composant pour qu'il change de comportement (c'est un booleen)
 
//     return (
//         <img 
//         src={LogoIconLight} 
//         alt= "icon" 
//         className="w-56 h-auto drop-shadow-lg" 
    
//         />
//     );
// } 


 import React from "react";
import LogoIconeLight from "../../assets/LogoIconeLight.svg";

export default function Icon() {
  return (
    <div className="mt-10 md:mt-0">
      <img
        src={LogoIconeLight}
        alt=" Icon"
        className="w-48 md:w-32 md:w-64 md:h-40  drop-shadow-lg "
      
      />
    </div>
  );
}
