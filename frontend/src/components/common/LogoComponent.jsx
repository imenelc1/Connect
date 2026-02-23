
import { useContext } from "react";
import ThemeContext from "../../context/ThemeContext.jsx";

// Logos pour dark / light mode
import LogoLight from "../../assets/LogoLight.svg";
import LogoDark from "../../assets/LogoDark.svg";
// Composant affichant le logo en fonction du thème
function LogoComponent({ className = "" }) {
  const { darkMode } = useContext(ThemeContext);// Récupère l'état du thème depuis le contexte

  return (
    <img
      src={darkMode ? LogoDark : LogoLight}
      alt="Logo"
      className={`w-20 h-20 sm:w-28 sm:h-28 md:w-28 md:h-28 lg:w-32 lg:h-32 ${className}`}
    />
  );
}


export default LogoComponent;