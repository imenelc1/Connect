
import { useContext } from "react";
import ThemeContext from "../../context/ThemeContext";

// Logos thème clair / sombre
import LogoIconeLight from "../../assets/LogoIconeLight.svg";
import LogoIconeDark from "../../assets/LogoIconeDark.svg";

function IconeLogoComponent({ size = "w-20 h-20" }) {
  // On récupère l'état du mode sombre depuis le contexte global
  const { darkMode } = useContext(ThemeContext);

  return (
    <img
      // Choix dynamique du logo selon dark/light mode
      src={darkMode ? LogoIconeDark : LogoIconeLight}
      alt="Logo"
      /* 
        Taille configurable via props :
        - par défaut : w-20 h-20
        - peut être changée par le parent
      */
      className={`${size} ml-4`}
    />
  );
}

export default IconeLogoComponent;
