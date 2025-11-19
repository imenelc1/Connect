import React from 'react';
import { GraduationCap, UserRound } from "lucide-react";
import Icon from '../components/common/Icon';
import Logo from '../components/common/logo';
import Button from '../components/common/Button';
import { useTranslation } from "react-i18next";
import "../styles/index.css";

import { useNavigate } from "react-router-dom";


function Choice() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };
    return (

  
    <div className="Choice flex flex-col h-screen bg-grad-5 bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]">
    

    <header className="p-2">
        <Logo className="w-20 h-30" />
        
    
    </header>

    <main className="flex flex-col items-center justify-center flex-1 
                    gap-16 text-center px-4">
        
        <Icon />

        <p className="font-poppins text-xl sm:text-2xl md:text-3xl text-grayc">
             {t("choice.title")} <br />
               {t("choice.title_contd" )}
        </p>

        <div className="flex gap-10 md:gap-16">
            <Button  onClick={() => navigate("/signup/instructor")}  className="shadow-md rounded-3xl font-bold font-poppins bg-grad-1 
                    text-lg sm:text-xl md:text-2xl hover:opacity-90  text-white
                    flex w-36 sm:w-48 md:w-56 items-center justify-center gap-3 px-29 py-8">
                <UserRound size={24}/>
                 {t("choice.instructor")}
            </Button>

            <Button  onClick={() => navigate("/signup/student")} className="shadow-md rounded-3xl font-bold font-poppins bg-grad-1
                    text-lg sm:text-xl md:text-2xl hover:opacity-90  text-white
                    flex w-36 sm:w-48 md:w-56 items-center justify-center gap-3 px-10 py-4">
                <GraduationCap size={24}/>
                {t("choice.student")}
            </Button>
        </div>
    </main>

    
</div>

    );
}

export default Choice;
