
import React from "react";
import CodeBlock from "../common/CodeBlock";        // Bloc de code illustratif
import mascotte from "../../assets/mascotte.svg";  // Image mascotte/robot
import CardsSection from "../common/CardsSection";  // Section des fonctionnalités
import AboutSection from "../ui/AboutSection";      // Section "À propos"
import "../../styles/index.css";

export default function Body() {
  return (
    <section className="py-20 bg-[var(--color-surface)] flex flex-col items-center gap-16 w-full max-w-[1400px] mx-auto px-6">
      
      {/* ---------------------- PARTIE 1 : Code + Mascotte ---------------------- */}
      <div className="flex flex-row items-center justify-center gap-0">

        {/* Bloc de code */}
        <div className="md:-translate-y-10">
          <CodeBlock />
        </div>

        {/* Mascotte/Robot à côté du code */}
        <img
          src={mascotte}
          alt="Robot"
          className="w-44 md:w-56 md:translate-y-12"
        />
      </div>

      {/* ----------------------  PARTIE 2 : About Section ---------------------- */}
      <AboutSection />

      {/* ---------------------- PARTIE 3 : Cards Section ---------------------- */}
      <div className="w-full">
        <CardsSection />
      </div>

    </section>
  );
}