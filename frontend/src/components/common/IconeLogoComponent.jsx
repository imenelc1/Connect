import { useContext } from "react";
import ThemeContext from "../../context/ThemeContext.jsx";

// Logos thème clair / sombre
import LogoIconeLight from "../../assets/LogoIconeLight.svg";
import LogoIconeDark from "../../assets/LogoIconeDark.svg";

function IconeLogoComponent({ size = "w-20 h-20", className = "" }) {
  const { darkMode } = useContext(ThemeContext);

  return (
    <img
      src={darkMode ? LogoIconeDark : LogoIconeLight}
      alt="Logo"
      className={`${size} ${className} ml-4`}
    />
  );
}

export default IconeLogoComponent;