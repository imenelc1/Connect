import { useEffect, useContext } from "react";
import ThemeContext from "./ThemeContext";

export default function DarkModeHandler() {
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  return null;
}
