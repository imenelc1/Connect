import { useContext } from "react";
import ThemeContext from "../../context/ThemeContext";
import LogoLight from "../../assets/LogoLight.svg"
import LogoDark from "../../assets/LogoDark.svg"

function LogoComponent() {
  const { darkMode } = useContext(ThemeContext);

  return (
    <img
      src={darkMode ? LogoDark : LogoLight}
      alt="Logo"
      className="w-20 h-20 sm:w-28 sm:h-28 md:w-28 md:h-28 ml-4"
    />
  );
}

export default LogoComponent;
