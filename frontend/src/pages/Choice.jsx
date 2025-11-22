import React, { useContext } from "react";
import { GraduationCap, UserRound } from "lucide-react";
import IconeLogoComponent from '../components/common/IconeLogoComponent';
import Button from '../components/common/Button';
import { useTranslation } from "react-i18next";
import "../styles/index.css";
import { useNavigate } from "react-router-dom";
import ThemeContext from "../context/ThemeContext";
import LogoComponent from "../components/common/LogoComponent"
import ThemeButton from "../components/common/ThemeButton";

function Choice() {
  const navigate = useNavigate();
  const { t} = useTranslation();
  const {toggleDarkMode } = useContext(ThemeContext);

  return (
    <div className="Choice flex flex-col h-screen bg-grad-5">

      <div className="flex flex-row gap-[1000px]">
         <header className="p-2">
          <LogoComponent />
         </header>

         <ThemeButton onClick={toggleDarkMode}/>
      </div>

      <main className="flex flex-col items-center justify-center flex-1 gap-16 text-center px-4">
        <IconeLogoComponent size="w-28 h-28" />
        <p className="font-poppins text-l sm:text-xl md:text-2xl text-grayc">
          {t("choice.title")} <br />
          {t("choice.title_contd")}
        </p>

        <div className="flex gap-10 md:gap-16">
          <Button
            onClick={() => navigate("/signup/instructor")}
            className="shadow-md rounded-2xl font-semibold font-poppins bg-grad-1 text-1 sm:text-l md:text-l hover:opacity-90 text-white flex w-26 sm:w-38 md:w-46 lg:w-50 items-center justify-center gap-3 px-3 py-3"
          >
            <UserRound /> {t("choice.instructor")}
          </Button>

          <Button
            onClick={() => navigate("/signup/student")}
             className="shadow-md rounded-2xl font-semibold font-poppins bg-grad-1 text-1 sm:text-l md:text-l hover:opacity-90 text-white flex w-26 sm:w-38 md:w-46 lg:w-50 items-center justify-center gap-3 px-3 py-3"
          >
            <GraduationCap /> {t("choice.student")}
          </Button>
        </div>
      </main>
    </div>
  );
}

export default Choice;
