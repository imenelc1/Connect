import React from "react";
import Header from "../common/Header";
import Text from "../common/Text";
import Icon from "../common/Icon";
import { FaPaperPlane } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import IconeLogoComponent from "../common/IconeLogoComponent";

import "../../styles/index.css";
import Button from "../common/Button";


export default function HeroSection() {
  const navigate = useNavigate();
  const { t } = useTranslation("acceuil");
  return (

    <header className="bg-surface min-h-[70vh]  md:min-h-[90vh] flex flex-col  px-8 py-0 md:px-16">
      <Header />
        
<div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-15 md:mt-20">
        <div className="max-w-xl md:max-w-2xl space-y-6">
          <Text />
            
          {/* <div className="flex space-x-4">
            <Button  onClick={() => navigate("/choice")} className=" bg-primary text-white px-12 py-2 rounded-xl font-medium shadow hover:opacity-90 transition flex flex-row items-center gap-2">
           <FaPaperPlane className="text-white text-lg" size={16} />
             {t("acceuil.button_start")}
            </Button>

           <Button className=" border border-primary text-primary bg-white px-12 py-2 rounded-xl font-medium hover:bg-bg transition ">
          {t("acceuil.button_work")}
           </Button > 
          </div> */}
          <div className="flex flex-row space-x-4">
  <Button
    onClick={() => navigate("/choice")}
    className="w-auto px-6 sm:px-8 md:px-12 py-2 md:py-2 bg-grad-1 text-white rounded-xl font-medium shadow hover:opacity-90 transition flex items-center gap-2"
  >
    <FaPaperPlane className="text-white text-lg" size={16} />
    {t("acceuil.button_start")}
  </Button>

  <Button
    className="w-auto px-6 sm:px-8 md:px-12 py-2 md:py-2 border border-primary text-primary bg-white rounded-xl font-medium hover:bg-bg transition"
  >
    {t("acceuil.button_work")}
  </Button>
</div>

     
        </div>

        <IconeLogoComponent size="w-40 h-40"/>
      </div>
    </header>
  );
}
