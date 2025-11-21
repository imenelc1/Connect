import React from "react";
import { GiAbstract013 } from "react-icons/gi";
import { AiOutlineHeart, AiOutlineBulb } from "react-icons/ai";
import { useTranslation } from "react-i18next";

export default function AboutSection() {
   const { t } = useTranslation();
  return (
    <div className="about-container w-full px-8 md:px-16 py-6 flex flex-col md:flex-row justify-between gap-20 font-poppins bg-surface">
      {/* LEFT SIDE */}
      <div className="about-content flex flex-col gap-3 md:gap-10 w-full md:w-1/2">
        <h1 className="text-4xl font-semibold bg-grad-1 bg-clip-text text-transparent">
          {t("acceuil.aboutTitle")}
        </h1>

        <p className="about-text text-textc text-[1.05rem] w-[70%] leading-relaxed mb-0.5 font-normal">
           {t("acceuil.aboutParagraph1")}
        </p>

        <p className="about-text text-textc text-[1.05rem] w-[70%] leading-relaxed mb-2 font-normal">
          {t("acceuil.aboutParagraph2")}
        </p>

        <p className="about-text text-textc text-[1.05rem] w-[70%] leading-relaxed mb-2 font-normal">
        {t("acceuil.aboutParagraph3")}
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="mission-values flex flex-col gap-10 w-full md:w-1/2 mt-10">
        {/* MISSION */}
        <section className="vision-section flex items-start gap-6">
          <div className="our w-[145px] h-[80px] rounded-xl flex items-center justify-center bg-gradient-to-t from-[#cce0f5] to-white mt-6">
            <GiAbstract013 size={40} className="text-icons_about" />
          </div>

          <div>
            <h2 className="text-[1.8rem] font-semibold mb-4 bg-gradient-to-t from-[#314D91] to-[#4F9DDE] bg-clip-text text-transparent">
              {t("acceuil.missionTitle")}
            </h2>
            <p className="text-lg text-textc leading-relaxed w-[85%]">
             {t("acceuil.missionText")}
            </p>
          </div>
        </section>

        {/* VALUES */}
        <section className="vision-section flex items-start gap-6">
          <div className="our w-[145px] h-[80px] rounded-xl flex items-center justify-center bg-gradient-to-t from-[#cce0f5] to-white mt-6">
            <AiOutlineHeart size={40} className="text-icons_about" />
          </div>

          <div>
            <h2 className="text-[1.8rem] font-semibold mb-4 bg-gradient-to-t from-[#314D91] to-[#4F9DDE] bg-clip-text text-transparent">
            {t("acceuil.valuesTitle")}
            </h2>
            <p className="text-lg text-textc leading-relaxed w-[85%]">
            {t("acceuil.valuesText")}
            </p>
          </div>
        </section>

        {/* VISION */}
        <section className="vision-section flex items-start gap-6">
          <div className="our w-[145px] h-[80px] rounded-xl flex items-center justify-center bg-gradient-to-t from-[#cce0f5] to-white mt-6">
            <AiOutlineBulb size={40} className="text-icons_about" />
          </div>

          <div>
            <h2 className="text-[1.8rem] font-semibold mb-4 bg-gradient-to-t from-[#314D91] to-[#4F9DDE] bg-clip-text text-transparent">
              {t("acceuil.visionTitle")}
            </h2>
            <p className="text-lg text-textc leading-relaxed w-[85%]">
              {t("acceuil.visionText")}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
